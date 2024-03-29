/**
 * Enum object containing various enumerations for use in Mongoose models.
 * @typedef {Object} MongooseModelEnums
 * @property {string[]} LAND_SIZE_UNITS - Array of strings representing different units of land size.
 * @property {string[]} GENDER - Array of strings representing different genders.
 */

/**
 * Object containing different Mongoose model enumerations.
 * @type {MongooseModelEnums}
 * @readonly
 */
const MONGOOSE_MODEL_ENUMS = {
	LAND_SIZE_UNITS: Object.freeze(["sqm", "sqkm", "acres", "hectares"]),
	LAND_SIZE_UNIT_MINIMUMS: Object.freeze({
    sqm: 100,
    sqkm: 0.0001,
    acres: 0.0247,
    hectares: 0.01
  }),
	GENDER: Object.freeze(["M", "F"]),
};

/**
 * Exports the Mongoose model enumerations object.
 * @type {MongooseModelEnums}
 * @readonly
 */
module.exports = MONGOOSE_MODEL_ENUMS;
