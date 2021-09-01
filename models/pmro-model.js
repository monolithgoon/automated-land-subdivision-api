const mongoose = require("mongoose");
const validator = require("validator")

const pmroSchema = new mongoose.Schema({
   pmro_serial_number: {
      type: Number,
      unique: [true, `The serial number of the PMRO must be unique`],
   },
   pmro_first_name: {
      type: String,
      required: [true, `The first name of the PMRO is required`],
   },
   pmro_middle_name: {
      type: String,
      required: false,
   },
   pmro_last_name: {
      type: String,
      required: [true, `The last name of the PMRO is required`],
   },
   pmro_email: {
      type: String,
      required: [true, `The email of the PMRO is required`],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail],
   },
   pmro_phone_number: {
      type: Number,
      required: [true, `The phone number of the PMRO is required`],
   },
   pmro_state: {
      type: String,
      required: [true, `The state where the PMRO is located is required`],
      unique: [true, `The state where the PMRO is located must be unique`],
   },
   pmro_state_url: {
      type: String,
      required: [true, `The state where the PMRO is located is required`],
      unique: [true, `The state where the PMRO is located must be unique`],
   },
   pmro_designation: {
      type: String,
   },
   pmro_photo_url: {
      type: String,
      // unique: [true, `The photo URL of this PMRO must be unique`],
   },
   pmro_photo_base64: Array,
   pmro_url: {
      type: String,
      default: `/api/v2/pmros/pmro/`,
      required: [true, `The hypermedia URL of this resource is required`],
   },
});


pmroSchema.pre(`save`, async function(next) {
   this.pmro_url = `/api/v2/pmros/pmro/${this.pmro_serial_number}/`;
   next();
});


const PMRO_MODEL = mongoose.model('pmros', pmroSchema);


module.exports = PMRO_MODEL;