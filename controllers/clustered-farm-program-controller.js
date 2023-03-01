`use strict`;
const chalk = require(`../utils/chalk-messages.js`);
const ServerError = require(`../utils/server-error.js`);
const CLUSTERED_FARM_PROGRAM_MODEL = require("../models/clustered-farm-program-model");
const catchAsyncServer = require("../utils/catch-async");
const { findOneDocument, getAllDocuments } = require("./handler-factory");
const { _catchSyncError } = require("../utils/helpers.js");
const catchAsyncError = require("../utils/catch-async");

exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ insertFarmProgram ] CONTROLLER FN. `));
	const programId = req.body.farm_program_id;
	if (!(await findOneDocument(CLUSTERED_FARM_PROGRAM_MODEL, { farm_program_id: programId }))) {
		const newFarmProgram = await CLUSTERED_FARM_PROGRAM_MODEL.create(req.body);
		if (newFarmProgram) {
			req.locals.appendedFarmProgram = newFarmProgram;
			next();
		} else {
			return next(new ServerError(`Problem inserting new document in database`, 500));
		}
	} else {
		return next(
			new ServerError(
				`A document with this program_id <${programId}> already exists in the database`,
				409
			)
		);
	}
}, `inertFarmProgram`);

// function getFarmerImageUrl = catchAsyncError(async (farmerBvn, base64Image) => {
// 	console.log(chalk.success(`CALLED [ uploadFarmerImagesToCloud ] CONTROLLER FN. `));
// 	next();
// }, `uploadFarmerImagesToCloud`);

exports.getFarmerBiodataUrls = catchAsyncServer(async (req, res, next) => {

  console.log(chalk.success(`CALLED [ storeFarmersBiodata ] CONTROLLER FN. `));

  const farmProgram = req.locals.appendedFarmProgram;
	
  if (!farmProgram) {
		return next(new ServerError(`Something went wrong`, 500));
  }
	
  const updatedFarmers = [];

  if (farmProgram.farm_program_farmers) {
		
    farmProgram.farm_program_farmers.forEach((farmer) => {
		
			const farmerBiodata = farmer.farmer_bio_data;
			console.log({ farmerBiodata })
      const farmerUrl = `https://geoclusters.com/farmers/farmer/1234567`;

      const updatedFarmer = {
        ...farmer,
				farmer_global_id: farmer.farmer_global_id,
				farm_program_farmer_id: farmer.farm_program_farmer_id,
        farmer_url: farmerUrl,
				farmer_funding_timeline: farmer.farmer_funding_timeline,
				farmer_farm_details: farmer.farmer_farm_details,
				farmer_farm_practice: farmer.farmer_farm_practice,
      };
      // console.log({ updatedFarmer });
      updatedFarmers.push(updatedFarmer);
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

	// Init a FeatureCollection for the farm program
	const featureCollection = {
		type: "FeatureCollection",
		// "features": [],
		features: [],
		properties: farmProgramJSON,
	};

	
	// Create a MultiPoint feature based on each farmer
	farmProgramJSON.farm_program_farmers.forEach((farmer) => {

		// 
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
				farmer_farm_details: Object.entries(farmer["farmer_farm_details"]).filter(([key, value]) => key !== "farm_coordinates"),
				farmer_farm_practice: farmer["farmer_farm_practice"],
				farmer_funding_timeline: farmer["farmer_funding_timeline"],
			}
		}

		// 
		featureCollection.features.push(updatedFeature);
	});

	return featureCollection;
};

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
