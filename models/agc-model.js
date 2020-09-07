const mongoose = require("mongoose");



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
      // chunk_index: {
      //    type: Number,
      //    required: [true, "Each farm parcel in the AGC must have a parcel index"],
      //    unique: false
      // },
      // plot_id: {
      //    type: String,
      //    required: [true, "Each farm parcel in the AGC must have a unique ID"],
      //    // unique: true
      // },
      // chunk_size: {
      //    type: Number,
      //    required: [true, "Each farm parcel in the AGC must have an allocated size"],
      // },
      // farmer_id: {
      //    type: String,
      //    // required: [true, "Each farm parcel in the AGC must be assigned to a farmer"],
      //    required: false, // the chunk could be an unassigned leftover from parcelization process
      //    unique: true
      // },
      // center_lng: {
      //    type: Number,
      //    required: false
      // },
      // center_lat: {
      //    type: Number,
      //    required: false
      // },
      // coordinates: String
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
      required: [true, `The featureCollection must have at least one feature or an array of features`],
      validate: [(entry) => Array.isArray(entry) && entry.length > 0, `The AGC featureCollection must have at least one feature or an array of features`],
   },
   properties: {
      agc_id: {
         type: String,
         required: [true, 'Each AGC must have an ID'],
         unique: [true, 'Each AGC must have a unique ID']
      },
      location: String,
      farmers: Array
   }
})



// AGC DATA MODEL
const AGC_MODEL = mongoose.model('agcs', agcSchema);



// EXPORT THE MODEL
module.exports = AGC_MODEL