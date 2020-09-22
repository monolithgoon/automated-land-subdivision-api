const mongoose = require("mongoose");



const pointSchema = new mongoose.Schema({
   type: {
      type: String,
      enum: ['Point'],
      minLength: 5,
      required: true
   },
   coordinates: {
      type: [Number],
      required: true,
      unique: false
   }
})



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
      required: true,
      unique: false
   }
})



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
   properties: {}
});



// FARMER SCHEMA
const farmerSchema = new mongoose.Schema({
   farmer_id: {
      type: String,
      required: [true, `The farmer must have a global ID`],
      unique: [true, `The farmer's global ID must be unique`]
   },
   first_name: {
      type: String,
      required: [true, `The farmer's first name must be specified`]
   },
   last_name: {
      type: String,
      required: [true, `The farmer's last name must be specified`]
   },
   allocation: {
      type: Number,
      required: [true, `Each farmer's land allocation must be specified`]
   }
})


// AGC SCHEMA
const agcSchema = new mongoose.Schema({
   type: {
      type: String,
      enum: ["FeatureCollection"],
      default: "FeatureCollection",
      required: true
   },
   features: {
      type: [featureSchema],
      required: [true, `The featureCollection must have at least one feature, or an array of features`],
      // validate: (entry) => Array.isArray(entry) && entry.length > 0, // RETURNS true or false
      validate: [(entry) => Array.isArray(entry) && entry.length > 0, `The AGC featureCollection must have at least one feature, or an array of features`],
   },
   properties: {
      agc_id: {
         type: String,
         required: [true, 'Each AGC must have an ID'],
         unique: [true, 'Each AGC must have a unique ID']
      },
      extended_name: {
         type: String,
         required: [true, 'The name of the AGC must be specified'],
         unique: [true, `The AGC name must be unique`]
      },
      location: {
         type: String,
         required: [true, 'The location of the AGC must be specified']
      },
      // governance_structure: agcGovSchema,
      governance_structure: {
         
      },
      // agc_details: agcDetailsSchema,
      agc_details: {
         
      },
      farmers: {
         type: [farmerSchema],
         required: [true, `The AGC must have at least one farmer, or an array of farmers`],
         validate: [(entry) => Array.isArray(entry) && entry.length > 0, `The AGC must have at least one farmer, or an array of farmers`]
      }
   }
})



// AGC DATA MODEL
const AGC_MODEL = mongoose.model('agcs', agcSchema);



// EXPORT THE MODEL
module.exports = AGC_MODEL