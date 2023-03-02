`use strict`;
const chalk = require(`../utils/chalk-messages.js`);
const ServerError = require(`../utils/server-error.js`);
const CLUSTERED_FARM_PROGRAM_MODEL = require("../models/clustered-farm-program-model");
const {
	getAllDocuments,
	insertDocumentIfNotExists,
} = require("./handler-factory");
const { _catchSyncError, _catchAsyncError } = require("../utils/helpers.js");
const catchAsyncServer = require("../utils/catch-async-server.js");
const CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL = require("../models/clustered-farm-program-feat-coll-model.js");
const FARMER_BIODATA_MODEL = require("../models/farmer-biodata-model.js");

exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ insertFarmProgram ] CONTROLLER FN.`));

	// Check if req.body is not null or undefined
	if (req.body ?? false) {

		const farmProgramId = req.body.farm_program_id;

		// REMOVE
		// try {
		//   // Check if a document with the program_id already exists
		//   const dbFarmProgramDoc = await findOneDocument(CLUSTERED_FARM_PROGRAM_MODEL, { farm_program_id: farmProgramId });

		//   if (dbFarmProgramDoc) {
		//     // A document with the program_id already exists, return an error
		//     return next(new ServerError(`A document with this program_id <${farmProgramId}> already exists in the database`, 409));
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
			{ farm_program_id: farmProgramId },
			req.body,
			next
		);

		if (!newFarmProgramDoc) return next(new ServerError(`Failed to insert the new farm program payload`, 500));

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

const getFarmerCloudImageUrl = _catchAsyncError(async (farmerId, base64Image, cloudService) => {
	const cloudUrl = `https://cloudinary.com/${farmerId}`;
	return cloudUrl;
}, `getFarmerCloudImageUrl`);

// A helper function to update the farmer biodata object with the new image URL
function updateFarmerBiodata(farmerBiodata, farmerCloudImageUrl) {
	
	// // Store the `farmer_bio_data` object in a variable
	// const farmerBiodata = farmer.farmer_bio_data;	
	
	// /**
	//  * Create a new empty object {} and then use Object.assign() to copy the properties from `farmerBiodata` into the new object.
	//  * Then add the `farmer_cloud_image_url` field with the value of `farmerCloudImageUrl`.
	//  */
	// const updatedFarmerBiodata = Object.assign({}, farmerBiodata, {
	// 	farmer_cloud_image_url: farmerCloudImageUrl,
	// });
	
  return {
    ...farmerBiodata,
    farmer_cloud_image_url: farmerCloudImageUrl,
  };
}

// REMOVE > DEPRECATED
// async function uploadFarmerBiodata(updatedFarmerBiodata, nextFn) {

// 	console.log({ updatedFarmerBiodata })

// 	if (updatedFarmerBiodata ?? false) {

// 		const globalFarmerId = updatedFarmerBiodata.farmer_global_id;
		
// 		// Insert farmer biodata into database
// 		const newFarmerDoc = await insertDocumentIfNotExists(FARMER_BIODATA_MODEL, { farmer_global_id: globalFarmerId }, updatedFarmerBiodata, nextFn);

// 		if (!newFarmerDoc) return nextFn(new ServerError(`Failed to insert the new farmer`, 500));

// 		// Extract the object created by the `model.create()` operation
// 		const newFarmerObj = newFarmerDoc.toObject();

// 		console.log({ newFarmerObj })

// 		// // Send server response
// 		// res.status(201).json({
// 		// 	status: `success`,
// 		// 	inserted_at: req.requestTime,
// 		// 	data: newFarmerObj,
// 		// });		

// 	} else {
// 		// updatedFarmerBiodata is null or undefined; inform the user
// 		// res.status(400).json({
// 		// 	status: `fail`,
// 		// 	message: `The insert operation failed`
// 		// });		
// 		return nextFn(new ServerError(`Something went wrong: <updatedFarmerBiodata> is "null" or "undefined"`))
// 	}

// 	// If all is successful w/out errors, construct a URL to retreive farmer's biodata
// 	const farmerGlobalUrl = `https://geoclusters.com/farmers/farmer/${updatedFarmerBiodata.farmer_global_id}`;

// 	return farmerGlobalUrl;	
// }

const uploadFarmerBiodata = _catchAsyncError(async(updatedFarmerBiodata, nextFn) => {

		if (!updatedFarmerBiodata) {
			throw new ServerError(`Something went wrong: <updatedFarmerBiodata> is "null" or "undefined"`);
		}

		console.log({ updatedFarmerBiodata })

		const globalFarmerId = updatedFarmerBiodata.farmer_global_id;

		// Insert farmer biodata into database
		const newFarmerDoc = await insertDocumentIfNotExists(FARMER_BIODATA_MODEL, { farmer_global_id: globalFarmerId }, updatedFarmerBiodata, nextFn);

		if (!newFarmerDoc) {
			throw new ServerError(`Failed to insert the new farmer biodata payload`, 500);
		}

		// Extract the object created by the `model.create()` operation
		const newFarmerObj = newFarmerDoc.toObject();

		// If all is successful without errors, construct a URL to retrieve the farmer's biodata
		const newFarmerGlobalUrl = `https://geoclusters.com/farmers/farmer/${updatedFarmerBiodata.farmer_global_id}`;

		return {
			status: "success",
			inserted_at: new Date(),
			data: { new_farmer: newFarmerObj, new_farmer_global_url: newFarmerGlobalUrl },
		};

	}, `uploadFarmerBiodata`)

// A helper function to update the farmer object with the new image URL and other fields
function updateProgramFarmer(farmer, farmerGlobalUrl, farmerCloudImageUrl) {

  return {
    ...farmer,
    farmer_global_id: farmer.farmer_global_id,
    farm_program_farmer_id: farmer.farm_program_farmer_id,
    farmer_url: farmerGlobalUrl,
    farmer_funding_timeline: farmer.farmer_funding_timeline,
    farmer_farm_details: farmer.farmer_farm_details,
    farmer_farm_practice: farmer.farmer_farm_practice,
    farmer_cloud_image_url: farmerCloudImageUrl,
  };
};

async function updateFarmProgram (farmProgram, nextFn) {

  const updatedFarmers = [];

  if (farmProgram.farm_program_farmers) {

    // Loop through each farmer in the program and update their biodata and image URL
    for (const farmer of farmProgram.farm_program_farmers) {
      
			// const globalFarmerId = farmer["farmer_bio_data"]["farmer_global_id"];
      const { farmer_global_id: globalFarmerId } = farmer.farmer_bio_data;

			const farmerBase64Image = farmer["farmer_bio_data"]["farmer_image_base64"];
			// const { farmer_image_base64: farmerBase64Image } = farmer.farmer_bio_data;

      // const farmerCloudImageUrl = getFarmerCloudImageUrl(globalFarmerId, farmerBase64Image, {});
      const farmerCloudImageUrl = await getFarmerCloudImageUrl(globalFarmerId, farmerBase64Image, {});

      const updatedFarmerBiodata = updateFarmerBiodata(farmer.farmer_bio_data, farmerCloudImageUrl);

			const { data: { new_farmer_global_url: newFarmerGlobalUrl }} = await uploadFarmerBiodata(updatedFarmerBiodata, nextFn)

      const updatedProgramFarmer = updateProgramFarmer(farmer, newFarmerGlobalUrl, farmerCloudImageUrl);

      updatedFarmers.push(updatedProgramFarmer);
    }
  }

  const updatedFarmProgram = {
    ...farmProgram,
    farm_program_farmers: updatedFarmers,
  };

	return updatedFarmProgram;
}

exports.updateFarmersInProgram = catchAsyncServer(async (req, res, next) => {

	console.log(chalk.success(`CALLED [ updateFarmersInProgram ] CONTROLLER FN. `));

	const farmProgram = req.locals.appendedFarmProgram;

	if (!farmProgram) {
		return next(new ServerError(`Something went wrong: could not get <req.locals.appendedFarmProgram>`, 500));
	}

	const updatedFarmProgram = await updateFarmProgram(farmProgram, next);

	req.locals.updatedFarmProgram = updatedFarmProgram;

	// Pass control to the next middleware or controller
	next();

}, `updateFarmProgram`);

// REMOVE > DEPRECATED FOR `updateFarmProgram
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
			const farmerGlobalUrl = `https://geoclusters.com/farmers/farmer/${globalFarmerId}`;

			const updatedProgramFarmer = {
				...farmer,
				farmer_global_id: farmer.farmer_global_id,
				farm_program_farmer_id: farmer.farm_program_farmer_id,
				farmer_url: farmerGlobalUrl,
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
			new ServerError(`Something went wrong: can't find <req.locals.updatedFarmProgram>`, 500)
		);

	const farmProgramFeatColl = createFeatureCollection(farmProgram);

	req.locals.appendedFarmProgramFeatColl = farmProgramFeatColl;

	next();
}, `convertFarmProgramToGeoJson`);

exports.insertFarmProgramGeoJson = catchAsyncServer(async (req, res, next) => {

	console.log(chalk.success(`CALLED [ insertFarmProgramGeoJson ] CONTROLLER FN. `));

	const farmProgramFeatColl = req.locals.appendedFarmProgramFeatColl;

	if (!farmProgramFeatColl)
		return next(new ServerError(
			`Something went wrong: can't find <req.locals.appendedFarmProgramFeatColl>`,
			500
		));

	if (farmProgramFeatColl ?? false) {

		const farmProgramId = farmProgramFeatColl.properties["farm_program_id"];

		const newFarmProgramFeatCollDoc = await insertDocumentIfNotExists(CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL, { "properties.farm_program_id": farmProgramId }, farmProgramFeatColl, next);

		if (!newFarmProgramFeatCollDoc) return next(new ServerError(`Failed to insert the new farm program FeatureCollection`, 500));

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
