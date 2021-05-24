const chalk = require('../utils/chalk-messages');
const LEGACY_AGC_MODEL = require('../models/legacy-agc-model.js');
const LEGACY_AGC_FARMERS_MODEL = require('../models/legacy-agc-farmers-model.js');

exports.updateProcessedFarmers = async(req, res, next) => {

   console.log(chalk.success(`Called the [ updateProcessedFarmers ] controller fm/`));

   const payload = req.body;

   try {

      // create a filter for the legacy AGC to update
      const updateFilter = { agc_id: req.body.agc_id};

      // create a document if no documents match the filter
      const updateOptions = { upsert: false };

      // create a document that updates the legacy farmers document

   } catch (updateLegacyFarmersErr) {
      console.log(chalk.fail(`${updateLegacyFarmersErr}`))
   }
}