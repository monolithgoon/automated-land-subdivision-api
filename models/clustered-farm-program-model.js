`use strict`;
const mongoose = require(`mongoose`);
const MONGOOSE_MODEL_ENUMS = require("../constants/mongoose-model-enums");
const NGA_STATES_NAMES = require("../constants/nga-states-names");

/** PROGRAM FARMER SCHEMA VALIDATORS */

function alphaNumericValidator() {
	return {
		validator: (val) => {
			/**
			 * In this pattern, the square brackets ([]) still contain the set of characters that are allowed in the string, including the underscore.
			 * However, the asterisk (+) metacharacter after the brackets means that the preceding character class (i.e., the set of allowed characters) can appear one or more times.
			 * This allows for the possibility that the underscore may be absent from the string.
			 */
			const regex = /^[a-zA-Z0-9_]+$/;
			return regex.test(val);
		},
		message: `Only numbers, letters or underscores are allowed`,
	};
}

const nameValidator = (fieldName) => {
	return [
		{
			validator: (value) => {
				const regex = /^[a-zA-Z]+$/;
				return regex.test(value);
			},
			message: `${fieldName} must contain only contain letters, hyphens, or apostrophes.`,
		},
		{
			validator: (value) => {
				return value.length > 0;
			},
			message: `${fieldName} must be at least 1 character long`,
		},
	];
};

const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

/**
 * @description Returns a validator object for validating URLs.
 * @function validateUrl
 * @returns {Object} Validator object with a validator function and a message string.
 */
function validateUrl() {
  // Define a regular expression to match a URL.
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;

  // Return the validator object.
  return {
    /**
     * @description Validates that a URL matches the defined regular expression.
     * @function
     * @param {string} url - The URL to validate.
     * @throws {Error} If the URL does not match the regular expression.
     */
    validator: (url) => {
      if (!urlRegex.test(url)) {
        throw new Error(`Invalid URL [ ${url} ]`);
      }
    },
    message: ''
  };
}

const farmerSchema = new mongoose.Schema(
	{
		farmer_id: {
			type: String,
			required: [true, `The ${this.path} must be specified`],
			unique: [true, `The ${this.path} must be unique`],
			min: [12, `The ${this.path} must have at least 12 characters`],
			validate: alphaNumericValidator,
		},
		farmer_last_name: {
			type: String,
			required: [true, `The ${this.path} must be specified`],
			validate: nameValidator(this.path),
		},
		farmer_first_name: {
			type: String,
			required: [true, `The ${this.path} must be specified`],
			validate: nameValidator(this.path),
		},
		farmer_bvn: {
			type: Number,
			required: [true, `The ${this.path} must be specified`],
			validate: {
				validator: function (bvn) {
					console.log({ bvn });
					return /\d{11}/.test(bvn);
				},
				message: "The farmer's BVN must be an 11-digit number",
			},
			unique: [true, `The farmer's BVN must be unique`],
		},
		farmer_gender: {
			type: String,
			required: [true, `The ${this.path} must be specified`],
			enum: MONGOOSE_MODEL_ENUMS.GENDER,
		},
		farmer_dob: {
			type: Date,
			required: [true, `The ${this.path} must be specified`],
		},
		farmer_phone_number: {
			type: String,
			required: [true, `The ${this.path} must be specified`],
			validate: {
				validator: function validateNigerianPhoneNumber(phoneNumber) {
					const phoneNumberRegex = /^\+234\d{10}$/; // regular expression for Nigerian phone numbers
					return phoneNumberRegex.test(phoneNumber);
				},
				message: `The ${this.path} must have this format: +2348022242548`,
			},
		},
		farmer_email_address: {
			type: String,
			required: false,
			validate: [validateEmail, `Provide a valid ${this.path}`],
		},
		farmer_photo_base64: {
			type: String,
			required: [true, `The ${this.path} string must be specified`],
			validate: {
				validator: function (value) {
					// Check if value is a valid base64 string
					try {
						const base64regex = /^data:image\/(png|jpeg|jpg);base64,([^\s]+)$/;
						const match = value.match(base64regex);
						return match !== null && match.length === 3;
					} catch (err) {
						return false;
					}
				},
				message: `The ${this.path} field must be a valid base64 string`,
			},
		},
		farmer_farm_details: {
			general_description: {
				type: String,
				required: false,
			},
			land_size: {
				type: Number,
				required: [true, `The ${this.path} must be specified`],
				min: [1, `The ${this.path} must be greater than zero`],
			},
			/**
			 * The `land_size_units` field specifies the units of measurement for a piece of land.
			 * @typedef {Object} land_size_units
			 * @property {String} type - The data type for this field, which is a string.
			 * @property {Array} enum - An array of valid unit values for this field.
			 * @property {Boolean} required - Whether this field is required or not.
			 * @property {Function} validate - A validation function that checks whether the input value is valid or not.
			 * @property {String} validate.message - The error message to display if the input value is invalid.
			 * @property {Function} validate.validator - The validation function that determines if the input value is valid or not.
			 * @param {String} value - The input value to be validated.
			 * @returns {Boolean} - Returns true if the input value is valid, and false if it is not.
			 */
			land_size_units: {
				type: String,
				enum: MONGOOSE_MODEL_ENUMS.LAND_SIZE_UNITS,
				required: [
					true,
					`The ${
						this.path
					} must be specified in either: ${MONGOOSE_MODEL_ENUMS.LAND_SIZE_UNITS.join(", ")}`,
				],
				validate: [
					{
						validator: function (value) {
							const landSizeUnits = MONGOOSE_MODEL_ENUMS.LAND_SIZE_UNITS;
							console.log({ landSizeUnits });
							if (!MONGOOSE_MODEL_ENUMS.LAND_SIZE_UNITS.includes(value)) {
								return false;
							}
						},
						message: `The ${
							this.path
						} must be specified in either: ${MONGOOSE_MODEL_ENUMS.LAND_SIZE_UNITS.join(
							", "
						)}`,
					},
				],
			},
			farm_coordinates: {
				type: [[Number]],
				required: [true, `The ${this.path} must be specified`],
				validate: {
					validator: function (arr) {
						return (
							arr.length >= 5 &&
							arr.every((subArr) => {
								if (!Array.isArray(subArr) || subArr.length !== 2) {
									return false;
								}
								const [lon, lat] = subArr;
								if (typeof lon !== "number" || typeof lat !== "number") {
									return false;
								}
								const lonStr = lon.toString();
								const latStr = lat.toString();
								const lonDecimalPlaces = lonStr.includes(".")
									? lonStr.split(".")[1].length
									: 0;
								const latDecimalPlaces = latStr.includes(".")
									? latStr.split(".")[1].length
									: 0;
								return lonDecimalPlaces >= 6 && latDecimalPlaces >= 6;
							})
						);
					},
					message: `The land coordinates must be an array of at least 5 sub-arrays of 2 numbers each, with a minimum of 6 decimal places`,
				},
			},
			soil_type: { type: [String], required: false },
			field_officer_url: {
				type: String,
				required: true,
				validate: validateUrl(),
			},
		},
		farmer_farm_practice: {
			farming_experience: {
				type: Number,
				required: false,
				enum: Array.from(Array(11).keys()),
				validate: {
					validator: (value) => {
						return value >= 0 && value <= 10; // Check if the value is within the range of the enum
					},
					message: "The farming_experience value must be between 0 and 10.",
				},
			},
			crop_rotation_crops: { type: [String], required: false },
			has_access_to_market: { type: Boolean, required: false },
			has_access_to_irrigation: { type: Boolean, required: false },
			has_access_to_power: { type: Boolean, required: false },
			has_storage_facilities: { type: Boolean, required: false },
			fertilizer_usage: {
				type: { type: String, required: false },
				amount: { type: String, required: false },
			},
		},
		farmer_funded_date: {
			type: Date,
			requered: false,
		},
		farmer_funded_timeline: {
			type: Map,
			of: Number,
			required: false,
		}
	},
	{ timestamps: true }
);

/** FARM PROGRAM SCHEMA VALIDATORS */

function validateStringLength(strLen) {
	return {
		validator: function (value) {
			return value.length > strLen;
		},
		message: `Minimum of ${strLen} characters are required`,
	};
}

function validateProgramTitle() {
	return {
		validator: function (title) {
			const regex = /^[a-zA-Z0-9 _-]+$/;
			return regex.test(title);
		},
		message: `Only numbers, letters, hyphens or underscores are allowed`,
	};
}

function validateProgramDates() {
	return [
		{
			validator: function (value) {
				const startDate = this.get("farm_program_start_date");
				if (!startDate) {
					return false;
				}
				return true;
			},
			message: `Cannot specify a ${this.path} without a program start date`,
		},
		{
			validator: function (endDate) {
				const startDate = this.get("farm_program_start_date");
				// console.log(this);
				if (!endDate || !startDate) {
					return false;
				}
				return endDate > startDate;
			},
			message: `Invalid date. The end date must be set after the program's start date`,
		},
	];
}

/**
 * @function parseYearRange
 * @description Parses a year range string into its component years.
 * @param {string} yearRange - The year range string in the format "start year - end year", for example "2001 - 2003".
 * @returns {number[]} An array containing the start year and end year as numbers.
 */
const parseYearRange = (yearRange) => {
	// Split the string into an array of two strings, "start year" and "end year".
	// Apply the Number function to each string in the array, converting them to numbers.
	// This is a more concise way to convert the strings to numbers than using parseInt.
	// The result of the map function is an array of two numbers, which is then assigned
	// to the yearRangeStart and yearRangeEnd variables using array destructuring.
	const [yearRangeStart, yearRangeEnd] = yearRange.split("-").map(Number);

	return [yearRangeStart, yearRangeEnd];
};

function validateProgramTimeline() {
	return [
		{
			validator: function () {
				const timeline = this.get("farm_program_timeline");

				for (const [yearRange, events] of timeline.entries()) {
					// Parse the year range string into its start and end years
					const [yearRangeStart, yearRangeEnd] = parseYearRange(yearRange);

					// Check if the start year is greater than the end year
					if (yearRangeStart > yearRangeEnd) {
						// The year range is invalid, return false
						throw new Error(`Invalid years' sequence: ${yearRange}`);
					}
				}
			},
			message: `Invalid years' sequence`,
		},
		{
			validator: function () {
				/**
				 * Validates if the timeline of a farm program is valid.
				 * @returns {boolean} True if the timeline is valid, false otherwise.
				 */
				// Get the start date, end date, and timeline of the farm program
				const startDate = this.get("farm_program_start_date");
				const endDate = this.get("farm_program_end_date");
				const timeline = this.get("farm_program_timeline");

				// Get the start and end year of the farm program
				const progStartYear = new Date(startDate).getFullYear();
				const progEndYear = new Date(endDate).getFullYear();

				// Iterate over each year range and its corresponding events in the timeline
				for (const [yearRange, events] of timeline.entries()) {
					// Parse the year range string into its start and end years
					const [yearRangeStart, yearRangeEnd] = yearRange.split("-").map(Number);

					// Check if the year range is outside the program's start and end years
					if (
						yearRangeStart < progStartYear ||
						yearRangeStart > progEndYear ||
						yearRangeEnd < progStartYear ||
						yearRangeEnd > progEndYear
					) {
						// The year range is outside the program's timeline, return false
						throw new Error(
							`Invalid timeline year range (${yearRange}): the range must fall between the program's start and end dates: ${startDate} - ${endDate}`
						);
					}
				}

				// All year ranges are valid, return true
				return true;
			},
			message: `Invalid timeline year range: the range must fall between the program's start and end dates`,
		},
	];
}

const farmProgramSchema = new mongoose.Schema(
	{
		farm_program_id: {
			type: String,
			required: true,
			unique: true,
			validate: [validateStringLength(12), alphaNumericValidator()],
		},
		farm_program_title: {
			type: String,
			required: true,
			unique: true,
			validate: [validateStringLength(10), validateProgramTitle()],
		},
		farm_program_description: {
			type: String,
			required: true,
			validate: validateStringLength(10),
		},
		farm_program_start_date: {
			type: Date,
			required: true,
		},
		farm_program_end_date: {
			type: Date,
			required: false,
			validate: validateProgramDates(),
		},
		farm_program_state: {
			type: String,
			required: true,
			enum: NGA_STATES_NAMES,
		},
		farm_program_manager: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "FarmProgramManager",
			required: true,
		},
		farm_program_budget: {
			type: Number,
			required: false,
			validate: {
				validator: (value) => {
					return value >= 0;
				},
				message: `The program budget cannot be less than 0`,
			},
			default: 0,
		},
		farm_program_partners: {
			type: [String],
			required: false,
			default: [],
		},
		farm_program_objectives: {
			type: [String],
			required: false,
			default: [],
		},
		farm_program_impact_metrics: {
			type: [String],
			required: false,
			default: [],
		},
		farm_program_timeline: {
			type: Map,
			of: [
				{
					type: String,
				},
			],
			validate: validateProgramTimeline(),
			required: false,
		},
		farm_program_training_materials: {
			type: [String],
			required: false,
			default: [],
		},
		farm_program_funding_sources: {
			type: [String],
			required: false,
			default: [],
		},
		farm_program_evaluation_plan: {
			type: String,
			required: false,
			default: [],
		},
		farm_program_farmers: {
			type: [farmerSchema],
			required: true,
			validate: {
				validator: (farmers) => {
					if (farmers.length < 1) throw new Error(`The program must have at least 1 farmer`);
				},
				message: ``,
			},
		},
	},
	{ timeStamps: true }
);

/**
 * This validator uses this.constructor to get a reference to the model, and the countDocuments() method to check if there are any other documents in the collection that have the same combination of farmer_first_name, farmer_last_name, and farmer_bvn.
 * The _id: { $ne: this._id } part is necessary to exclude the current document from the check, because it's possible to update a document without changing these fields.
 */
/**
 * Validator that checks if there are any other documents in the collection that have the same combination of farmer_first_name, farmer_last_name, and farmer_bvn.
 * This is redundant as the farmer_bvn fields already have a unique indexs
 * The _id: { $ne: this._id } part is necessary to exclude the current document from the check, because it's possible to update a document without changing these fields.
 * @param {Object} value - The value being validated.
 * @returns {Promise<Boolean>} - A Promise that resolves to true if the combination of first name, last name and BVN is unique, or false otherwise.
 */
farmProgramSchema.pre("save", async function (next) {
	try {
		// console.log(this) -> "this" is the document being saved
		// console.log(this.constructor) -> `this.constructor` is the `farmProgramSchema` mongoose model

		const docsCount = await this.constructor.countDocuments({
			"farm_program_farmers.farmer_first_name": this.farmer_first_name,
			"farm_program_farmers.farmer_last_name": this.farmer_last_name,
			"farm_program_farmers.farmer_bvn": this.farm_program_farmers[0].farmer_bvn,
			_id: { $ne: this._id }, // exclude current document from check
		});

		if (docsCount > 0) {
			throw new Error("The combination of first name, last name and BVN must be unique");
		}

		next();
	} catch (err) {
		next(err);
	}
});

// Check that every land size unit matches the unit of the first farmer's farm
farmProgramSchema.path("farm_program_farmers").validate(function (farmers) {
	const units = farmers.map((farmer) => farmer.farmer_farm_details.land_size_units);
	console.log({ units });
	return units.every((unit) => unit === units[0]);
}, `All farms in this farm program document must have land size units that match the units for the first farm}`);

/**
 * This function is added as a middleware to the programSchema using the pre method. The function is executed before a farm program is saved to the database.
 * The function checks if the farm_program_farmers field has been modified, and if not, it simply calls the next middleware function in the chain. If the farm_program_farmers field has been modified, it iterates over each farmer in the farm_program_farmers array and sets the farmer_bvn field to undefined, effectively excluding it from being saved to the database.
 */
farmProgramSchema.pre("save", function (next) {
	const farmProgram = this;

	if (!farmProgram.isModified("farm_program_farmers")) {
		next();
	}

	// Iterate over each farmer in the farm_program_farmers array
	farmProgram.farm_program_farmers.forEach((farmer) => {
		// Exclude the farmer_bvn field
		farmer.farmer_bvn = undefined;
	});

	next();
});

// PRE-SAVE M-WARE TO APPEND A TIMESTAMP TO THE DB SAVE OPERATION
farmProgramSchema.pre("save", function (next) {
	const insertTimeStr = new Date().toISOString();
	if (!this.db_insert_timestamp) {
		this.db_insert_timestamp = insertTimeStr;
	}
	return next();
});

const CLUSTERED_FARM_PROGRAM_MODEL = mongoose.model("clustered_farm_programs", farmProgramSchema);

module.exports = CLUSTERED_FARM_PROGRAM_MODEL;