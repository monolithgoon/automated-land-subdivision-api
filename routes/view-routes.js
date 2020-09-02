const express = require ("express");
const ROUTER = express.Router();
const viewsController = require('../controllers/view-controller.js')



ROUTER.get('/', viewsController.renderAllParcelizedAgcs);
ROUTER.get('/:id', viewsController.checkID, viewsController.renderParcelizedAgc);
// ROUTER.get('/:parcelizedAgcID', viewsController.checkID, viewsController.renderParcelizedAgc)



module.exports = ROUTER;