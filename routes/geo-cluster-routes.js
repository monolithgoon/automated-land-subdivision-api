// THIS MODULE CONTAINS THE ROUTER & PERFORMS THE ACTUAL get/post/patch/delete ROUTING
// IT RECEIVES ROUTING FUNCTIONS FROM THE farm-parcels-controller



const express = require("express");
const ROUTER = express.Router();
const agcController = require('../controllers/agc-controller.js');
const geoClusterController = require('../controllers/geo-cluster-controller.js');
const subdivideController = require('../controllers/auto-subdivide-controller.js');



ROUTER.route('/')
   .get(agcController.getAllAgcs)
   .post(agcController.insertAgc)
   // .post(agcController.insertAgc, subdivideController.parcelizeAgc);



ROUTER.route('/geo-cluster/')
   .get(agcController.checkID, agcController.getAgc)



ROUTER.route('/geo-cluster/details/')
   .post(geoClusterController.insertGeoClusterDetails);



module.exports = ROUTER;