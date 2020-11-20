// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY agc-routes.js
const chalk = require('../utils/chalk-messages');
const AGC_MODEL = require('../models/agc-model.js')




// CREATE/INSERT A NEW AGC (POST REQUEST) HANDLER FN.
exports.insertAgc = async (req, res, next) => {

   try {
      
      // CREATE A NEW AGC DOCUMENT _MTD 1
      // const newAgc = new AGC_MODEL(req.body)
      // newAgc.save // returns a promise
      console.log(chalk.working(`YOU REACHED THE AGC CONTROLLER.. `));
      
      // CREATE A NEW AGC DOCUMENT _MTD 2
      const newAgc = await AGC_MODEL.create(req.body) // "model.create" returns a promise

      // SERVER RESPONSE
      res.status(201).json({
         status: 'success',
         inserted_at: req.requestTime,
         data: newAgc
         // agcData: {
         //    agc: newAgc
         // }
      });
      
   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed. Check your JSON data payload.',
         error_msg: err.message,
      });
   }

   next();
}