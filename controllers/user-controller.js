const USER_MODEL = require('../models/user-model.js');
const { request } = require('../app.js');



exports.getAllUsers = async (req, res) => {

   try {

      console.log('YOU CALLED THE getAllUsers CONTROLLER');
      console.log(req.query);

      const usersData = await USER_MODEL.find()

      res.status(200).json({
         status: "success",
         requested_at: req.requestTime,
         num_users: usersData.length,
         data: {
            users: usersData,
         }
      });
      
   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That GET request failed.',
         error_msg: err.message,
      })
   }
}


exports.createUser = async (req, res) => {

}


exports.getUser = async (req, res) => {

}


exports.updateUser = async (req, res) => {


}


exports.deleteUser = async (req, res) => {

}