const mongoose = require("mongoose");



const geometrySchema = new mongoose.Schema({
   type: {
      type: String,
      enum: [ 'Polygon', 'MultiPolygon'],
      default: 'Polygon',
      required: [true, `A geometry type needs to be specified`],
   },
   coordinates: {
      type: [Array],
      required: true,
      unique: true
   }
});



// AGC SCHEMA
const agcSchema = new mongoose.Schema({
   type: {
      type: String,
      enum: ['Feature'],
      default: 'Feature',
      required: [true, 'The geojson type must be specified']
   },
   geometry: geometrySchema,
   properties: {
      agc_id: {
         type: String,
         required: [true, 'Each AGC must have an ID'],
         unique: [true, 'Each agc_id must be unique']
      },
      extended_name: {
         type: String,
         required: [true, 'The name of the AGC must be specified']
      },
      // governance_structure: agcGovSchema,
      governance_structure: {},
      // agc_details: agcDetailsSchema,
      agc_details: {},
      location: {
         type: String,
         required: [true, 'The location of the AGC must be specified']
      },
      farmers: Array
   }
});



// AGC DATA MODEL
const AGC_MODEL = mongoose.model('agcs', agcSchema);



// EXPORT THE MODEL
module.exports = AGC_MODEL;