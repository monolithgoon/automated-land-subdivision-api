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
   properties: {
      chunk_index: {
         type: Number,
         required: [true, "Each farm parcel in the AGC must have a parcel index"],
         unique: false
      },
      chunk_id: {
         type: String,
         required: [true, "Each farm parcel in the AGC must have a unique ID"],
         // unique: true
      },
      chunk_size: {
         type: Number,
         required: [true, "Each farm parcel in the AGC must have an allocated size"],
      },
      farmer_id: {
         type: String,
         // required: [true, "Each farm parcel in the AGC must be assigned to a farmer"],
         required: false, // the chunk could be an unassigned leftover from parcelization process
         unique: true
      },
      center_lng: {
         type: Number,
         required: false
      },
      center_lat: {
         type: Number,
         required: false
      },
      coordinates: String
   }
})



// PARCELIZED AGC SCHEMA
const parcelizedAgcSchema = new mongoose.Schema({
   type: {
      type: String,
      enum: ["FeatureCollection"],
      default: "FeatureCollection",
      required: true
   },
   features: {
      type: [featureSchema],
      required: [true, `The featureCollection must have at least one feature or an array of features`],
      // validate: (entry) => Array.isArray(entry) && entry.length > 0, // RETURNS true or false
      validate: [(entry) => Array.isArray(entry) && entry.length > 0, `The AGC featureCollection must have at least one feature or an array of features`],
   },
   properties: {
      agc_id: {
         // required: [true, 'Each parcelized AGC must have an ID'],
         // unique: true
      },
      location: String,
      agc_center_coords: Array,
      num_farmers: {
         type: Number,
         required: [true, 'Each parcelized AGC must have a specified number of farmers']
      },
      total_allocation: {
         type: Number,
         required: [true, 'Each parcelized AGC must have the total allocation specified']
      },
      agc_area: {
         type: Number,
         required: [true, 'Each parcelized AGC must have its area specified']
      },
      unused_land_area: Number
   }
})



// PARCELIZED AGC DATA MODEL
const PARCELIZED_AGC_MODEL = mongoose.model('parcelized_agcs', parcelizedAgcSchema);



// EXPORT THE MODEL
module.exports = PARCELIZED_AGC_MODEL