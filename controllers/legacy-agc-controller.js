const chalk = require("../utils/chalk-messages");
const LEGACY_AGC_MODEL = require("../models/legacy-agc-model.js");
const LEGACY_AGC_FARMERS_MODEL = require("../models/legacy-agc-farmers-model.js");

// CHECK THAT THE agc_id IS VALID BEFORE RUNNING getAgc()
// FIXME < COMPLETE THIS FN.
exports.checkID = async (req, res, next) => {

	console.log(chalk.console(`Checking the agc_id .. { DUMMY FN. }`));

	next();
};

exports.updateProcessedFarmers = async (req, res, next) => {

	console.log(chalk.success(`Called the [ updateProcessedFarmers ] controller fn.`));

	const payload = req.body;

	try {
		// create a filter for the legacy AGC to update
		const updateFilter = { agc_id: req.body.agc_id };

		// create a document if no documents match the filter
		const updateOptions = { upsert: false };

		// create a document that updates the legacy farmers document
		const updateDoc = {
			$set: {
				farmers: req.body.farmers,
			},
		};

      // execute update
		const updateResult = await LEGACY_AGC_FARMERS_MODEL.updateOne(updateFilter, updateDoc, updateOptions);

		console.log (chalk.result(
			`${updateResult.matchedCount} document(s) matched the filter, updated ${updateResult.modifiedCount} document(s)`
		));
	} catch (updateLegacyFarmersErr) {
		console.log(chalk.fail(`${updateLegacyFarmersErr}`));
	}
};