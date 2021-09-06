// REMOVE > DEPRC. > THESE ROUTES HAVE BEEN REPLACED BY ROUTES IN geo-cluster-routes.js
const express = require("express");
const ROUTER = express.Router();
const agcController = require('../controllers/agc-controller.js');



ROUTER.route('/')
   .get(agcController.getAllAgcs)
   .post(agcController.insertAgc)
   


ROUTER.route('/agc/')
   .get(agcController.checkID, agcController.getAgc)



module.exports = ROUTER;