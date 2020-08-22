// MODEL FOR > USERNAME, EMAIL, PHOTO, PASSWORD & PASSWORD CONFIRM
const { mongoose } = require("mongoose");
const { validator } = require("validator")


const userSchema = new mongoose.Schema({

   name: {
      type: String,
      required: [true, "The name of the user is required"]
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

   passwordConfirm: {
      type: String,
      required: [true, "The user must confirm their password"],
      minLength: 10
   }
})


const USER_MODEL = mongoose.mmodel('users', userSchema)


module.exports = USER_MODEL