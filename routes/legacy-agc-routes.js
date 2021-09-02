const express = require("express");
const ROUTER = express.Router();
const legacyAgcController = require('../controllers/legacy-agc-controller.js');


ROUTER.route('/')
   .get(legacyAgcController.getAllLegacyAgcs)
   .post(legacyAgcController.insertLegacyAgc);

   
ROUTER.route('/legacy-agc/')
   .get(legacyAgcController.checkID, legacyAgcController.getLegacyAgc);


// 
ROUTER.route('/legacy-agc/processed-farmers/')
   .post(legacyAgcController.checkID, legacyAgcController.insertProcessedFarmers)
   .patch(legacyAgcController.checkID, legacyAgcController.updateProcessedFarmers);
   
   
   // TODO
   ROUTER.route('/legacy-agc/processed/')
      .post(legacyAgcController.checkID, legacyAgcController.insertProcessedLegacyAgc);


// TODO
ROUTER.route('/processed/')
.get(legacyAgcController.getAllProcessedLegacyAgcs);


ROUTER.route('/failed/')
   .get(legacyAgcController.checkID, legacyAgcController.getAllFailedLegacyAgcs);


module.exports = ROUTER;