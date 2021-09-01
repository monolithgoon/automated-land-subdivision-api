const express = require("express");
const ROUTER = express.Router();
const legacyAgcController = require('../controllers/legacy-agc-controller.js');


ROUTER.route('/')
   .get(legacyAgcController.getAllLegacyAgcs)
   .post(legacyAgcController.insertLegacyAgc);

   
ROUTER.route('/agc/')
   .get(legacyAgcController.checkID, legacyAgcController.getLegacyAgc);


ROUTER.route('/processed-farmers/')
   .post(legacyAgcController.checkID, legacyAgcController.insertProcessedFarmers)
   .patch(legacyAgcController.checkID, legacyAgcController.updateProcessedFarmers)


ROUTER.route('/processed/')
   .post(legacyAgcController.checkID, legacyAgcController.insertProcessedLegacyAgc);


ROUTER.route('/failed/')
   .get(legacyAgcController.checkID, legacyAgcController.getAllFailedLegacyAgcs);


module.exports = ROUTER;