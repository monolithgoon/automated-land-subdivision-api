// MODEL FOR > USERNAME, EMAIL, PHOTO, PASSWORD & PASSWORD CONFIRM
const mongoose = require("mongoose");
const validator = require("validator")


const userSchema = new mongoose.Schema({

   first_name: {
      type: String,
      required: [true, "The first name of the user is required"]
   },

   last_name: {
      type: String,
      required: [true, "The last name of the user is required"]
   },

   email: {
      type: String,
      required: [true, "The email of the user of required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail],
   },

   photo: String,

   password: {
      type: String,
      required: [true, "The user must have a password"],
      minLength: 10,
   },

   password_confirm: {
      type: String,
      required: [true, "The user must confirm their password"],
      minLength: 10
   }
})


const USER_MODEL = mongoose.model('users', userSchema)


module.exports = USER_MODEL