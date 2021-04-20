const chalk = require('../utils/chalk-messages')
const mongoose = require("mongoose");



// PLOT OWNER SCHEMA
const farmersSchema = new mongoose.Schema({
   farmer_id: {
      type: String,
      required: [true, `The farmer must have a unique, global ID`],
      unique: [true, `Another farmer with this ID: ${this.farmer_id} already exists in the database`]
   },
   farmer_bvn: {
      type: String,
      required: [true, `The farmer's BVN must be specified`],
      required: [true, `The farmer's BVN must be unique`],
   },
   farmer_first_name: {
      type: String,
      required: [true, `The farmer's first name must be specified`]
   },
   farmer_last_name: {
      type: String,
      required: [true, `The farmer's last name must be specified`]
   },
   farmer_photo_base64: {
      type: Array,
      required: [true, `The farmer must have a Base64 image string`],
      unique: [true, `The farmer's Base64 image string must be unique`],
   }
});



// CLUSTER ALLOCATIONS SCHEMA
const legacyAgcFarmersSchema = new mongoose.Schema({
   agc_id: {
      type: String,
      required: [true, `A unique AGC ID is required`],
      unique: [true, `A document with this agc_id: [ ${this.agc_id} ] already exists in the database`]
   },
   agc_name: {
         type: String,
         required: [true, `The name of the Legacy AGC is required`],
         unique: [false]
   },
   farmers: {
      type: [farmersSchema],
      required: [true, `Each Legacy AGC document must contain at least one farmer, or an array of farmers`],
      validate: [(entry => Array.isArray(entry) && entry.length > 0), `Each Legacy AGC document must contain at least one farmer, or an array of farmers`]
   },
   num_farmers: {
      type: Number,
      required: [true],
      default: 0,
   }
});



// PRE-SAVE M-WARE TO APPEND A TIMESTAMP TO THE DB SAVE OP.
legacyAgcFarmersSchema.pre('save', function(next) {

   const insertTimeStr = new Date().toISOString();
   this.db_insert_timestamp = insertTimeStr

   return next();
})



// DON'T SAVE JSON WHOSE geofile_ids HAS SPACES
legacyAgcFarmersSchema.pre('save', function(next) {
   if (/ /.test(this.agc_id)) {
      return next(new Error(`Spaces are not allowed in the agc_id.`));
   }
   return next();
})


// INIT. THE CUSTER ALLOCS. DATA MODEL
const LEGACY_AGC_FARMERS_MODEL = mongoose.model('legacy_agc_farmers', legacyAgcFarmersSchema);



// EXPORT THE MODEL
module.exports = LEGACY_AGC_FARMERS_MODEL;