`use strict`;

const CLUSTERED_FARM_PROGRAM_MODEL = require("../models/clustered-farm-program-model");
const catchAsyncServer = require("../utils/catch-async");

exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED THE [ insertFarmProgram ] CONTROLLER FN. `));
	const programId = req.body.farm_program_id;
	if (!(await findOneDocument(CLUSTERED_FARM_PROGRAM_MODEL, { "farm_program_id": clusterId }))) {
    const newFarmProgram = await CLUSTERED_FARM_PROGRAM_MODEL.create(req.body);
		if (newFarmProgram) {
			console.log(chalk.success(`A new clustered farm program document was successfully created`));
			res.locals.appendedFarmProgram = newGeoCluster;
			next();
		}
	} else {
		console.log(chalk.warning(`A document with this [ ${programId} ] already exists in the database.`));
		res.locals.appendedFarmProgram = req.body;
		next();
	}
}, `inertFarmProgram`);

exports.normalizeFarmProgram = catchAsyncServer(async (req, res, next) => {}, `normalizeFarmProgram`);

exports.getAllFarmPrograms = catchAsyncServer(async (req, res, next) => {}, `getAllFarmPrograms`);

exports.getFarmProgram = catchAsyncServer(async (req, res, next) => {}, `getFarmProgram`);

exports.insertProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {},
`insertProcessedFarmProgram`);

exports.getAllProcessedFarmPrograms = catchAsyncServer(async (req, res, next) => {},
`getAllProcessedFarmPrograms`);

exports.getProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {},
`getProcessedFarmProgram`);
