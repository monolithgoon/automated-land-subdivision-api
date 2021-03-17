const chalk = require('../utils/chalk-messages')
const mongoose = require("mongoose");



// 
const polygonSchema = new mongoose.Schema({
   type: {
      type: String,
      enum: ["Polygon"],
      required: true,
   },
   coordinates: {
      type: [[[Number]]],
      required: true
   }
})



// PLOT OWNERS' FEATURE SCHEMA
const featureSchema = new mongoose.Schema({
   _id: {
      type: String
      // type: Mongoose.isValidObjectId,
   },
   type: {
         type: String,
         enum: ["Feature"],
         default: "Feature",
         required: true
      },
   geometry: polygonSchema,
   properties: {
      plot_owner_varst_id : {
         type: String,
      },
      plot_owner_first_name : {
         type: String,
      },
      plot_owner_middle_name : {
         type: String,
      },
      plot_owner_last_name : {
         type: String,
      },
      plot_owner_gender : {
         type: String,
      },
      plot_owner_land_allocation : {
         type: Number,
      },
      plot_owner_bvn : {
         type: Number,
      },
   }
});



// LEGACY AGC SCHEMA
const legacyAgcSchema = new mongoose.Schema({

   type: {
      type: String,
      enum: ["FeatureCollection"],
      default: "FeatureCollection",
      required: true
   },

   features: {
      type: [featureSchema],
      required: [true, `The FeatureCollection must have at least one feature, or an array of features`],
      validate: [(entry) => Array.isArray(entry) && entry.length > 0, `The legacy AGC FeatureCollection must have at least one feature, or an array of features`],
   }, 

   properties: {
      geo_cluster_id: {
         type: String,
         required: [true, `Each geo. cluster must have an ID`],
         unique: [true, `A geo. cluster with this ID [ ${this.geo_cluster_id} ] already exists in the database`]
      },

      geo_cluster_name: {
         type: String,
         required: [true, `The name of the geo. cluster must be specified.`],
         unique: [true, `A geo. cluster with this name [ ${this.geo_cluster_name} ] already exists in the database`]
      },

      geo_cluster_governance_structure: {
         president: {
            first_name: {
               type: String,
            },
            middle_name: {
               type: String,
            },
            president_last_name: {
               type: String,
            },   
         },
      },

      // agc_details: agcDetailsSchema,
      geo_cluster_details: {
         primary_crop: {
            type: String,
         },
         lga: {
            type: String,
         }
      },

      db_insert_timestamp: {
         type: String,
         default: new Date().toISOString(),
         required: [true, `Please provide a timestamp when the AGC was inserted to the database`]
      }
   }
});



// INIT. THE DATA MODEL
const LEGACY_AGC_MODEL = mongoose.model('legacy_agcs', legacyAgcSchema);



// EXPORT THE MODEL
module.exports = LEGACY_AGC_MODEL;