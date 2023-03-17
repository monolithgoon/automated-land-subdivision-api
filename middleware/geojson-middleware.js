const chalk = require(`../utils/chalk-messages.js`);
const catchAsyncServer = require("../utils/catch-async-server.js");
const { ProcessGeoJSON } = require("./helpers.js");

exports.getFarmProgramPolygon = catchAsyncServer(async (req, res, next) => {

  console.log(chalk.success(`CALLED [ getFarmProgramPolygon ] MIDDLWARE FN. `));

  const farmProgramFeatColl = req.locals.appendedFarmProgramFeatColl;

  if (!farmProgramFeatColl)
  return next(new ServerError(
    `Something went wrong: can't find <req.locals.appendedFarmProgramFeatColl>`,
    500
  ));

  req.locals.farmProgramPolygon = ProcessGeoJSON.getFeatCollPoly(farmProgramFeatColl)

  next();

}, `getFarmProgramPolygn`)

// exports.getParcelizedClusterPolygon = catchAsyncServer(async (req, res, next) => {
//   const clusterFeatColl = req.locals.appendedFarmProgramFeatColl;
// }, `getParcelizedClusterPolygon`)

// exports.getLegacyClusterPolygon = catchAsyncServer(async (req, res, next) => {
//   const clusterFeatColl = req.locals.appendedFarmProgramFeatColl;
// }, `getLegacyClusterPolygon`)