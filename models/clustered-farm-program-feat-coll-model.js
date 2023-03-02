`use strict`;
const mongoose = require(`mongoose`);

const farmProgramFeatCollSchema = new mongoose.Schema({})

const CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL = mongoose.model("clustered_farm_program_feat_collections", farmProgramFeatCollSchema);

module.exports = CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL;