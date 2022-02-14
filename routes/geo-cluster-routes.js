const express = require("express");
const ROUTER = express.Router();
const agcController = require('../controllers/agc-controller.js');
const geoClusterController = require('../controllers/geo-cluster-controller.js');
const subdivideController = require('../controllers/auto-subdivide-controller.js');
const parcelizedAgcController = require('../controllers/parcelized-agc-controller.js');



ROUTER.route('/')
   .get(agcController.getAllAgcs)



ROUTER.route('/geo-cluster/')
   .get(agcController.checkID, agcController.getAgc)
   .post(
      geoClusterController.insertGeoClusterGJ, 
      subdivideController.subdivideGeoClusterGJ,
      parcelizedAgcController.insertParcelizedGeoCluster
   );



ROUTER.route('/geo-cluster/details/')
   .post(geoClusterController.insertGeoClusterDetails);



module.exports = ROUTER;