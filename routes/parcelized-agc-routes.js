// THIS MODULE CONTAINS THE ROUTER & PERFORMS THE ACTUAL get/post/patch/delete ROUTING
// IT RECEIVES ROUTING FUNCTIONS FROM THE farm-parcels-controller



const express = require("express");
const ROUTER = express.Router();
const PARCELIZED_AGC_CONTROLLER = require('../controllers/parcelized-agc-controller.js')

// IMPORING THE ROUTE HANDLING FUNCTIONS USING DESTRUCTURING
// const {getAllTours, createTour, getTour, updateTour, deleteTour} = require('./../controllers/tour-controller.js')




// REMOVE > 
// // PARAM. MIDDLEWARE EXAMPLE _MTD 1
// ROUTER.param("id", (req, res, next, paramValue) => {
// 	console.log(`Middleware example #1. This is the request parameter: ${paramValue}`);
// 	next();
// });

// REMOVE > 
// // PARAM. MIDDLEWARE EXAMPLE _MTD 2
// ROUTER.param("id", TOUR_CONTROLLER.checkID);



// ROUTES
// ROUTER.get('/', getAllTours) // GET ALL TOURS ROUTE
// ROUTER.get('/:id', getTour) // GET ROUTE WITH VARIABLES (PARAMETERS)
// ROUTER.post('/', createTour) // POST ROUTE
// ROUTER.patch('/:id', updateTour) // PATCH ROUTE > MODIFY ONLY PARTS OF THE DATA
// ROUTER.delete('/:id', deleteTour);



// COMMAND CHAINING > A BETTER WAY OF WRITING ROUTES
// REMOVE > 
// ROUTER.route("/")
// 	.get(TOUR_CONTROLLER.getAllTours)
// 	.post(TOUR_CONTROLLER.checkBody, TOUR_CONTROLLER.createTour);

ROUTER.route('/')
   .get(PARCELIZED_AGC_CONTROLLER.getAllParcelizedAgcs)
   .post(PARCELIZED_AGC_CONTROLLER.checkBody, PARCELIZED_AGC_CONTROLLER.insertParcelizedGeoCluster);



ROUTER.route('/metadata')
   .get(PARCELIZED_AGC_CONTROLLER.getParcelizedAgcsMetadata)



   // REMOVE > 
   // ROUTER.route("/:id")
   // 	.get(TOUR_CONTROLLER.checkID, TOUR_CONTROLLER.getTour)
   // 	.patch(TOUR_CONTROLLER.checkID, TOUR_CONTROLLER.updateTour);
   // 	.delete(TOUR_CONTROLLER.checkID, TOUR_CONTROLLER.deleteTour);
   
// GET request: 127.0.0.1:9090/api/v1/parcelized-agcs/5f5698658580620c0c6fea6c
ROUTER.route("/parcelized-agc/:id")
      .get(PARCELIZED_AGC_CONTROLLER.checkID, PARCELIZED_AGC_CONTROLLER.renderParcelizedAgcByID)
      


// http://127.0.0.1:9090/parcelized-agcs/parcelized-agc?UNIQUE-AGC-ID-XXX-XXX
ROUTER.route('/parcelized-agc/')
      .get(PARCELIZED_AGC_CONTROLLER.getParcelizedAgc)



module.exports = ROUTER;