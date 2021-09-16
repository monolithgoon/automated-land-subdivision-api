// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY geo-cluster-routes.js
const chalk = require('../utils/chalk-messages');
const AGC_MODEL = require('../models/agc-model.js');
const GEO_CLUSTER_DETAILS_MODEL = require('../models/geo-cluster-details-model.js');



// TODO >
// USES A SIMPLER VERSION OF THE AGC_MODEL WITH GeoJSON FEATURE I/OF FEAT. COLL.
exports.insertGeoCluster = async (req, res, next) => {
	console.log(chalk.success(`CALLED THE [ insertGeoCluster ] CONTROLLER FN. `))
   next();
}
// INSERT A NEW AGC .. CALLS next() FOR AUTO-SUBDIVIDE
exports.insertGeoClusterGJ = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ insertGeoClusterGJ ] CONTROLLER FN.`))

   // REMOVE
   // res.locals.appendedClusterGeoJSON = req.body;
   // next();
   
   try {
      
      // CREATE A NEW AGC DOCUMENT _MTD 2
      const newGeoCluster = await AGC_MODEL.create(req.body); // "model.create" returns a promise

      // console.log({newGeoCluster});

      // APPEND GEOJSON DATA TO LOCAL VARS.
      if (newGeoCluster) {
         res.locals.appendedClusterGeoJSON = newGeoCluster;
         next();
      };

   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed. Check your JSON data payload.',
         error_msg: err.message,
      });
   };
};



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
};