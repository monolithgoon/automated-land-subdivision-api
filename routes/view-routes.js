const express = require ("express");
const ROUTER = express.Router();
const viewsController = require('../controllers/view-controller.js')



ROUTER.get('/', viewsController.renderLandingPage); // FOR > agfarmplots.com ** MAIN DOMAIN
// ROUTER.get('/', viewsController.renderOnlyAgcs); // FOR LIMITED ACCESS ALTERNATE DOMAIN

ROUTER.get('/agcs-overview', viewsController.renderOnlyAgcs);
ROUTER.get('/api-guide', viewsController.renderAPIGuide);

ROUTER.get('/parcelized-agc/:id', viewsController.checkDatabaseID, viewsController.renderParcelizedAgcByID); // GET BY MONGODB _id

ROUTER.get('/private/parcelized-agc/', viewsController.renderParcelizedAgc);
ROUTER.get('/parcelized-agc/', viewsController.renderParcelizedAgcBySecretURL);



module.exports = ROUTER;