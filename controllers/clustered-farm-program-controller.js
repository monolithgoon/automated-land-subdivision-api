`use strict`;
const chalk = require(`../utils/chalk-messages.js`);
const ServerError = require(`../utils/server-error.js`);
const CLUSTERED_FARM_PROGRAM_MODEL = require("../models/clustered-farm-program-model");
const {
	getAllDocuments,
	insertDocumentIfNotExists,
} = require("./handler-factory");
const { _catchSyncError } = require("../utils/helpers.js");
const catchAsyncServer = require("../utils/catch-async");
const CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL = require("../models/clustered-farm-program-feat-coll-model.js");

exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ insertFarmProgram ] CONTROLLER FN.`));

	// Check if req.body is not null or undefined
	if (req.body ?? false) {
		const programId = req.body.farm_program_id;

		// REMOVE
		// try {
		//   // Check if a document with the program_id already exists
		//   const dbFarmProgramDoc = await findOneDocument(CLUSTERED_FARM_PROGRAM_MODEL, { farm_program_id: programId });

		//   if (dbFarmProgramDoc) {
		//     // A document with the program_id already exists, return an error
		//     return next(new ServerError(`A document with this program_id <${programId}> already exists in the database`, 409));
		//   }

		//   // Insert the new farm program into the database
		//   const newFarmProgramDoc = await CLUSTERED_FARM_PROGRAM_MODEL.create(req.body);

		// 	// Extract the object created by the `model.create()` operation
		// 	const newFarmProgramObj = newFarmProgramDoc.toObject();

		// 	// Append it to the the `req.locals` obj
		// 	req.locals.appendedFarmProgram = newFarmProgramObj;

		//   next();

		// } catch (error) {
		//   // Handle any errors thrown by findOneDocument or CLUSTERED_FARM_PROGRAM_MODEL.create
		//   return next(new ServerError(`Problem inserting new document in database: ${error.message}`, 500));
		// }

		const newFarmProgramDoc = await insertDocumentIfNotExists(
			CLUSTERED_FARM_PROGRAM_MODEL,
			{ farm_program_id: programId },
			req.body,
			next
		);

		if (!newFarmProgramDoc) throw new ServerError(`Something went wrong`, 500);

		// Extract the object created by the `model.create()` operation
		const newFarmProgramObj = newFarmProgramDoc.toObject();

		// Append it to the the `req.locals` obj
		req.locals.appendedFarmProgram = newFarmProgramObj;

		next();

	} else {
		// req.body is null or undefined, do nothing
		next();
	}
}, `inertFarmProgram`);

function getFarmerCloudImageUrl(farmerId, base64Image, cloudService) {
	const cloudUrl = `https://cloudinary.com/${farmerId}`;
	return cloudUrl;
}
// const getFarmerCloudImageUrl = catchAsyncError(async (farmerId, base64Image, cloudService) => {
// 	const cloudUrl = `https://cloudinary.com/${farmerId}`;
// 	return cloudUrl;
// }, `getFarmerCloudImageUrl`);

exports.getFarmerBiodataUrls = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ storeFarmersBiodata ] CONTROLLER FN. `));

	const farmProgram = req.locals.appendedFarmProgram;

	if (!farmProgram) {
		return next(new ServerError(`Something went wrong`, 500));
	}

	const updatedFarmers = [];

	if (farmProgram.farm_program_farmers) {
		
		farmProgram.farm_program_farmers.forEach((farmer) => {

			// Get farmer cloud photo URL
			// const globalFarmerId = farmer["farmer_bio_data"]["farmer_global_id"];
			const { farmer_global_id: globalFarmerId } = farmer.farmer_bio_data;
			// const farmerBase64Image = farmer["farmer_bio_data"]["farmer_image_base64"];
			const { farmer_image_base64: farmerBase64Image } = farmer.farmer_bio_data;
			const farmerCloudImageUrl = getFarmerCloudImageUrl(globalFarmerId, farmerBase64Image, {});

			// Store the `farmer_bio_data` object in a variable
			const farmerBiodata = farmer.farmer_bio_data;

			/**
			 * Create a new empty object {} and then use Object.assign() to copy the properties from `farmerBiodata` into the new object.
			 * Then add the `farmer_cloud_image_url` field with the value of `farmerCloudImageUrl`.
			 */
			const updatedFarmerBiodata = Object.assign({}, farmerBiodata, {
				farmer_cloud_image_url: farmerCloudImageUrl,
			});

			console.log({ updatedFarmerBiodata });

			// TODO
			// Insert in farmer bio data database
			const globalFarmerUrl = `https://geoclusters.com/farmers/farmer/${globalFarmerId}`;

			const updatedProgramFarmer = {
				...farmer,
				farmer_global_id: farmer.farmer_global_id,
				farm_program_farmer_id: farmer.farm_program_farmer_id,
				farmer_url: globalFarmerUrl,
				farmer_funding_timeline: farmer.farmer_funding_timeline,
				farmer_farm_details: farmer.farmer_farm_details,
				farmer_farm_practice: farmer.farmer_farm_practice,
			};
			// console.log({ updatedProgramFarmer });
			updatedFarmers.push(updatedProgramFarmer);
		});
	}

	const updatedFarmProgram = {
		...farmProgram,
		farm_program_farmers: updatedFarmers,
	};

	req.locals.updatedFarmProgram = updatedFarmProgram;

	// Pass control to the next middleware or controller
	next();
}, `getFarmerBiodataUrls`);

function createFeatureCollection(farmProgramJSON) {
	// Eliminate the `farm_project_farmers` field
	const filteredFarmProgramJSON = Object.fromEntries(
		Object.entries(farmProgramJSON).filter(([key, value]) => key !== "farm_program_farmers")
	);

	// Init a FeatureCollection for the farm program
	const featureCollection = {
		type: "FeatureCollection",
		// "features": [],
		features: [],
		properties: filteredFarmProgramJSON,
	};

	// Create a MultiPoint feature based on each farmer
	farmProgramJSON.farm_program_farmers.forEach((farmer) => {
		const feature = {
			type: "Feature",
			geometry: {
				type: "MultiPoint",
				coordinates: farmer["farmer_farm_details"].farm_coordinates,
			},
			properties: farmer,
			// properties: Object.entries(farmer["farmer_farm_details"]).filter(([key, value]) => key !== "farm_coordinates"),
		};

		const updatedFeature = {
			...feature,
			properties: {
				farm_program_farmer_id: farmer["farm_program_farmer_id"],
				farmer_url: farmer["farmer_url"],
				farmer_farm_details: Object.fromEntries(
					Object.entries(farmer["farmer_farm_details"]).filter(
						([key, value]) => key !== "farm_coordinates"
					)
				),
				farmer_farm_practice: farmer["farmer_farm_practice"],
				farmer_funding_timeline: farmer["farmer_funding_timeline"],
			},
		};

		//
		featureCollection.features.push(updatedFeature);
	});

	return featureCollection;
}

exports.convertFarmProgramToGeoJson = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ convertFarmProgramToGeoJson ] CONTROLLER FN. `));

	// const farmProgram = req.locals.appendedFarmProgram;
	const farmProgram = req.locals.updatedFarmProgram;

	if (!farmProgram)
		return next(
			new ServerError(`Something went wrong: can't find <req.locals.appendedFarmProgram>`, 500)
		);

	const farmProgramFeatColl = createFeatureCollection(farmProgram);

	req.locals.appendedFarmProgramFeatColl = farmProgramFeatColl;

	next();
}, `convertFarmProgramToGeoJson`);

exports.insertFarmProgramGeoJson = catchAsyncServer(async (req, res, next) => {

	console.log(chalk.success(`CALLED [ insertFarmProgramGeoJson ] CONTROLLER FN. `));

	const farmProgramFeatColl = req.locals.appendedFarmProgramFeatColl;

	if (!farmProgramFeatColl)
		throw new ServerError(
			`Something went wrong: can't find <req.locals.appendedFarmProgramFeatColl>`,
			500
		);

	if (farmProgramFeatColl ?? false) {
		const programId = farmProgramFeatColl.properties["farm_program_id"];
		// res.status(201).json({
		// 	status: `success`,
		// 	inserted_at: req.requestTime,
		// 	data: farmProgramFeatColl,
		// });
		const newFarmProgramFeatCollDoc = await insertDocumentIfNotExists(CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL, { "properties.farm_program_id": programId }, farmProgramFeatColl, next);

		if (!newFarmProgramFeatCollDoc) throw new ServerError(`Something went wrong`, 500);

		// Extract the object created by the `model.create()` operation
		const newFarmProgramFeatColl = newFarmProgramFeatCollDoc.toObject();

		// 
		res.status(201).json({
			status: `success`,
			inserted_at: req.requestTime,
			data: newFarmProgramFeatColl,
		});		

	} else {
		// farmProgramFeatColl is null or undefined; inform the user
		res.status(400).json({
			status: `fail`,
			message: `The insert operation failed`
		});		
	}
}, `insertFarmProgramGeoJson`);

exports.getAllFarmPrograms = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED the [ getAllFarmPrograms ] CONTROLLER FN. `));
	const clusteredFarmPrograms = await getAllDocuments(req, CLUSTERED_FARM_PROGRAM_MODEL);
	res.status(200).json({
		status: `success`,
		requested_at: req.requestTime,
		num_docs: clusteredFarmPrograms.length,
		data: {
			collection_name: `clustered-farm-programs`,
			collection_docs: clusteredFarmPrograms,
			docs_count: clusteredFarmPrograms.length,
		},
	});
}, `getAllFarmPrograms`);

exports.getFarmProgram = catchAsyncServer(async (req, res, next) => {}, `getFarmProgram`);

exports.getAllProcessedFarmPrograms = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED the [ getAllFarmPrograms ] CONTROLLER FN. `));
	const clusteredFarmProgramFeatureCollections  = await getAllDocuments(req, CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL);
	res.status(200).json({
		status: `success`,
		requested_at: req.requestTime,
		num_docs: clusteredFarmProgramFeatureCollections.length,
		data: {
			collection_name: `clustered-farm-programs`,
			collection_docs: clusteredFarmProgramFeatureCollections ,
			docs_count: clusteredFarmProgramFeatureCollections.length,
		},
	});
},
`getAllProcessedFarmPrograms`);

exports.getProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {},
`getProcessedFarmProgram`);
