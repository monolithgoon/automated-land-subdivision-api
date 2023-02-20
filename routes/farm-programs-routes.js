`use strict`;
const express = require(`express`);
const router = express.Router();
const farmProgramsController = require(`../controllers/farm-programs-controller.js`);

router
	.route("/")
	.post(farmProgramsController.insertFarmProgram)
	.get(farmProgramsController.getAllFarmPrograms);

router
	.route("/farm-program/")
	.get(farmProgramsController.getFarmProgram);

router
	.route("/processed/")
	.post(farmProgramsController.insertProcessedFarmProgram)
	.get(farmProgramsController.getAllProcessedFarmPrograms);

router
	.route("/processed/farm-program")
	.get(farmProgramsController.getProcessedFarmProgram);

module.exports = router;
