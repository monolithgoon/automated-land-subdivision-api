// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY geo-cluster-routes.js
const chalk = require('../utils/chalk-messages');
const GEO_CLUSTER_DETAILS_MODEL = require('../models/geo-cluster-details-model.js')



// USES A SIMPLER VERSION OF THE AGC_MODEL WITH FEATURE I/OF FEAT. COLL.
exports.insertGeoCluster = async (req, res, next) => {
	console.log(chalk.success(`CALLED THE [ insertGeoCluster ] CONTROLLER FN. `))
   next();
}



// INSERT PLOT ALLOCATIONS ONLY INTO THE DB.
exports.insertGeoClusterDetails = async (req, res, next) => {

   console.log(chalk.success(`CALLED THE [ insertGeoClusterDetails ] CONTROLLER FN. `));
   
   const geoClusterDetailsJSON = req.body;

   try {

      const newPlotAllocations = await GEO_CLUSTER_DETAILS_MODEL.create(geoClusterDetailsJSON);

      res.status(201).json({
         status: `success`,
         inserted_at: req.requestTime,
         data: newPlotAllocations,
      })
      
   } catch (_err) {
      res.status(400).json({ 
         status: `fail`,
         message: `That POST request failed. Check that your plot allocations JSON payload has all the valid fields.`,
         error_msg: _err.message,
      });
   }
}