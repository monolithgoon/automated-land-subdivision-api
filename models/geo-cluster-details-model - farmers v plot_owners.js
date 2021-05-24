const chalk = require('../utils/chalk-messages')
const mongoose = require("mongoose");



// PLOT OWNER SCHEMA
const plotOwnerSchema = new mongoose.Schema({
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
      required: [true, `This plot owner's (${this.plot_owner_id}) land allocation size must be specified`]
   }
});



// CLUSTER ALLOCATIONS SCHEMA
const clusterDetailsSchema = new mongoose.Schema({
   properties: {
   //    extended_name: {

   //    },
   //    cluster_location: {

   //    },
   //    governance_structure: {
         
   //    },
   //    cluster_details: {

   //    },
   // }
      geo_cluster_id: {
         type: String,
         required: [true, `This cluster details JSON document must have a reference to a geofile (eg., 'AGCABU000002').`],
         unique: [true, `A JSON document with this geo_cluster_id: [ ${this.geo_cluster_id} ] already exists in the database.`]
      },
      geo_cluster_name: {
            type: String,
            required: [true],
            unique: [true]
      },
      plot_owners: {
         type: [plotOwnerSchema],
         required: [true, `Each cluster must have at least one plot owner allocation, or an array of allocations.`],
         validate: [(entry => Array.isArray(entry) && entry.length > 0), `The cluster must have at least one plot owner allocation, or an array of allocations.`]
      },
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
   if (/ /.test(this.geo_cluster_id)) {
      return next(new Error(`Spaces are not allowed in the geo_cluster_id`));
   }
   return next();
})



// CALCULATE THE TOTAL. AREA OF ALLOCATIONS & SAVE TO A NEW PROP.
clusterDetailsSchema.pre('save', function(next) {
   const allocations = [];
   this.properties.plot_owners.forEach(plot_owner=>allocations.push(plot_owner.allocation));
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