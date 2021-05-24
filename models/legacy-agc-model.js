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



// 
const geometrySchema = new mongoose.Schema({
   type: {
      type: String,
      enum: [ 'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],
      default: 'Polygon',
      // FIXME > CUSTOM VALIDATION DOES NOT SEEM TO BE WORKING 
      // vallidate: {
      //    validateFn: function(geometryType) {
      //       console.log(`VALIDATING ...`);
      //       // if (geometryType === 'Point') { 
      //       //    return pointSchema
      //       // }
      //       let schema;
      //       schema = geometryType === "Point" ? pointSchema : polygonSchema
      //       schema = geometryType === "Polygon" ? polygonSchema : polygonSchema;
      //       return schema;
      //    }
      // },
      required: [true, `A geometry type needs to be specified`],
   },
   coordinates: {
      type: [Array],
      required: [true, `This plot is missing its coordinates`],
      unique: [true, `A plot with these coordinates already exists in the database`]
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
   geometry: geometrySchema,
   properties: {
      // plot_owner_varst_id : { // REMOVE > DEPRE.
      //    type: String,
      // },
      plot_id : {
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
      // plot_owner_land_allocation : { // REMOVE > DEPRE.
      //    type: Number,
      // },
      plot_owner_allocation_size : {
         type: Number,
      },
      plot_owner_calc_allocation_size : {
         type: Number,
      },
      plot_owner_bvn : {
         type: Number,
      },
      plot_owner_base64: {
         type: Array,
         default: [],
      }
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

      geo_cluster_total_features: {
         type: Number,
         required: [true, `THIS FIELD IS REQUIRED`]
      },

      geo_cluster_delineated_area: {
         type: Number,
      },

      file_parse_metadata: {
         original_records_len: {
            type: Number,
            required: [true, `THIS FIELD IS REQUIRED`],
         },
         cluster_feats_len: {
            type: Number,
            required: [true, `THIS FIELD IS REQUIRED`],
         },
         geojson_area_parity: {
            type: Number,
            default: 0,
            required: [true, `THIS FIELD IS REQUIRED`],
         },
         records_discrepancy_perc: {
            type: Number,
            defalult: 0,
            required: [true, `THIS FIELD IS REQUIRED`],
         },
         records_discrepancy_num: {
            type: Number,
            default: 0,
            required: [true, `THIS FIELD IS REQUIRED`]
         },
         records_discrepancy_ok: {
            type: Boolean,
         },
      },

      geo_cluster_governance_structure: {
         president: {
            first_name: {
               type: String,
            },
            middle_name: {
               type: String,
            },
            last_name: {
               type: String,
            },   
         },
      },

      geo_cluster_details: {
         total_allocations_area: {
            type: Number,
         },
         delineated_area: {
            type: Number,
         },
         primary_crop: {
            type: String,
         },
         lga: {
            type: [String],
         },
         ward: {
            type: [String],
         },
      },

      db_insert_timestamp: {
         type: String,
         default: new Date().toISOString(),
         required: [true, `Please provide a timestamp when the AGC was inserted to the database`]
      }
   }
});



// INIT. THE DATA MODEL
// const LEGACY_AGC_MODEL = mongoose.model('legacy_agcs', legacyAgcSchema);
const LEGACY_AGC_MODEL = mongoose.model('legacy_agcs_v2', legacyAgcSchema);



// EXPORT THE MODEL
module.exports = LEGACY_AGC_MODEL;