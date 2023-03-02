`use strict`;
const mongoose = require(`mongoose`);
const { v4: uuidv4 } = require("uuid");

const farmerBiodataSchema = new mongoose.Schema({
  // farmer_global_id: {
  //   type: String,
  //   default: uuidv4(),
  //   required: true,
  //   unique: true,
  // }
}, { strict: false })

const FARMER_BIODATA_MODEL = mongoose.model("farmers", farmerBiodataSchema);

module.exports = FARMER_BIODATA_MODEL;