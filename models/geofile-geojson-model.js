const mongoose = require("mongoose");

const geofileGeoJSONSchema = new mongoose.Schema({
   properties: {
      geofile_id: {
         type: String,
         required: [true, `The geofile_id is required`],
         unique: [true, `Each geofile_id must be unique`],
      },
      db_insert_timestamp: {
         type: String,
         default: new Date().toISOString(),
      },
   },
});

const GEOFILE_GEOJSON_MODEL = mongoose.model('converted_geofiles', geofileGeoJSONSchema);

module.exports = GEOFILE_GEOJSON_MODEL;