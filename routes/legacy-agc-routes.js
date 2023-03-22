const express = require("express");
const ROUTER = express.Router();
const legacyAgcController = require('../controllers/legacy-agc-controller.js');
const geoJSONMiddleware = require(`../middleware/geojson-middleware.js`);


ROUTER.route('/')
   .get(legacyAgcController.getAllLegacyAgcs)

   
ROUTER.route('/legacy-agc/')
   .get(legacyAgcController.checkID, legacyAgcController.getLegacyAgc)
   .post(legacyAgcController.insertLegacyAgc);


// REMOVE > DEPRC.
ROUTER.route('/legacy-agc/processed-farmers/')
   .post(legacyAgcController.checkID, legacyAgcController.insertProcessedFarmers)
   .patch(legacyAgcController.checkID, legacyAgcController.updateProcessedFarmers);


// REMOVE > DEPRC.
ROUTER.route('/processed-farmers/')
   .get(legacyAgcController.getProcessedLegacyAgcFarmers);
   
   
ROUTER.route('/legacy-agc/processed/')
   // .post(
   //    legacyAgcController.insertProcessedLegacyAgc
   //    );
   .post(
      geoJSONMiddleware.validateGeoJSONBody,
      geoJSONMiddleware.addParcelizedClusterPolygonFeature,
      legacyAgcController.insertProcessedLegacyAgc
   );


ROUTER.route('/processed/')
.get(legacyAgcController.getAllProcessedLegacyAgcs);


// TODO
ROUTER.route('/failed/')
   .get(legacyAgcController.checkID, legacyAgcController.getAllFailedLegacyAgcs);


module.exports = ROUTER;