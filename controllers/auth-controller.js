const USER_MODEL = require('../models/user-model.js')



// signup CONTROLLER
exports.signup = async (req, res, next) => {

   try {

      // CREATE THE NEW USER DOCUMENT IN THE DB. HERE
      const newUser = await USER_MODEL.create(req.body) // 'model.create' always returns a promise

      res.status(201).json({
         status: 'success', 
         data: { 
            user: newUser
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