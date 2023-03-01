`use strict`;
const chalk = require(`../utils/chalk-messages.js`);
const ServerError = require(`../utils/server-error.js`)
const CLUSTERED_FARM_PROGRAM_MODEL = require("../models/clustered-farm-program-model");
const catchAsyncServer = require("../utils/catch-async");
const { findOneDocument, getAllDocuments } = require("./handler-factory");
const { _catchErrorSync } = require("../utils/helpers.js");

exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ insertFarmProgram ] CONTROLLER FN. `));
	const programId = req.body.farm_program_id;
	if (!(await findOneDocument(CLUSTERED_FARM_PROGRAM_MODEL, { "farm_program_id": programId }))) {
    const newFarmProgram = await CLUSTERED_FARM_PROGRAM_MODEL.create(req.body);
		if (newFarmProgram) {
			req.locals.appendedFarmProgram = newFarmProgram;
			next();
		} else {
			return next(new ServerError(`Problem inserting new document in database`, 500))
		}
	} else {
		// throw new Error(`A document with this program_id [ ${programId} ] already exists in the database.`)
		return next(new ServerError(`A document with this program_id [ ${programId} ] already exists in the database.`, 500))
	}
}, `inertFarmProgram`);

exports.uploadFarmerImagesToCloud = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ uploadFarmerImagesToCloud ] CONTROLLER FN. `));
	next();
})

exports.storeFarmersBiodata = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ storeFarmersBiodata ] CONTROLLER FN. `));
	const farmProgram = req.locals.appendedFarmProgram;
	if (!farmProgram) return next(new ServerError(`Something went wrong`, 500))
	const farmProgramFarmers = farmProgram.farm_program_farmers;
	next();
})

exports.appendFarmerUrlsToFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ storeFarmersBiodata ] CONTROLLER FN. `));
	next();

});

function createFeatureCollection(farmProgramJSON) {

	const featureCollection = {
    "type": "FeatureCollection",
    // "features": [],
    "features": farmProgramJSON.farm_program_farmers,
		"properties": farmProgramJSON,
  };

  // const feature = {
  //   "type": "Feature",
  //   "geometry": {
  //     "type": "Point",
  //     "coordinates": [0, 0]
  //   },
  //   "properties": properties
  // };

  // featureCollection.features.push(feature);

  return featureCollection;
}
// const createFeatureCollection = _catchErrorSync((farmProgramJSON) => {

// 	const featureCollection = {
//     "type": "FeatureCollection",
//     "features": [],
// 		"properties": farmProgramJSON,
//   };

//   const feature = {
//     "type": "Feature",
//     "geometry": {
//       "type": "Point",
//       "coordinates": [0, 0]
//     },
//     "properties": properties
//   };

//   featureCollection.features.push(feature);

//   return featureCollection;
// }, `createFeatureCollection`)

exports.convertFarmProgramToGeoJson = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ convertFarmProgramToGeoJson ] CONTROLLER FN. `));
	const farmProgram = req.locals.appendedFarmProgram;
	if (!farmProgram) return next(new ServerError(`Something went wrong`, 500))
	const farmProgramGeoJSON = createFeatureCollection(farmProgram);
	req.locals.appendedFarmProgramGeoJSON = farmProgramGeoJSON
	next();
})

exports.insertProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ insertProcessedFarmProgram ] CONTROLLER FN. `));
	const farmProgramGeoJSON = req.locals.appendedFarmProgramGeoJSON;
	if (!farmProgramGeoJSON) return next(new ServerError(`Something went wrong`, 500))
	if (farmProgramGeoJSON) {
		res.status(201).json({
			status: `success`,
			inserted_at: req.requestTime,
			data: farmProgramGeoJSON,
	 });
	}
}, `convertFarmProgramToGeoJSOn`);

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
		}
	})
}, `getAllFarmPrograms`);

exports.getFarmProgram = catchAsyncServer(async (req, res, next) => {}, `getFarmProgram`);

exports.insertProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {
	next();
},
`insertProcessedFarmProgram`);

exports.getAllProcessedFarmPrograms = catchAsyncServer(async (req, res, next) => {},
`getAllProcessedFarmPrograms`);

exports.getProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {},
`getProcessedFarmProgram`);
