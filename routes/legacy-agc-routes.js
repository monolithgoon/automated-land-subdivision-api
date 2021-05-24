const express = require("express");
const ROUTER = express.Router();
const agcController = require('../controllers/agc-controller.js');


ROUTER.route('/')
   .get(agcController.getAllLegacyAgcs)
   .post(agcController.insertLegacyAgc);

   
ROUTER.route('/agc/')
   .get(agcController.checkID, agcController.getLegacyAgc);


ROUTER.route('/processed-farmers/')
   .post(agcController.checkID, agcController.insertProcessedFarmers)
   // TODO >
   // .update(legacyAgcController.checkID, legacyAgcController.updateProcessedFarmers)


ROUTER.route('/processed/')
   .post(agcController.checkID, agcController.insertProcessedLegacyAgc);


ROUTER.route('/failed/')
   .get(agcController.checkID, agcController.getAllFailedLegacyAgcs);


module.exports = ROUTER;