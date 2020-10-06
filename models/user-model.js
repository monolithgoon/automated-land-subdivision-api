// MODEL FOR > USERNAME, EMAIL, PHOTO, PASSWORD & PASSWORD CONFIRM
const mongoose = require("mongoose");
const validator = require("validator")
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({

   user_first_name: {
      type: String,
      required: [true, "The first name of the user is required"]
   },

   user_last_name: {
      type: String,
      required: [true, "The last name of the user is required"]
   },

   user_email: {
      type: String,
      required: [true, "The email of the user of required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail],
   },

   photo_url: String,

   user_password: {
      type: String,
      required: [true, "The user must have a password"],
      minLength: 10,
   },

   password_confirm: {
      type: String,
      required: [true, "The user must confirm their password"],
      validate: {
         // IMPORTANT > This validator only works by calling USER_MODEL.save() OR USER_MODEL.create() & NOT WITH .findOne() && .updateOne() 
         validator: function(el) {
            return el === this.user_password; // the 'this' keyword refers to the current document..
         },
         message: "The password confirmation does not match"
      }
   }
})


// THIS PRE-SAVE MIDDDLEWARE RUNS BETWEEN GETTING THE DATA && SAVING IT TO THE DB
userSchema.pre('save', async function(next) {

   // PROCEED TO RETURN THE NEXT M.WARE IF THE P.WORD HAS NOT BEEN MODIFIED OR NEWLY CREATED
   // ie., ONLY RUN THE REMAINING CODE IN THIS M-WARE IF THE PASS. WAS MODIFIED
   if (!this.isModified('user_password')) return next();

   // HASH / ENCRYPT THE PASSWORD WITH COST OF 12
   this.user_password = await bcrypt.hash(this.user_password, 12);

   // DO NOT PERSIST PASS. CONFIRM TO DB
   this.password_confirm = undefined;

   next();
});


const USER_MODEL = mongoose.model('users', userSchema)


module.exports = USER_MODEL