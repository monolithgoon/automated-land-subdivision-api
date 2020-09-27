// THIS MODULE CONTAINS THE ROUTER & PERFORMS THE ACTUAL get/post/patch/delete ROUTING
// IT RECEIVES ROUTING FUNCTIONS FROM THE farm-parcels-controller



const express = require("express");
const ROUTER = express.Router();
const agcController = require('../controllers/agc-controller.js')
// const parcelizationController = require('../database/agcs/parcelize/parcelize-agc.js')



ROUTER.route('/')
   .get(agcController.getAllAgcs)
   .post(agcController.insertAgc);
   // .post(agcController.insertAgc, parcelizationController.parcelizeAgc);



ROUTER.route('/agc/')
   .get(agcController.checkID, agcController.getAgc)



module.exports = ROUTER;