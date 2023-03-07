`use strict`;
const express = require(`express`);
const router = express.Router();
const farmersController = require(`../controllers/farmers-controller.js`);

router.route("/").get(farmersController.getAllFarmersBiodata);
// router.route("/").post(farmersController.insertFarmerBiodata);

// REMOVE
router.route("/farmer/").get(farmersController.getFarmerBiodata2)

router.route("/farmer/:id").get(farmersController.getFarmerBiodata3)

module.exports = router;