// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY geo-cluster-routes.js
const chalk = require('../utils/chalk-messages');
const AGC_MODEL = require('../models/agc-model.js');
const GEO_CLUSTER_DETAILS_MODEL = require('../models/geo-cluster-details-model.js');
const { findOneDocument } = require('./handler-factory//handler-factory.js');



// TODO >
// USES A SIMPLER VERSION OF THE AGC_MODEL WITH GeoJSON FEATURE INSTEAD OF A FEAT. COLL.
// DEFINING AN UN-PARCELIZED GEO-CLUSTER AS A FEATURE IS MORE APPROPRIATE
// USE await GEOFILE_GEOJSON_MODEL.create(req.body)
exports.insertGeofileGeoJSON = async (req, res, next) => {
	console.log(chalk.success(`CALLED THE [ insertGeofileGeoJSON ] CONTROLLER FN. `))
   const geofileId = req.body.properties.geofile_id;
   console.log({geofileId});
   next();
};



// INSERT A NEW AGC .. CALLS next() FOR AUTO-SUBDIVIDE
exports.insertGeoClusterGJ = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ insertGeoClusterGJ ] CONTROLLER FN.`))
   
   try {

      const clusterId = req.body.properties.agc_id;

      if (!(await findOneDocument(AGC_MODEL, {"properties.agc_id": clusterId}))) {

         // CREATE A NEW AGC DOCUMENT _MTD 2
         const newGeoCluster = await AGC_MODEL.create(req.body); // "model.create" returns a promise
      
         // APPEND GEOJSON DATA TO LOCAL VARS.
         if (newGeoCluster) {
            console.log(chalk.success(`A new AGC GeoJSON document was successfully created`));
            res.locals.appendedClusterGeoJSON = newGeoCluster;
            next();
         };

      } else {
         console.log(chalk.warning(`The GeoJSON for [ ${clusterId} ] already exists in the database. Proceeding with auto pacelization .. `));
         res.locals.appendedClusterGeoJSON = req.body;
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
   
   try {

      const clusterId = req.body.properties.agc_id;

      if (!(await findOneDocument(GEO_CLUSTER_DETAILS_MODEL, {"properties.agc_id": clusterId}))) {

         const clusterAllocations = await GEO_CLUSTER_DETAILS_MODEL.create(req.body);
   
         res.status(201).json({
            status: `success`,
            inserted_at: req.requestTime,
            data: clusterAllocations,
         });

      } else {
         res.status(201).json({
            status: 'success',
            message: `The allocaiton details for [ ${clusterId} ] already exists in the database. Proceed to upload the geo-file for auto parcelization.`
         });
      };

   } catch (_err) {
      res.status(400).json({ 
         status: `fail`,
         message: `That POST request failed. Check that your plot allocations JSON payload has all the valid fields.`,
         error_msg: _err.message,
      });
   }
};