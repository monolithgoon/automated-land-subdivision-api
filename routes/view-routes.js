const express = require ("express");
const viewsController = require('../controllers/view-controller.js')
const ROUTER = express.Router();



ROUTER.get('/', viewsController.renderParcelizedAgcs)
ROUTER.get('/parcelized-agc', viewsController.renderParcelizedAgc)



module.exports = ROUTER;