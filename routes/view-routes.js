const express = require ("express");
const ROUTER = express.Router();
const viewsController = require('../controllers/view-controller.js')



ROUTER.get('/', viewsController.renderParcelizedAgcs)
ROUTER.get('/parcelized-agc', viewsController.renderParcelizedAgc)



module.exports = ROUTER;