const express = require ("express");
const ROUTER = express.Router();
const viewsController = require('../controllers/view-controller.js')



ROUTER.get('/', viewsController.renderLandingPage);
ROUTER.get('/api-guide', viewsController.renderAPIGuide);
ROUTER.get('/agcs-overview', viewsController.renderOnlyAgcs);
ROUTER.get('/parcelized-agc/:id', viewsController.checkDatabaseID, viewsController.renderParcelizedAgcByID);
ROUTER.get('/parcelized-agc', viewsController.renderParcelizedAgc)



module.exports = ROUTER;