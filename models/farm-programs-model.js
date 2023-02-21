`use strict`

function alphanumericValidator(val) {
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(val);
};

const nameValidator = (fieldName) => {
  return [
    {
      validator: (value) => {
        const regex = /^[a-zA-Z]+$/;
        return regex.test(value);
      },
      message: `${value} is not a valid ${fieldName}; ${fieldName} must contain only contain letters, hyphens, or apostrophes.`,
    },
    {
      validator: (value) => {
        return value.length > 0;
      },
      message: `${fieldName} must be at least 1 character long`,
    },
  ];
};

const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const farmerSchema = new mongoose.Schema(
  {
    farmer_id: {
      type: String,
      required: [true, `The ${this.path} must be specified`],
      unique: [true, `The ${this.path} must be unique`],
      min: [12, `The ${this.path} must have at least 12 characters`],
      validate: {
        validator: alphanumericValidator,
        message: `The ${this.path} must be alphanumeric`
      }
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
          return /\d{11}/.test(bvn);
        },
        message: "The farmer's BVN must be an 11-digit number",
      },
      validate: {
        /**
          * This validator uses this.constructor to get a reference to the model, and the countDocuments() method to check if there are any other documents in the collection that have the same combination of farmer_first_name, farmer_last_name, and farmer_bvn. 
          * The _id: { $ne: this._id } part is necessary to exclude the current document from the check, because it's possible to update a document without changing these fields.
          */
        validator: function(value) {
          return new Promise(async (resolve, reject) => {
            try {
              const count = await this.constructor.countDocuments({
                "farmers.farmer_first_name": value.farmer_first_name,
                "farmers.farmer_last_name": value.farmer_last_name,
                "farmers.farmer_bvn": value.farmers[0].farmer_bvn,
                _id: { $ne: this._id } // exclude current document from check
              });
              resolve(count === 0);
            } catch (err) {
              reject(err);
            }
          });
        },
        message: 'The combination of first name, last name and BVN must be unique'
      },
      unique: [true, `The farmer's BVN must be unique`]
    },
    farmer_gender: {
      type: String,
      required: [true, `The ${this.path} must be specified`],
      enum: ["M", "F"],
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
        message: `The ${this.path} must have this format: +2348022242548`
      }
    },
    farmer_email_address: {
      type: String,
      required: false,
      validate: [validateEmail, `Provide a valid ${this.path}`],
    },
    farmer_photo_base64: {
      type: String,
      required: [true, `The ${this.path} string must be specified`],
      validate:
      {
        validator: function(value) {
          // Check if value is a valid base64 string
          try {
            const base64regex = /^data:image\/(png|jpeg|jpg);base64,([^\s]+)$/;
            const match = value.match(base64regex);
            return match !== null && match.length === 3;
          } catch (err) {
            return false;
          }
        },
        message: `The ${this.path} field must be a valid base64 string`
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
      land_size_units: {
        type: String,
        enum: ['sqm', 'sqkm', 'acres', 'hectares', 'acres'],
        required: [true, `The ${this.path} must be specified in either: sqm, sqkm, hectares or acres`],
        validate: {
          validator: function(value) {
            const allowedUnits = ["sqm", "sqkm", "acres", "sqmiles"];
            const validUnits = allowedUnits.filter(unit => unit === value);
            if (validUnits.length === 0) {
              return false;
            } else if (validUnits.length === allowedUnits.length) {
              return true;
            } else {
              const mostFrequentUnit = validUnits.sort((a, b) => validUnits.filter(v => v === a).length - validUnits.filter(v => v === b).length).pop();
              return value === mostFrequentUnit;
            }
          },
          message: `The land size unit provided does not match the most frequently used land size unit is ${mostFrequentUnit} used sof far`
        }
      },
      land_coordinates: {
        type: [[Number]],
        required: [true, `The ${this.path} must be specified`],
        validate: {
          validator: function(arr) {
            return arr.length >= 5 && arr.every(subArr => {
              if (!Array.isArray(subArr) || subArr.length !== 2) {
                return false;
              }
              const [lon, lat] = subArr;
              if (typeof lon !== 'number' || typeof lat !== 'number') {
                return false;
              }
              const lonStr = lon.toString();
              const latStr = lat.toString();
              const lonDecimalPlaces = (lonStr.includes('.') ? lonStr.split('.')[1].length : 0);
              const latDecimalPlaces = (latStr.includes('.') ? latStr.split('.')[1].length : 0);
              return lonDecimalPlaces >= 6 && latDecimalPlaces >= 6;
            });
          },
          message: `The land coordinates must be an array of at least 5 sub-arrays of 2 numbers each, with a minimum of 6 decimal places`
        }
      },          
      soil_type: {type: [String], required: false},
    },
    farmer_farm_practice: {
      farming_experience: {
        type: Number,
        required: false,
        enum: {
          values: Array.from(Array(11).keys()), // creates an array of numbers from 0 to 10
          message: `${this.path} must be a number between 0 and 10`
        }
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
    field_officer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FieldOfficer",
      required: [true, `The ${this.path} must be specified`],
    },
    farmer_funded_date: {
      type: Date,
      requered: false,
    },
  },
	{ timestamps: true }
);

const programDatesValidator = () => {
  return [
    {
      validator: function (value) {
        const startDate = this.get("program_start_date");
        if (!startDate) {
          return false;
        }
        return true;
      },
      message: `Cannot specify a ${this.path} without a program start date`,
    },
    {
      validator: function (endDate) {
        const startDate = this.get("program_start_date");
        if (!endDate || !startDate) {
          return true;
        }
        return endDate > startDate;
      },
      message: `The ${this.path} must be after the program start date`,
    },
  ];
}

function validateProgramTimeline() {

  const startDate = this.get(`program_start_date`);
  const endDate = this.get(`program_end_date`);
  const timeline = this.get(`program_timeline`);

  // Check if program_start_date and program_end_date exist
  if (!startDate || !endDate) {
    return false;
  }

  // Check if program_timeline exists
  if (!timeline) {
    return false;
  }

  // Check if each year in the timeline is within the start and end dates
  for (const [yearRange, events] of timeline.entries()) {
    
    const progStartYear = new Date(startDate).getFullYear();
    const progEndYear = new Date(endDate).getFullYear();
    const yearRangeStart = parseInt(yearRange); // parseInt("2001 - 2003") -> 2001
    const yearRangeEnd = yearRange.split("-")

    if (yearRangeStart < progStartYear || yearRangeStart > progEndYear) {
      return false;
    }

    if (yearRangeEnd > progStartYear || yearRangeEnd < progStartYar) {
      return false;
    }
  }
  return true;
}

const programTimelineSchema = new mongoose.Schema({
  year_range: {
    type: String,
    required: [true, 'The year of the timeline must be specified'],
  },
  activities: {
    type: [String],
    required: [true, 'The activities of the timeline must be specified'],
  },
});

const farmProgramSchema = new mongoose.Schema(
	{
		program_id: {
			type: String,
      required: [true, `The ${this.path} must be specified`],
      unique: [true, `The ${this.path} must be unique`],
      min: [12, `The program's unique ID must have at least 12 characters`],
		},
		program_title: {
      type: String,
      required: [true, `The ${this.path} must be specified`],
      unique: [true, `The ${this.path} must be unique`],
      min: [10, `The program's unique title must have at least 12 characters`],
		},
		program_description: {
			type: String,
      required: [true, `The ${this.path} must be specified`],
		},
		program_start_date: {
			type: Date,
      required: [true, `The ${this.path} must be specified`],
		},
    program_end_date: {
      type: Date,
      required: false,
      validate: programDatesValidator,
    },
    program_state: {
      type: String,
      required: false,
    },
    program_manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmProgramManager',
      required: false,
    },
    program_budget: {
      type: Number,
      required: false,
    },
    program_partners: {
      type: [String],
      required: false,
    },
    program_objectives: {
      type: String,
      required: false,
    },
    program_impact_metrics: {
      type: [String],
      required: false,
    },
    program_timeline: {
      type: Map,
      of: [programTimelineSchema],
      validate: {
        validator: validateProgramTimeline,
        message: 'The program timeline must fall between the program start date and end date'
      },
      required: false,
    },
    program_training_materials: {
      type: [String],
      required: false,
    },
    program_funding_sources: {
      type: [String],
      required: false,
    },
    program_evaluation_plan: {
      type: String,
      required: false,
    },
    farmers: { type: [farmerSchema], required: true },
  }, 
  {timeStamps: true}
);

// REMOVE > DEPRECATED FOR VALIDATOR FN.
// Check that every land size unit matches the unit of the first document
// farmProgramSchema.path('farmers').validate(function (farmers) {
//   const units = farmers.map(farmer => farmer.land_size_units);
//   return units.every(unit => unit === units[0]);
// }, 'All farmers must have the same land size units.');


/**
 * This function is added as a middleware to the programSchema using the pre method. The function is executed before a farm program is saved to the database.
 * The function checks if the farmers field has been modified, and if not, it simply calls the next middleware function in the chain. If the farmers field has been modified, it iterates over each farmer in the farmers array and sets the farmer_bvn field to undefined, effectively excluding it from being saved to the database.
 */
farmProgramSchema.pre('save', function (next) {
  const farmProgram = this;
  if (!farmProgram.isModified('farmers')) {
    next();
  }

  // Iterate over each farmer in the farmers array
  farmProgramSchema.farmers.forEach((farmer) => {
    // Exclude the farmer_bvn field
    farmer.farmer_bvn = undefined;
  });

  next();
});

// PRE-SAVE M-WARE TO APPEND A TIMESTAMP TO THE DB SAVE OPERATION
farmProgramSchema.pre('save', function(next) {
  const insertTimeStr = new Date().toISOString();
  if (!this.db_insert_timestamp) {
    this.db_insert_timestamp = insertTimeStr
  }
  return next();
});

const CLUSTERED_FARM_PROGRAM_MODEL = mongoose.model("clustered_farm_programs", farmProgramSchema);

module.exports = CLUSTERED_FARM_PROGRAM_MODEL;
