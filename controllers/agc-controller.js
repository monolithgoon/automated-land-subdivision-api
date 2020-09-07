// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY agc-routes.js



const AGC_MODEL = require('../models/agc-model.js')



// REMOVE > REQUEST BODY VALIDATION MIDDLEWARE < VALIDATION CURRENTLY HAPPENING IN THE MODEL .. 
exports.checkBody = (req, res, next) => {

   // console.table(req.body)
   
   // if (!req.body.name || !req.body.price) {
   //    return res.status(400).json({
   //       status: 'failed',
   //       message: 'Missing tour name and/or price.'
   //    })
   // }
   next(); // move on to the next middleware, ie., createTour
}



// CREATE/INSERT A NEW AGC (POST REQUEST) HANDLER FN.
exports.insertAgc = async (req, res) => {

   try {
      
      // CREATE A NEW AGC DOCUMENT _MTD 1
      // const newAgc = new TOUR_MODEL(req.body)
      // newAgc.save // returns a promise
      
      // CREATE A NEW AGC DOCUMENT _MTD 2
      const newAgc = await AGC_MODEL.create(req.body) // "model.create" returns a promise

      res.status(201).json({
         status: 'success',
         agcData: {
            agc: newAgc
         }
      })
      
   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed.',
         error_msg: err.message,
      })
   }
}
