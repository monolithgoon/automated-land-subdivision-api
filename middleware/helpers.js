`use strict`
const turf = require('@turf/turf')
const chalk = require('../utils/chalk-messages.js');
const APP_CONFIG = require("../config");

const TurfHelpers = (() => {
	return {
		getType: (geoJSON) => {
			try {
				// console.log({geoJSON})
				return turf.getType(geoJSON);
			} catch (getTypeErr) {
				console.error(`getTypeErr: ${getTypeErr.message}`);
			}
		},

		buffer: (geoJSON, bufferRadius, { units = APP_CONFIG.turfPolygonBufferUnits }) => {
			// return catchError2(turf.buffer(geoJSON, bufferRadius, {units}), "turfBufferErr");

			try {
				return turf.buffer(geoJSON, bufferRadius, { units });
			} catch (turfBufferErr) {
				console.error(`turfBufferErr: ${turfBufferErr.message}`);
			}
		},

		midpoint: (coords1, coords2) => {
			try {
				return turf.midpoint(coords1, coords2);
			} catch (turfMidpointErr) {
				console.error(`turfMidpointErr: ${turfMidpointErr.message}`);
			}
		},

		centerOfMass: (featGeometry) => {
			try {
				return turf.centerOfMass(featGeometry);
			} catch (comErr) {
				console.error(`comErr: ${comErr.message}`);
			}
		},

		distance: (coords1, coords2, { distUnits }) => {
			try {
				return turf.distance(coords1, coords2, { units: distUnits });
			} catch (turfDistanceErr) {
				console.error(`turfDistanceErr: ${turfDistanceErr.message}`);
			}
		},

		centerOfMass: (geoJSONFeature) => {
			try {
				return turf.centerOfMass(geoJSONFeature);
			} catch (pointOnFeatErr) {
				console.error(`pointOnFeatErr: ${pointOnFeatErr.message}`);
			}
		},

		unkinkPolygon: (gjPolygon) => {
			try {
				return turf.unkinkPolygon(gjPolygon);
			} catch (unkinkPolyErr) {
				console.error(`unkinkPolyErr: ${unkinkPolyErr.message}`);
			}
		},

		getLngLat: (geoJSONFeature) => {
			try {
				return TurfHelpers.centerOfMass(geoJSONFeature).geometry.coordinates;
			} catch (getLngLatErr) {
				console.error(`getLngLatErr: ${getLngLatErr.message}`);
			}
		},

		calcPolyArea: (gjPolygon, { units = `hectares` } = {}) => {
			try {
				if (
					(gjPolygon && turf.getType(gjPolygon) === "Polygon") ||
					turf.getType(gjPolygon) === "MultiPolygon"
				) {
					let polyArea = turf.area(gjPolygon);

					switch (true) {
						case units === `hectares` || units === `ha.` || units === `ha`:
							polyArea = polyArea / 10000;
							break;
						case units === `acres` || units === `ac.` || units === `ac`:
							polyArea = polyArea / 4046.86;
							break;
						case units === `sqkm` || units === `square kilometers`:
							polyArea = polyArea / 1000000;
							break;
						case units === `sqm` || units === `square meters`:
							polyArea = polyArea;
							break;
						case !units:
							polyArea = polyArea;
						default:
							break;
					}

					return polyArea;
				}
			} catch (calcPolyAreaErr) {
				console.error(`calcPolyAreaErr: ${calcPolyAreaErr.message}`);
			}
		},
	};
})();

// REMOVE > DEPRC.
/**
 * @function getGeomCollPolygons 
 * @description Extracts the polygon features from a GeoJSON object that contains a geometry collection.
 * @param {Object} geojson - The GeoJSON object to extract polygon features from.
 * @returns {Array|null} An array of polygon features, or null if no polygon features were found.
 */
function getGeomCollPolyFeats_v1(geojson) {
	// Initialize the variable to store the polygon features
	let polygonFeats = [];
	
	// Check if the geojson exists and has geometries
	if (geojson && geojson.geometry && geojson.geometry.geometries) {
		// Loop through the geometries and extract the polygons
		const geomCollPolyFeatures = [];
		geojson.geometry.geometries.forEach((geom) => {
			if (TurfHelpers.getType(geom) === "Polygon") {
				const geomFeature = turf.feature(geom);
				geomCollPolyFeatures.push(geomFeature);
			}
		});
		// Check if there are any polygon features
		if (geomCollPolyFeatures.length > 0) {
			polygonFeats = geomCollPolyFeatures;
		}
	}
	
	return polygonFeats;
}
/**
 * @function getGeomCollPolygons 
 * @description Extracts the polygon geometries from a GeoJSON object that contains a geometry collection.
 * @param {Object} geojson - The GeoJSON object to extract polygons from.
 * @returns {Array|null} An array of polygon geometries, or null if no polygons were found.
 */
function getGeomCollPolygons(geojson) {

  // Initialize the variable to store the polygon features
  let polygonGeometries = [];

  // Check if the geojson exists and has geometries
  if (geojson && geojson.geometry && geojson.geometry.geometries) {
    // Loop through the geometries and extract the polygons
    const polygons = geojson.geometry.geometries.filter((geom) => {
      return turf.getType(geom) === "Polygon";
    })
		// REMOVE
			// .map((geom) => {
			//   return turf.feature(geom);
			// });
    // Check if there are any polygon features
    if (polygons.length > 0) {
      polygonGeometries = polygons;
    }
  }

  return polygonGeometries;
};

/**
 * Returns a usable geometry for a given GeoJSON input, handling multiple types of geometries
 * Extract Polygons MultiPolygons & GeometryCollections
 * Select the dominant Polygon or attempt to merge multi-polygons
 * @param {object} geoJSON - The GeoJSON geometry to refine
 * @returns {object} - An object containing the refined GeoJSON and any discarded multipoly parts
 */
function getUsablePolygonGeometry(geoJSON) {

	// Check that input is valid
	if (!geoJSON) {
		throw new Error("Invalid input geometry");
	};

	// Check that it has a type
	if (!TurfHelpers.getType(geoJSON)) {
		throw new Error("Invalid input geometry");
	};
	
	// Initialize variables
	let polygonFeats,
		refinedGeoJSON = null,
		discardedMultipolyParts = [];

	switch (TurfHelpers.getType(geoJSON)) {

		case "Point":
		case "LineString":
		case "MultiLineString":
			// Throw error if geoJSON is a Point, LineString, or MultiLineString
			throw new Error("Invalid input geometry");

		case "Polygon":
			// If it's already a polygon, do nothing
			refinedGeoJSON = geoJSON;
			break;

		case "MultiPolygon":
			// Convert MultiPolygon to Polygon features
			const multiPolyFeats = geoJSON.geometry.coordinates.map((polygonCoords) => {
				return turf.polygon(polygonCoords);
			});
			polygonFeats = multiPolyFeats;
			break;

		case "GeometryCollection":
			// Get polygon features from GeometryCollection
			polygonFeats = getGeomCollPolygons(geoJSON);
			break;

		default:
			throw new Error("Invalid input geometry");
	};

	// If polygon features are found and there's more than one, refine the geometry
	if (polygonFeats && polygonFeats.length > 0) {
		
		// Only one polygon was found
		if (polygonFeats.length === 1) {

			refinedGeoJSON = polygonFeats[0];

		} else {

			// Loop through the features and choose the dominant feature
			for (let feature of polygonFeats) {

				const featureAreaRatio =
					TurfHelpers.calcPolyArea(feature) / TurfHelpers.calcPolyArea(geoJSON);

				if (featureAreaRatio >= 0.6) {

					// Choose the dominant feature
					refinedGeoJSON = feature;

				} else if (featureAreaRatio >= 0.4 && featureAreaRatio < 0.6) {

					// The features are probably similar in size, so try to merge them
					refinedGeoJSON = ProcessGeoJSON.bufferUniteFeats(polygonFeats, {
						maxBufferAmt: 0.05,
						bufferStep: 0.0025,
					});

					console.log({refinedGeoJSON})

					if (!refinedGeoJSON) {
						console.log(chalk.warningBright(`Failed to refine GeoJSON`));
						discardedMultipolyParts.push(...polygonFeats);
					}

				} else if (featureAreaRatio >= 0.005 && featureAreaRatio < 0.4) {

					// Track small, but not insignificant features
					feature.properties["chunk_size"] = TurfHelpers.calcPolyArea(feature);
					discardedMultipolyParts.push(feature);

				} else if (featureAreaRatio > 0 && featureAreaRatio < 0.005) {
					// TODO > Ignore these tiny particles??
					// discardedMultipolyParts.push(feature)
				}
			}
		}
	} else {
		// No complex geometries to simplify
		// console.log(chalk.warningBright((`No complex geometries to simplify ..`))
	}

	// Return the refined GeoJSON and any discarded multipoly parts
	return {
		refinedGeoJSON,
		discardedMultipolyParts,
	};
}

/**
 * This fn. accepts a GeoJSON polygon feature and buffers it by a specified amount using Turf.js library's buffer function.
 * The function also includes some additional code to handle potential issues that can arise when buffering polygons using Turf.js. For example, sometimes buffering a polygon can cause it to become distorted, so the function reverts the buffer to the original polygon if it detects any deformation.
 * Additionally, Turf.js buffer function may sometimes return undefined, so the function checks for this and returns the original polygon if necessary.
 * The function also calculates the area of the original polygon and the buffered polygon, and based on these values, it decides whether to return the original polygon or the buffered polygon.
 * @param {Object} gjPolygon - GeoJSON polygon feature
 * @param {number} bufferAmt - Buffer amount
 * @param {Object} [options] - Optional parameters
 * @param {string} [options.bufferUnits=APP_CONFIG.turfPolygonBufferUnits] - Buffer units
 * @returns {Object} - Buffered GeoJSON polygon feature
 */
// HACK > This inadvertently removes "tails" from the cluster polygon features
function getBufferedPolygon(gjPolygon, bufferAmt, { bufferUnits = APP_CONFIG.turfPolygonBufferUnits } = {}) {

	// Check if gjPolygon exists
	if (gjPolygon) {

		// Return original if `bufferAmt` == 0
		if (bufferAmt === 0) return gjPolygon;

		// Buffer the polygon using Turf.js
		let bufferedPolygonFeat = TurfHelpers.buffer(gjPolygon, bufferAmt, { units: bufferUnits });

		// Handle potential issues with Turf.js buffer function
		if (bufferedPolygonFeat) {

			// Re-instate properties deformed by buffering op.
			bufferedPolygonFeat["_id"] = gjPolygon._id;
			
			// Re-instate properties deformed by buffering op.
			bufferedPolygonFeat.geometry["_id"] = gjPolygon.geometry._id;

			// Calculate area of original and buffered polygons
			const originalArea = TurfHelpers.calcPolyArea(gjPolygon);
			// console.log({originalArea})
			const bufferedArea = TurfHelpers.calcPolyArea(bufferedPolygonFeat);
			// console.log({bufferedArea})
			console.log(chalk.highlight(originalArea > bufferedArea))

			// Decide whether to return original or buffered polygon
			if (originalArea < APP_CONFIG.minimumBufferArea) {
				// Return original polygon if area is too small
				return gjPolygon;
			} else if (TurfHelpers.getType(gjPolygon) !== TurfHelpers.getType(bufferedPolygonFeat)) {
				// Return original polygon if types are different
				return gjPolygon;
			} else if (bufferAmt > 0 && bufferedArea < originalArea) {
				// Return original polygon if buffer caused -ve deformation
				return gjPolygon;
			} else if (bufferAmt < 0 && bufferedArea > originalArea) {
				// Return original polygon if negative buffer caused +ve deformation
				return gjPolygon;
			} else {
				// Return buffered polygon
				return bufferedPolygonFeat;
			}
		} else {
			// Return original polygon if Turf.js buffer function returns undefined
			return gjPolygon;
		}
	} else {
		// Return null if gjPolygon is null or undefined
		return null;
	}
};

ProcessGeoJSON = (() => {

	return {

		getId: (geoJSON) => {
			try {
				if (turf.getType(geoJSON) === `FeatureCollection`)
					return `feature_collection_${geoJSON._id}`;
				else if (geoJSON.geometry._id) return `feature_${geoJSON.geometry._id}`;
			} catch (getGeoJSONIdErr) {
				console.error(`getGeoJSONIdErr: ${getGeoJSONIdErr.message}`);
			}
		},

		/**
		 * Buffers and unites an array of features.
		 * This function buffers the input features with a certain amount and then unites them.
		 * The amount of buffering and the maximum amount of buffering can be specified using the options object.
		 * Note that if `maxBufferAmt` and `bufferStep` are not provided in the options object, the function will simply return the united features without buffering them.
		 * @param {Object[]} featsArray - The array of features to buffer and unite.
		 * @param {Object} [options] - The options object.
		 * @param {number} [options.maxBufferAmt] - The maximum buffer amount.
		 * @param {number} [options.bufferStep] - The buffer step amount.
		 * @returns {Object} The united polygon feature.
		 */
		// REMOVE > DEPRC.
		bufferUniteFeats_v1: (featsArray, { maxBufferAmt, bufferStep } = {}) => {

			// Initialize an array to store the buffered features
			const bufferedFeats = [];

			try {

				// If the maximum buffer amount and the buffer step are specified, buffer the features multiple times
				if (maxBufferAmt && bufferStep) {

					// Start with the buffer step
					let bufferAmount = bufferStep;

					// Keep buffering until the buffer amount exceeds the maximum buffer amount
					while (bufferAmount <= maxBufferAmt) {

						bufferAmount += bufferStep;

						// Buffer each feature and store it in the bufferedFeats array
						for (let idx = 0; idx < featsArray.length; idx++) {
							let feat = featsArray[idx];
							feat = getBufferedPolygon(feat, bufferAmount);
							bufferedFeats.push(feat);
						}

						// Unite the buffered features
						const unitedFeats = turf.union(...bufferedFeats);
						console.log({unitedFeats})

						// If the result is a polygon, return it
						if (TurfHelpers.getType(unitedFeats) === "Polygon") return unitedFeats;
					}
				}

				// If the maximum buffer amount and the buffer step are not specified, unite the features as they are
				else {
					return turf.union(...featsArray);
				}
			} catch (bufferFeatsErr) {
				console.error(`bufferFeatsErr: ${bufferFeatsErr.message}`);
			}
		},
		bufferUniteFeats: (featsArray, { maxBufferAmt, bufferStep } = {}) => {

			// Initialize an array to store the buffered features
			const bufferedFeats = [];
		
			try {

				// If the maximum buffer amount and the buffer step are specified, buffer the features multiple times
				if (maxBufferAmt && bufferStep) {
		
					// Start with the buffer step
					let bufferAmount = bufferStep;
		
					// Keep buffering until the buffer amount exceeds the maximum buffer amount
					while (bufferAmount <= maxBufferAmt) {
						// Buffer each feature and store it in the bufferedFeats array
						for (let idx = 0; idx < featsArray.length; idx++) {
							let feat = featsArray[idx];
							feat = getBufferedPolygon(feat, bufferAmount);
							bufferedFeats.push(feat);
						}
		
						// Unite the buffered features
						const unitedFeats = turf.union(...bufferedFeats);
		
						// If the result is a polygon, return it
						if (TurfHelpers.getType(unitedFeats) === "Polygon") {
							return unitedFeats;
						}
		
						// If the result is not a polygon, clear the buffer array and increase the buffer amount
						bufferedFeats.length = 0;
						bufferAmount += bufferStep;
					}
				}
				
				// If the maximum buffer amount and the buffer step are not specified, unite the features as they are
				else {
					const unitedFeats = turf.union(...featsArray);
					if (TurfHelpers.getType(unitedFeats) === "Polygon") {
						return unitedFeats;
					}
				}
			} catch (bufferFeatsErr) {
				console.error(`bufferFeatsErr: ${bufferFeatsErr.message}`);
			}
		
			// If no polygon feature was produced, return null
			return null;
		},

		getPresentationPoly: (geoJSONPoly, { useBuffer, bufferAmt, bufferUnits = DEFAULT_APP_SETTINGS.TURF_POLYGON_BUFFER_UNITS }) => {
			const presentationPolygon = useBuffer
				? getBufferedPolygon(geoJSONPoly, bufferAmt, { bufferUnits })
				: geoJSONPoly;
			return presentationPolygon;
		},

		// IMPORTANT
		/**
		 * @description Returns a polygon GeoJSON object that represents the union of all the polygons in the given FeatureCollection.
		 * @param {Object} featColl - A FeatureCollection object with polygon features.
		 * @param {Object} [options={}] - An object that specifies the optional parameters to use.
		 * @param {Boolean} [options.useBuffer] - Specifies whether to buffer the polygon or not.
		 * @param {Number} [options.bufferAmt] - The amount to buffer the polygon by, in the units specified by `bufferUnits`.
		 * @param {String} [options.bufferUnits] - The units to use for buffering the polygon.
		 * @returns {Object} A GeoJSON polygon object representing the union of all the polygons in the given FeatureCollection.
		 */
		getFeatCollPoly: (featColl, { useBuffer, bufferAmt, bufferUnits } = {}) => {
			try {
				// Ensure that the input object is a FeatureCollection with polygons
				turf.geojsonType(featColl, "FeatureCollection", "getFeatCollPolyErr");

				// Get the union of all polygons and refine it if necessary
				let featCollPoly = getUsablePolygonGeometry(turf.union(...featColl.features)).refinedGeoJSON;

				// Buffer the polygon if specified
				if (featCollPoly && useBuffer) {
					featCollPoly = ProcessGeoJSON.getPresentationPoly(featCollPoly, {useBuffer, bufferAmt, bufferUnits});
				}

				// Debugging console.log statements
				// console.log({bufferAmt})
				// console.log(turf.area(featCollPoly))

				return featCollPoly;

			} catch (getFeatCollPolyErr) {
				// If there is an error, log it and return null
				console.error(chalk.fail(`getFeatCollPolyErr: ${getFeatCollPolyErr.message}`));
				return null;
			}
		},

		getBbox: (geoJSON) => {
			try {
				return turf.bbox(geoJSON);z
			} catch (getBboxErr) {
				console.error(`getBboxErr: ${getBboxErr.message}`);
			}
		},

		getBboxPoly: (geoJSON) => {
			try {
				return turf.bboxPolygon(ProcessGeoJSON.getBbox(geoJSON));
			} catch (getBboxPolyErr) {
				console.error(`getBboxPolyErr: ${getBboxPolyErr.message}`);
			}
		},
	};
})();

module.exports = {
	TurfHelpers,
	getGeomCollPolygons,
	getUsablePolygonGeometry,
	getBufferedPolygon,
	ProcessGeoJSON,
}