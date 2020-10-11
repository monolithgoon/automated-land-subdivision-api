const express = require ("express");
const ROUTER = express.Router();
const viewsController = require('../controllers/view-controller.js')



ROUTER.get('/', viewsController.renderAPIGuide);
ROUTER.get('/farm-plots', viewsController.renderOnlyAgcs)
ROUTER.get('/parcelized-agc/:id', viewsController.checkDatabaseID, viewsController.renderParcelizedAgcByID);
ROUTER.get('/parcelized-agc', viewsController.renderParcelizedAgc)



module.exports = ROUTER;