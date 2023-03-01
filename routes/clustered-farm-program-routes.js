`use strict`;
const express = require(`express`);
const router = express.Router();
const farmProgramController = require(`../controllers/clustered-farm-program-controller.js`);

router
	.route("/")
	.post(
		farmProgramController.insertFarmProgram,
		// farmProgramController.uploadFarmerImagesToCloud,
		// farmProgramController.storeFarmersBiodata,
		// farmProgramController.appendFarmerUrlsToFarmProgram,
		farmProgramController.convertFarmProgramToGeoJson,
		farmProgramController.insertProcessedFarmProgram
	)
	.get(farmProgramController.getAllFarmPrograms);

router.route("/farm-program/").get(farmProgramController.getFarmProgram);

router
	.route("/processed/")
	// .post(farmProgramController.insertProcessedFarmProgram)
	.get(farmProgramController.getAllProcessedFarmPrograms);

router.route("/processed/farm-program/:id").get(farmProgramController.getProcessedFarmProgram);

router.route("/processed/farm-program/").get(farmProgramController.getProcessedFarmProgram);

module.exports = router;
