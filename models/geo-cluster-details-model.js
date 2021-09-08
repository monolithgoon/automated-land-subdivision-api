const chalk = require('../utils/chalk-messages')
const mongoose = require("mongoose");



// PLOT OWNER SCHEMA
const plotOwnerSchemaV1 = new mongoose.Schema({
   _id: {
      type: String,
      unique: [true, `A farmer with this object _id: ${this._id} already exists in the database`]
   },
   farmer_id: {
      type: String,
      required: [true, `The farmer must have a global ID`],
      unique: [true, `A farmer with this ID: ${this.farmer_id} already exists in the database`]
   },
   farmer_bvn: {
      type: [Number, `The farmer's BVN must be a number`],
      required: [true, `The farmer's BVN must be specified`],
      unique: [true, `The farmer's BVN must be unique`],
      minLength: [11, `The farmer's BVN cannot be fewer than 11 digits`],
   },
   first_name: {
      type: String,
      required: [true, `The farmer's first name must be specified`],
      validate: [(entry => !entry || !/^\s*$/.test(entry)), `The farmer's first name cannot be an empty string.`],   
   },
   last_name: {
      type: String,
      required: [true, `The farmer's last name must be specified`],
      validate: [(entry => !entry || !/^\s*$/.test(entry)), `The farmer's last name cannot be an empty string.`]
   },
   farmer_photo: Array,
   // farmer_photo: {
   //    type: Buffer,
   //    unique: [true, `Each farmer's Base64 string must be unique`]
   // },
   // farmer_photo: {
   //    type: Array,
   //    required: true
   // },
   // farmer_photo_base64: Buffer,
   farmer_photo_url: {
      type: String,
      // FIXME > CHANGE THESE TO "true" 
      required: false,
      unique: [false,`This photo url ${this.farmer_photo_url} is already linked to another farmer in the database`]
   },
   allocation: {
      type: Number,
      required: [true, `This farmer's (${this.farmer_id}) land allocation size must be specified`]
   }
});

const plotOwnerSchemaV2 = new mongoose.Schema({
   plot_owner_id: {
      type: String,
      required: [true, `The plot owner must have a global ID`],
      unique: [true, `A plot owner with this ID: ${this.plot_owner_id} already exists in the database`]
   },
   plot_owner_first_name: {
      type: String,
      required: [true, `The plot owner's first name must be specified`]
   },
   plot_owner_last_name: {
      type: String,
      required: [true, `The plot owner's last name must be specified`]
   },
   plot_owner_photo_base64: Array,
   // plot_owner_photo_base64: {
   //    type: Array,
   //    required: true
   // },
   // plot_owner_photo_base64: {
   //    type: Buffer,
   //    unique: [true, `Each plot owner must have a unique Base64 photo string.`]
   // },
   // TODO > CREATE PRE SAVE M.WARE THAT CONVERTS THE base64 PHOTO AND SAVES IT TO DIR. / CDN 
   // plot_owner_photo_url: {
   //    type: String,
   //    required: false,
   //    unique: [true,`This photo url ${this.plot_owner_photo_base64} is already linked to another farmer in the database`]
   // },
   allocation: {
      type: Number,
      required: [true, `This farmer's (${this.plot_owner_id}) land allocation size must be specified`]
   }
});



// CLUSTER ALLOCATIONS SCHEMA
const clusterDetailsSchema = new mongoose.Schema({
   properties: {
   //    geo_cluster_id: { // TODO < CHANGE TO: geo_cluster_id

   //    },
   //    extended_name: {

   //    },
   //    cluster_location: {

   //    },
   //    governance_structure: {
         
   //    },
   //    cluster_details: {

   //    },
   //    farmers: { // TODO> CHANGE TO: plot_owners 

   //    }
   // }
      agc_id: {
         type: String,
         required: [true, `This cluster details JSON document must have a reference to a geofile (eg., 'AGCABU000002').`],
         unique: [true, `A JSON document with this geo_cluster_id: [ ${this.agc_id} ] already exists in the database.`]
      },
      extended_name: { // TODO > CHANGE TO: extended_cluster_name 
         // extended_cluster_name: {
            type: String,
            required: [true],
            unique: [true]
      },
      farmers: {
         type: [plotOwnerSchemaV1],
         required: [true, `Each cluster must have at least one farmer's allocation, or an array of allocations.`],
         validate: [(entry => Array.isArray(entry) && entry.length > 0), `The cluster must have at least one farmer's allocation, or an array of allocations.`]
      },
      // plot_owners: {
      //    type: [plotOwnerSchemaV2],
      //    required: [true, `Each cluster must have at least one plot owner allocation, or an array of allocations.`],
      //    validate: [(entry => Array.isArray(entry) && entry.length > 0), `The cluster must have at least one plot owner allocation, or an array of allocations.`]
      // },
      allocations_total: {
         type: Number,
         required: [true],
         default: 0,
      },
      num_plot_owners: {
         type: Number,
         required: [true],
         default: 0,
      }
   }
});



// PRE-SAVE M-WARE TO APPEND A TIMESTAMP TO THE DB SAVE OP.
clusterDetailsSchema.pre('save', function(next) {

   const insertTimeStr = new Date().toISOString();
   this.db_insert_timestamp = insertTimeStr

   return next();
})



// DON'T SAVE JSON WHOSE geofile_ids HAS SPACES
clusterDetailsSchema.pre('save', function(next) {
   if (/ /.test(this.agc_id)) {
      return next(new Error(`Spaces are not allowed in the agc_id.`));
   }
   return next();
})



// CALCULATE THE TOTAL. AREA OF ALLOCATIONS & SAVE TO A NEW PROP.
clusterDetailsSchema.pre('save', function(next) {
   const allocations = [];
   this.properties.farmers.forEach(farmer=>allocations.push(farmer.allocation));
   const totalAllocArea = allocations.reduce((alloc, sum) => alloc + sum);
   if (totalAllocArea > 0) {
      this.properties.allocations_total = totalAllocArea;
      this.properties.num_plot_owners = allocations.length;
   } else {
      return next(new Error(`The total allocated area cannot be 0. Please check your JSON file.`));
   }
   return next();
})



// INIT. THE CUSTER ALLOCS. DATA MODEL
const CLUSTER_DETAILS_MODEL = mongoose.model('geo_cluster_details', clusterDetailsSchema);



// EXPORT THE MODEL
module.exports = CLUSTER_DETAILS_MODEL;