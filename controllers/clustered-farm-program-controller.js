`use strict`;
const chalk = require(`../utils/chalk-messages.js`);
const ServerError = require(`../utils/server-error.js`);
const CLUSTERED_FARM_PROGRAM_MODEL = require("../models/clustered-farm-program-model");
const catchAsyncServer = require("../utils/catch-async");
const { findOneDocument, getAllDocuments } = require("./handler-factory");
const { _catchSyncError } = require("../utils/helpers.js");
const catchAsyncError = require("../utils/catch-async");

exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
	
  console.log(`CALLED [ insertFarmProgram ] CONTROLLER FN.`);

  // Check if req.body is not null or undefined
  if (req.body ?? false) {

		// REMOVE
    // Append the un-inserted farm program to req.locals
    // req.locals.appendedFarmProgram = req.body;

    const programId = req.body.farm_program_id;

    try {
      // Check if a document with the program_id already exists
      const existingFarmProgram = await findOneDocument(CLUSTERED_FARM_PROGRAM_MODEL, { farm_program_id: programId });
			
      if (existingFarmProgram) {
        // A document with the program_id already exists, return an error
        return next(new ServerError(`A document with this program_id <${programId}> already exists in the database`, 409));
      }

      // Insert the new farm program into the database
      const newFarmProgramDoc = await CLUSTERED_FARM_PROGRAM_MODEL.create(req.body);

			// Extract the object created by the `model.create()` operation
			const newFarmProgramObj = newFarmProgramDoc.toObject();
			
			// Append it to the the `req.locals` obj
			req.locals.appendedFarmProgram = newFarmProgramObj;

      next();
			
    } catch (error) {
      // Handle any errors thrown by findOneDocument or CLUSTERED_FARM_PROGRAM_MODEL.create
      return next(new ServerError(`Problem inserting new document in database: ${error.message}`, 500));
    }
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
			const globalFarmerId = farmer["farmer_bio_data"]["farmer_global_id"];
			console.log({ globalFarmerId });
			const farmerBase64Image = farmer["farmer_bio_data"]["farmer_image_base64"];
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
			const globalFarmerUrl = `https://geoclusters.com/farmers/farmer/1234567`;

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
	const filteredFarmProgramJSON = Object.fromEntries(Object.entries(farmProgramJSON).filter(([key, value]) => key !== "farm_program_farmers"));

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
				farmer_farm_details: Object.fromEntries(Object.entries(farmer["farmer_farm_details"]).filter(
					([key, value]) => key !== "farm_coordinates")
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

	const farmProgramGeoJSON = createFeatureCollection(farmProgram);

	req.locals.appendedFarmProgramGeoJSON = farmProgramGeoJSON;

	next();
}, `convertFarmProgramToGeoJSOn`);

exports.insertProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ insertProcessedFarmProgram ] CONTROLLER FN. `));
	const farmProgramGeoJSON = req.locals.appendedFarmProgramGeoJSON;
	if (!farmProgramGeoJSON)
		throw new ServerError(
			`Something went wrong: can't find <req.locals.appendedFarmProgramGeoJSON>`,
			500
		);
	if (farmProgramGeoJSON) {
		res.status(201).json({
			status: `success`,
			inserted_at: req.requestTime,
			data: farmProgramGeoJSON,
		});
	}
}, `insertProcessedFarmProgram`);

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

exports.getAllProcessedFarmPrograms = catchAsyncServer(async (req, res, next) => {},
`getAllProcessedFarmPrograms`);

exports.getProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {},
`getProcessedFarmProgram`);
