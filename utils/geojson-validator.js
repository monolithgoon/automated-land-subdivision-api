/**
 * Checks if a variable is an object
 *
 * @param {*} obj - The variable to check
 * @returns {boolean} - Returns true if the variable is an object, false otherwise
 */
function isObject(obj) {
	return typeof obj === "object" && obj !== null;
}

/**
 * Checks if the GeoJSON object is a `Feature` or a `FeatureCollection`
 *
 * @param {object} geoJSON - The GeoJSON object to validate
 * @returns {boolean} - Returns true if the GeoJSON object is a `Feature` or a `FeatureCollection`, false otherwise
 */
function isFeatureOrFeatureCollection(geoJSON) {
	return geoJSON.type === "Feature" || geoJSON.type === "FeatureCollection";
}

/**
 * Checks if the `Feature` object has a `geometry` object
 *
 * @param {object} feature - The `Feature` object to validate
 * @returns {boolean} - Returns true if the `Feature` object has a `geometry` object, false otherwise
 */
function hasGeometry(feature) {
	return isObject(feature.geometry);
}

/**
 * Checks if the value of the `geometry.type` property in the GeoJSON object is a valid GeoJSON geometry type
 *
 * @param {object} feature - The GeoJSON Feature object to validate
 * @returns {boolean} - Returns true if the value of the `geometry.type` property is a valid GeoJSON geometry type, false otherwise
 */
function hasValidGeometryType(feature) {
	const validTypes = [
		"Point",
		"MultiPoint",
		"LineString",
		"MultiLineString",
		"Polygon",
		"MultiPolygon",
		"GeometryCollection",
	];
	return validTypes.includes(feature.geometry.type);
}

/**
 * Checks if the `FeatureCollection` object has a `features` property that is an array
 *
 * @param {object} featureCollection - The `FeatureCollection` object to validate
 * @returns {boolean} - Returns true if the `FeatureCollection` object has a `features` property that is an array, false otherwise
 */
function hasFeatures(featureCollection) {
	return Array.isArray(featureCollection.features);
}

/**
 * Checks if all features in a GeoJSON feature collection are valid.
 *
 * @param {Object} featureCollection - The GeoJSON feature collection to check.
 * @returns {boolean} - True if all features are valid, false otherwise.
 */
function hasValidFeatures(featureCollection) {
	// Loop through all the features in the collection
	for (let i = 0; i < featureCollection.features.length; i++) {
		// If a feature is not a valid GeoJSON object, return false
		if (!validateGeoJSON(featureCollection.features[i])) {
			return false;
		}
	}
	// If all features are valid, return true
	return true;
}

function isArrayWithLength(array, length) {
	return Array.isArray(array) && array.length === length;
}

function isNumber(value) {
	return typeof value === "number";
}

function validateCoordinatePair(coordinates) {
	return (
		isArrayWithLength(coordinates, 2) && isNumber(coordinates[0]) && isNumber(coordinates[1])
	);
}

function validatePoint(geoJSON) {
	return (
		isArrayWithLength(geoJSON.geometry.coordinates, 2) && isNumber(geoJSON.geometry.coordinates[0]) && isNumber(geoJSON.geometry.coordinates[1])
	);
}

function validateMultiPoint(geoJSON) {
	return Array.isArray(geoJSON.geometry.coordinates) && geoJSON.geometry.coordinates.every((point) => validateCoordinatePair(point));
}

function validateLineString(geoJSON) {
	return (
		Array.isArray(geoJSON.geometry.coordinates) &&
		geoJSON.geometry.coordinates.length >= 2 &&
		geoJSON.geometry.coordinates.every((point) => validateCoordinatePair(point))
	);
}

function validateMultiLineString(geoJSON) {
	return (
		Array.isArray(geoJSON.geometry.coordinates) &&
		geoJSON.geometry.coordinates.every(
			(lineString) =>
				Array.isArray(lineString) && lineString.length >= 2 && lineString.every((point) => validateCoordinatePair(point))
		)
	);
}

function validatePolygon(geoJSON) {
	return (
		Array.isArray(geoJSON.geometry.coordinates) &&
		geoJSON.geometry.coordinates.every(
			(linearRing) =>
				Array.isArray(linearRing) &&
				linearRing.length >= 4 &&
				linearRing[0].toString() === linearRing[linearRing.length - 1].toString() &&
				linearRing.every((point) => validateCoordinatePair(point))
		)
	);
}

function validateMultiPolygon(geoJSON) {
	return (
		Array.isArray(geoJSON.geometry.coordinates) &&
		geoJSON.geometry.coordinates.every(
			(polygon) =>
				Array.isArray(polygon) &&
				polygon.every(
					(linearRing) =>
						Array.isArray(linearRing) &&
						linearRing.length >= 4 &&
						linearRing[0].toString() === linearRing[linearRing.length - 1].toString() &&
						linearRing.every((point) => validateCoordinatePair(point))
				)
		)
	);
}

function validateGeoJSON(geoJSON) {
  
	isObject(geoJSON);

	isFeatureOrFeatureCollection(geoJSON);

	switch (geoJSON.type) {

		case "Feature":

			hasGeometry(geoJSON) && hasValidGeometryType(geoJSON);

			switch (geoJSON.geometry.type) {

				case "Point":
					return validatePoint(geoJSON);

				case "MultiPoint":
					return validateMultiPoint(geoJSON);

				case "LineString":
					return validateLineString(geoJSON);

				case "MultiLineString":
					return validateMultiLineString(geoJSON);

				case "Polygon":
					return validatePolygon(geoJSON);

				case "MultiPolygon":
					return validateMultiPolygon(geoJSON);

				case "GeometryCollection":
					// TODO

				default:
					return false;
			}

		case "FeatureCollection":
			return hasFeatures(geoJSON) && hasValidFeatures(geoJSON);

		default:
			return false;
	}
}

module.exports = validateGeoJSON;
