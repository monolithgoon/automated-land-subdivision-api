const turf = require('@turf/turf')

const TurfHelpers = (() => {
	return {
		getType: (geoJSON) => {
			try {
				return turf.getType(geoJSON);
			} catch (getTypeErr) {
				console.error(`getTypeErr: ${getTypeErr.message}`);
			}
		},

		buffer: (geoJSON, bufferRadius, { units = DEFAULT_APP_SETTINGS.TURF_POLYGON_BUFFER_UNITS }) => {
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

/**
 * Extracts the Polygon features from a GeoJSON geometry collection and returns them as an array.
 *
 * @param {Object} geojson - The GeoJSON object.
 * @return {Array<Object>} The Polygon features from the GeoJSON geometry collection, or `null` if there are no polygons.
 */
function getGeomCollPolyFeats(geojson) {
	const geomCollPolyFeatures = [];

	geojson.geometry.geometries.forEach((geom) => {
		// EXTRACT THE POLYGONS
		if (TurfHelpers.getType(geom) === "Polygon") {
			const geomFeature = turf.feature(geom);

			geomCollPolyFeatures.push(geomFeature);

			polygonFeats = geomCollPolyFeatures;
		} else {
			// NO POLYGONS IN THE GEOM. COLL.
			polygonFeats = null;
		}
	});

	return polygonFeats;
}

/**
 * Returns a usable geometry for a given GeoJSON input, handling multiple types of geometries
 * Extract Polygons MultiPolygons & GeometryCollections
 * Select the dominant Polygon or attempt to merge multi-polygons
 * @param {object} geoJSON - The GeoJSON geometry to refine
 * @returns {object} - An object containing the refined GeoJSON and any discarded multipoly parts
 */
function getUsableGeometry(geoJSON) {

	// Check that input is valid
	if (!geoJSON || !TurfHelpers.getType(geoJSON)) {
		throw new Error("Invalid input geometry");
	}
	
	// Initialize variables
	let polygonFeats,
		refinedGeoJSON,
		discardedMultipolyParts = [];

	// Determine the geometry type
	switch (TurfHelpers.getType(geoJSON)) {
		case "Polygon":
			// If it's already a polygon, do nothing
			(refinedGeoJSON = geoJSON), (discardedMultipolyParts = null);
			break;

		case "MultiPolygon":
			// Convert MultiPolygon to Polygon features
			const multiPolyFeats = [];
			for (let idx = 0; idx < geoJSON.geometry.coordinates.length; idx++) {
				const polygonCoords = geoJSON.geometry.coordinates[idx];
				multiPolyFeats.push(turf.polygon(polygonCoords));
				polygonFeats = multiPolyFeats;
			}

			break;

		case "GeometryCollection":
			// Get polygon features from GeometryCollection
			polygonFeats = getGeomCollPolyFeats(geoJSON);
			break;

		default:
			break;
	}

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

					if (TurfHelpers.getType(refinedGeoJSON) !== "Polygon") {
						console.error(`FAILED REFINING GEOJSON`);
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
		// console.warn(`No complex geometries to simplify ..`)
	}

	// Return the refined GeoJSON and any discarded multipoly parts
	return {
		refinedGeoJSON,
		discardedMultipolyParts,
	};
}

exports.ProcessGeoJSON = (() => {

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
						bufferAmount += bufferStep;

						// Buffer each feature and store it in the bufferedFeats array
						for (let idx = 0; idx < featsArray.length; idx++) {
							let feat = featsArray[idx];
							feat = _getBufferedPolygon(feat, bufferAmount);
							bufferedFeats.push(feat);
						}

						// Unite the buffered features
						const unitedFeats = turf.union(...bufferedFeats);

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


		getPresentationPoly: (geoJSONPoly, { useBuffer, bufferAmt, bufferUnits = DEFAULT_APP_SETTINGS.TURF_POLYGON_BUFFER_UNITS }) => {
			const presentationPolygon = useBuffer
				? _getBufferedPolygon(geoJSONPoly, bufferAmt, { bufferUnits })
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
				let featCollPoly = getUsableGeometry(turf.union(...featColl.features)).refinedGeoJSON;

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
				console.error(`getFeatCollPolyErr: ${getFeatCollPolyErr.message}`);
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