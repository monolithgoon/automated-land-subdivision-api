`use strict`;
const mongoose = require(`mongoose`);

const farmProgramFeatCollSchema = new mongoose.Schema({}, { strict: false })

const CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL = mongoose.model("clustered_farm_program_feature_collections", farmProgramFeatCollSchema);

module.exports = CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL;