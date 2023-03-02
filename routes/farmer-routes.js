`use strict`;
const express = require(`express`);
const router = express.Router();
const farmersController = require(`../controllers/farmers-controller.js`);

// router.route("/").post(farmersController.insertFarmerBiodata);
router.route("/farmer/").get(farmersController.getFarmerBiodata)

module.exports = router;