const express = require ("express");
const ROUTER = express.Router();
const viewsController = require('../controllers/view-controller.js')



ROUTER.get('/', viewsController.renderAllParcelizedAgcs);
ROUTER.get('/parcelized-agc', viewsController.renderParcelizedAgc)
ROUTER.get('/parcelized-agc/:id', viewsController.checkDatabaseID, viewsController.renderParcelizedAgcByID);



module.exports = ROUTER;