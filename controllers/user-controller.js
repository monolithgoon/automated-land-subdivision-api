const USER_MODEL = require('../models/user-model.js');
const { request } = require('../app.js');



exports.getAllUsers = async (req, res) => {

   try {

      console.log('YOU CALLED THE getAllUsers CONTROLLER');
      const users = await USER_MODEL.find()

      res.status(200).json({
         status: "success",
         requested_at: request.requestTime,
         num_users: users.length,
         data: {
            users: users,
         }
      })
      
   } catch (error) {
      
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