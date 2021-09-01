const express = require ("express");
const router = express.Router();
const pmroController = require(`../controllers/pmros-controller.js`);

router.get(`/`, pmroController.getAllPMROs);
router.post(`/`, pmroController.insertPMRO);
// router.get('/pmro/:id', pmroController.checkDatabaseID, pmroController.getPMROById); // GET BY MONGODB _id

module.exports = router;