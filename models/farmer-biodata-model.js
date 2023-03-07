`use strict`;
const mongoose = require(`mongoose`);
const { v4: uuidv4 } = require("uuid");

const farmerBiodataSchema = new mongoose.Schema({}, { strict: false })

const FARMER_BIODATA_MODEL = mongoose.model("farmers", farmerBiodataSchema);

module.exports = FARMER_BIODATA_MODEL;