`use strict`;
const chalk = require(`../utils/chalk-messages.js`);
const CLUSTERED_FARM_PROGRAM_MODEL = require("../models/clustered-farm-program-model");
const catchAsyncServer = require("../utils/catch-async");
const { findOneDocument, getAllDocuments } = require("./handler-factory");

exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED THE [ insertFarmProgram ] CONTROLLER FN. `));
	const programId = req.body.farm_program_id;
	if (!(await findOneDocument(CLUSTERED_FARM_PROGRAM_MODEL, { "farm_program_id": programId }))) {
    const newFarmProgram = await CLUSTERED_FARM_PROGRAM_MODEL.create(req.body);
		console.log({ newFarmProgram })
		if (newFarmProgram) {
			req.locals.appendedFarmProgram = newFarmProgram;
			next();
		}
	} else {
		throw new Error(`A document with this program_id [ ${programId} ] already exists in the database.`)
	}
}, `inertFarmProgram`);

exports.uploadFarmerImagesToCloud = catchAsyncServer(async (req, res, next) => {
	next();
})

exports.storeFarmersData = catchAsyncServer(async (req, res, next) => {
	next();
})

exports.convertFarmProgramToGeoJSON = catchAsyncServer(async (req, res, next) => {
	next();
})

exports.appendFarmerUrlsToFarmProgram = catchAsyncServer(async (req, res, next) => {
	next();
})

exports.convertFarmProgramToGeoJsonFormat = catchAsyncServer(async (req, res, next) => {
	const farmProgram = req.locals.appendedFarmProgram;
	if (!farmProgram) next(new ServerError(`Something went wrong`))
	next();
})

exports.insertProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {
	const farmProgram = req.locals.appendedFarmProgram;
	if (farmProgram) {
		res.status(201).json({
			status: `success`,
			inserted_at: req.requestTime,
			data: farmProgram,
	 });
	}
}, `convertFarmProgramToGeoJSOn`);

exports.getAllFarmPrograms = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`Called the [ getAllFarmPrograms ] controller fn. `));
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
