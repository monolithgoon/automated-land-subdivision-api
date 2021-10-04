const chalk = require('../utils/chalk-messages');
const mongoose = require("mongoose");


// TODO > WIP
const baseOptions = {
   discriminatorKey: "__geomType",
   collection: "processed_legacy_agcs",
};


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
});


// TODO > WIP
// const multiPolygonSchema = new mongoose.Schemma({});
// const pointSchema = new mongoose.Schemma({});


// 
const geometrySchema = new mongoose.Schema({
   type: {
      type: String,
      enum: [ 'Point', 'Polygon', 'MultiPolygon'],
      default: 'Polygon',
      // FIXME > CUSTOM VALIDATION DOES NOT SEEM TO BE WORKING 
      vallidate: {
         validateFn: function(geometryType) {
            console.log(`VALIDATING ...`);
            // if (geometryType === 'Point') { 
            //    return pointSchema
            // }
            let gjGeomSchema;
            gjGeomSchema = geometryType === "Point" ? pointSchema : polygonSchema
            gjGeomSchema = geometryType === "Polygon" ? polygonSchema : polygonSchema;
            return gjGeomSchema;
         }
      },
      required: [true, `A geometry type needs to be specified`],
   },
   coordinates: {
      type: [Array],
      required: [true, `This farm plot is missing its coordinates`],
      unique: [true, `A farm plot with these coordinates already exists in the database`]
   }
});


const farmerBiometricsSchema = new mongoose.Schema({
   farmer_id: {
      type: String,
      required: [true, `Each farmer must have a farmer_id.`],
      unique: [true, `The farmer's farmer_id must be unique.`],
      minLength: 12,
   },
   farmer_photo_url: {
      type: String,
   },
   farmer_names: {
      type: String,
      required: [true, `Please specify this [ ${this.farmer_id} ] farmer's names`],
      message: `Received {VALUE}`
   },
   farmer_gender: {
      type: String,
      enum: ["m", "f", "male", "female"],
      message: `{VALUE} is not a supported gender type.`
   },
   farmer_age: {
      type: Number,
   },
   farmer_phone_number_1: {
      type: Number,
      minLength: 11,
   },
   farmer_id_document_type: {
      type: String,
      enum: ["International Passport", "Voters Card", "NIN", "Drivers License"],
   },
   farmer_id_document_no: {
      type: String,
      unique: [true, `Another farmer with this identification document number: ${this.farmer_id_document_no} already exists in the database`]
   },
   farmer_country_origin: {
      type: String,
   }, 
   farmer_state_origin: {
      type: String,
   },
   farmer_lga_origin: {
      type: String,
   },
   farmer_home_address: {
      type: String,
   },
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
      plot_id: {
         type: String,
      },
      plot_size: {
         type: Number,
      },
      farmer_bio_data: farmerBiometricsSchema,
   },
});


// LEGACY AGC SCHEMA
const processedLegacyAgcSchema = new mongoose.Schema({

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
      
      legacy_agc_id: {
         type: String,
         required: [true, `Each legacy AGC must have a unique legacy_agc_id`],
         unique: [true, `A legacy AGC with this ID [ ${this.legacy_agc_id} ] already exists in the database`]
      },

      legacy_agc_name: {
         type: String,
         required: [true, `Each legacy AGC must have a unique legacy_agc_name.`],
         unique: [true, `A legacy AGC with this name [ ${this.legacy_agc_name} ] already exists in the database`]
      },

      legacy_agc_details: {
         total_num_plots: {
            type: Number,
         },
         total_allocations_area: {
            type: Number,
         },
         delineated_area: {
            type: Number,
         },
         primary_crop: {
            type: String,
         },
         state: {
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
const PROCESSED_LEGACY_AGC_MODEL = mongoose.model('processed_legacy_agcs', processedLegacyAgcSchema);


// EXPORT THE MODEL
module.exports = PROCESSED_LEGACY_AGC_MODEL;