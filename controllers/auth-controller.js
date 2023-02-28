const jwt = require('jsonwebtoken')
const USER_MODEL = require('../models/user-model.js')
const ServerError = require("../utils/server-error.js")



// signup CONTROLLER
exports.signup = async (req, res, next) => {

   try {

      // // CREATE THE NEW USER DOCUMENT IN THE DB. HERE
      // const newUser = await USER_MODEL.create(req.body,) // 'model.create' always returns a promise
      
      
      // MTD. 2
      const newUser = await USER_MODEL.create({
         user_first_name: req.body.user_first_name,
         user_last_name: req.body.user_last_name,
         user_email: req.body.user_email,
         user_password: req.body.user_password,
         password_confirm: req.body.password_confirm
      });
      

      // IMPLEMENT JWT > PAYLOAD + SECRET
      const jwtToken = jwt.sign( {id: newUser._id}, process.env.JWT_SECRET, {
         expiresIn: process.env.JWT_EXPIRES_IN
      });
      
      
      res.status(201).json({
         status: 'success',
         jwtToken,
         data: { 
            user: newUser
         }
      });


      // // CREATE NEW USER MTD. 3 > BEST MTD.
      // const newUser = new USER_MODEL({
      //    user_first_name: req.body.user_first_name,
      //    user_email: req.body.user_email,
      //    user_password: req.body.user_password,
      //    passwordConfirm: req.body.pass,
      // })


      // // IMPLEMENT JWT > PAYLOAD + SECRET
      // const jwtToken = jwt.sign( {id: newUser._id}, process.env.JWT_SECRET, {
      //    expiresIn: process.env.JWT_EXPIRES_IN
      // })


      // // model.save SEEMS TO BE BETTER PRACTICE THAN model.create
      // await newUser.save((saveErr, savedUser) => {
      //    res.status(201).json({
      //       status: 'success',
      //       jwtToken,
      //       data: savedUser
      //    });

      //    if (saveErr) {
      //       new Error(`${saveErr}`)
      //    }
      // });


   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed.',
         error_msg: err.message,
      })
   }
}



// login CONTROLLER
exports.login = async (req, res, next) => {
   // const user_email = req.body.user_email;
   // const user_password = req.body.user_password
   const { user_email, user_password } = req.body // USING DESTRC.

   // >> LOGIN CREDENTIALS CHECKLIST >>

      // 1. CHECK IF EMAIL && PASSWORD EXIST IN req.body
      if(!user_email || !user_password) {
         next(new ServerError(`Please provide an email and password..`, 400))
      }

      // 2. CHECK IF THE USER EXISTS && THEIR PASSWORD IS CORRECT

      // 3. IF EVERYTHING IS OK, SEND JWT BACK TO CLIENT
}