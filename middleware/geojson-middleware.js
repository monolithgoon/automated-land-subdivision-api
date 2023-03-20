const chalk = require(`../utils/chalk-messages.js`);
const catchAsyncServer = require("../utils/catch-async-server.js");
const { ProcessGeoJSON } = require("./helpers.js");
const validateGeoJSON = require("../utils/geojson-validator.js");
const ServerError = require("../utils/server-error.js");

exports.validateGeoJSONBody = catchAsyncServer(async (req, res, next) => {
  console.log(chalk.success(`Called [ validateGeoJSONBody ] middleware fn.`));
  if(!validateGeoJSON(req.body)) throw new ServerError(`GeoJSON in 'req.body' is invalid`, 400)
  next();
}, `validateGeoJSONBody`)

/**
 * Adds a polygon feature to a GeoJSON FeatureCollection object
 * The polygon feature is computed from the union of all the individual Polygon features of the FeatureCollection
 *
 * @param {Object} featureColl - GeoJSON FeatureCollection object
 * @returns {Object} - GeoJSON FeatureCollection object with added "feat_coll_polygon_feature" property
 */
function addPolygonFeatureToFeatureColl(featureColl) {
  
  // Extract polygon feature from FeatureCollection using ProcessGeoJSON.getFeatCollPoly()
  const polygonFeature = ProcessGeoJSON.getFeatCollPoly(featureColl)

  // Remove the properties object from the newly constructed polygon object because its properties should be the props. of the cluster, and not the props. of the last feat. coll. feat. to be merged
  delete polygonFeature.properties;

  // Add a new property to the FeatureCollection object with the key "feat_coll_polygon_feature" and value set to polygonFeature
  featureColl.properties["feat_coll_polygon_feature"] = polygonFeature;

  console.log({ featureColl })

  // Return the updated FeatureCollection object
  return featureColl;
}

/**
 * Middleware function that adds a polygon feature to req.locals.appendedFarmProgramFeatColl
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.addFarmProgramPolygonFeature = catchAsyncServer(async (req, res, next) => {

  console.log(chalk.success(`Called [ addFarmProgramPolygonFeature ] middleware fn.`));

  // Get GeoJSON FeatureCollection from req.body
  const clusterFeatColl = req.body;

  if (!clusterFeatColl) {
    // If not, throw a ServerError with a descriptive error message
    return next(new ServerError(
      `Failed to add polygon feature: req.body is undefined`,
      500
    ));
  }

  // Call the helper function to add a polygon feature to the FeatureCollection object
  const updatedFeatureColl = addPolygonFeatureToFeatureColl(clusterFeatColl);

  // Set req.locals.appendedFarmProgramFeatColl to the updated FeatureCollection object
  req.locals.appendedFarmProgramFeatColl = updatedFeatureColl;

  next();

}, `addFarmProgramPolygonFeature`);

/**
 * 
 */
exports.addParcelizedClusterPolygonFeature = catchAsyncServer(async (req, res, next) => {

  console.log(chalk.success(`Called [ addParcelizedClusterPolygonFeature ] middleware fn.`));

  const clusterFeatColl = req.body;

  if (!clusterFeatColl) {
    // If not, throw a ServerError with a descriptive error message
    return next(new ServerError(
      `Failed to add polygon feature: req.locals.appendedFarmProgramFeatColl is undefined`,
      500
    ));
  }

  // Call the helper function to add a polygon feature to the FeatureCollection object
  const updatedFeatureColl = addPolygonFeatureToFeatureColl(clusterFeatColl);

  // Set req.body to the updated FeatureCollection object
  req.body = updatedFeatureColl;

  next();
}, `addParcelizedClusterPolygonFeature`)

// exports.addLegacyClusterPolygonFeature = catchAsyncServer(async (req, res, next) => {
//   const clusterFeatColl = req.locals.appendedFarmProgramFeatColl;
// }, `addLegacyClusterPolygonFeature`)