const chalk = require('../utils/chalk-messages')
const turf = require('@turf/turf')
const mongoose = require("mongoose");



const pointSchema = new mongoose.Schema({
   type: {
      type: String,
      enum: ['Point'],
      minLength: 5,
      required: true
   },
   coordinates: {
      type: [Number],
      required: true,
      unique: false
   }
})



const polygonSchema = new mongoose.Schema({
   type: {
      type: String,
      enum: ["Polygon"],
      required: true,
   },
   coordinates: {
      type: [[[Number]]],
      required: true
   }
})



const geometrySchema = new mongoose.Schema({
   type: {
      type: String,
      enum: [ 'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],
      default: 'Polygon',
      // FIXME > CUSTOM VALIDATION DOES NOT SEEM TO BE WORKING 
      // vallidate: {
      //    validateFn: function(geometryType) {
      //       console.log(`VALIDATING ...`);
      //       // if (geometryType === 'Point') { 
      //       //    return pointSchema
      //       // }
      //       let schema;
      //       schema = geometryType === "Point" ? pointSchema : polygonSchema
      //       schema = geometryType === "Polygon" ? polygonSchema : polygonSchema;
      //       return schema;
      //    }
      // },
      required: [true, `A geometry type needs to be specified`],
   },
   coordinates: {
      type: [Array],
      required: [true, `This AGC shapefile is missing its coordinates`],
      unique: [true, `An AGC with these coordinates already exists in the database`]
   }
})



const featureSchema = new mongoose.Schema({
   _id: {
      type: String
      // type: Mongoose.isValidObjectId,
   },
   type: {
         type: String,
         enum: ["Feature"],
         default: "Feature",
         required: true
      },
   geometry: geometrySchema,
   properties: {}
});



// FARMER SCHEMA
const farmerSchema = new mongoose.Schema({
   _id: {
      type: String,
      unique: [true, `A farmer with this object _id: ${this._id} already exists in the database`]
   },
   farmer_id: {
      type: String,
      required: [true, `The farmer must have a global ID`],
      unique: [true, `A farmer with this ID: ${this.farmer_id} already exists in the database`]
   },
   farmer_bvn: {
      type: [Number, `The farmer's BVN must be a number`],
      required: [true, `The farmer's BVN must be specified`],
      unique: [true, `The farmer's BVN must be unique`],
      minLength: [11, `The farmer's BVN cannot be fewer than 11 digits`],
   },
   first_name: {
      type: String,
      required: [true, `The farmer's first name must be specified`],
      validate: [(entry => !entry || !/^\s*$/.test(entry)), `The farmer's first name cannot be an empty string.`]
   },
   last_name: {
      type: String,
      required: [true, `The farmer's last name must be specified`],
      validate: [(entry => !entry || !/^\s*$/.test(entry)), `The farmer's last name cannot be an empty string.`]
   },
   farmer_photo: Array,
   // farmer_photo: {
   //    type: Buffer,
   //    unique: [true, `Each farmer's Base64 string must be unique`]
   // },
   // farmer_photo: {
   //    type: Array,
   //    required: true
   // },
   farmer_photo_base64: Buffer,
   farmer_photo_url: {
      type: String,
      // FIXME > CHANGE THESE TO "true" 
      required: false,
      unique: [false,`This photo url ${this.farmer_photo_url} is already linked to another farmer in the database`]
   },
   allocation: {
      type: Number,
      required: [true, `This farmer's (${this.farmer_id}) land allocation size must be specified`]
   }
})


// AGC SCHEMA
const agcSchema = new mongoose.Schema({
   type: {
      type: String,
      enum: ["FeatureCollection"],
      default: "FeatureCollection",
      required: true
   },
   features: {
      type: [featureSchema],
      required: [true, `The FeatureCollection must have at least one feature, or an array of features`],
      // validate: (entry) => Array.isArray(entry) && entry.length > 0, // RETURNS true or false
      validate: [(entry) => Array.isArray(entry) && entry.length > 0, `The AGC FeatureCollection must have at least one feature, or an array of features`],
   },
   properties: {
      agc_id: {
         type: String,
         required: [true, `Each AGC must have an valid string agc_id`],
         unique: [true, `An AGC with this ID: ${this.agc_id} already exists in the database.`],
         minLength: [10, `The agc_id cannot be fewer than 10 characters.`],
         validate: [(entry => !entry || !/^\s*$/.test(entry)), `The agc_id cannot be an empty string.`],
         validate: [entry => !/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.test(+entry), `The agc_id cannot be just a string of numbers.`],
      },
      extended_name: {
         type: String,
         required: [true, `The name of the AGC must be specified`],
         unique: [true, `An AGC with this extended_name (${this.extended_name}) already exists in the database`]
      },
      location: {
         type: String,
         required: [true, `The location of the AGC must be specified`]
      },
      // address: agcAddrSchema,
      // governance_structure: agcGovSchema,
      governance_structure: {
         
      },

      // agc_details: agcDetailsSchema,
      agc_details: {
         
      },
      farmers: {
         type: [farmerSchema],
         required: [true, `The AGC must have at least one farmer, or an array of farmers`],
         validate: [(entry) => Array.isArray(entry) && entry.length > 0, `The AGC must have at least one farmer, or an array of farmers`]
      },
      db_insert_timestamp: {
         type: String,
         default: new Date().toISOString(),
         required: [true, `Please provide a timestamp when the AGC was inserted to the database`]
      }
   }
})



// PRE-SAVE M-WARE TO APPEND A TIMESTAMP TO THE DB SAVE OP.
agcSchema.pre('save', function(next) {

   const insertTimeStr = new Date().toISOString();
   this.properties.db_insert_timestamp = insertTimeStr

   return next();
})



// PRE-SAVE M-WARE TO REJECT ALLOCATIONS THAT ARE <= 0
agcSchema.pre('save', function(next) {
   this.properties.farmers.forEach( farmer => {
      if(farmer.allocation <= 0) {
         return next(new Error(`A farmer's hectarage allocation cannot be a negative number or equal to zero. Please fix the AGC payload.`))
      };
   })

   return next();
});



// PRE-SAVE M-WARE TO ENSURE ALLOCATIONS DON'T EXCEED SHAPEFILE AREA
agcSchema.pre('save', function(next) {
   const agcArea = turf.area(this) / 10000;
   const allocations = [];
   this.properties.farmers.forEach(farmer=>allocations.push(farmer.allocation));
   const totalAllocArea = allocations.reduce((alloc, sum) => alloc + sum)
   if (agcArea >= totalAllocArea) {
      return next();
   } else {
      return next(new Error(`The total allocations exceed the land area. Reduce allocations by at least ${(totalAllocArea - agcArea).toFixed(2)} ha.`))   
   }
})



function formalizeWord(word) {
   let formattedWord = word.toLowerCase();
   // ensure word 'agc' is all caps
   formattedWord === 'agc' ?  'AGC' : formattedWord;
   // capitalize the first letter only
   formattedWord = formattedWord.charAt(0).toUpperCase() + formattedWord.slice(1);
   return formattedWord
}



// PRE-SAVE M.WARE TO CAP. 1ST LETTER OF EVERY WORD IN AGC NAME
agcSchema.pre('save', function(next) {

   const agcNameArray = [];

   this.properties.extended_name.split(' ').forEach(word=>{
      agcNameArray.push(formalizeWord(word));
   })

   this.properties.extended_name = agcNameArray.join(' ')

   return next();
});



// PRE-SAVE M.WARE TO CAP. 1ST LETTER OF FARMER NAMES
agcSchema.pre('save', function(next) {
   
   this.properties.farmers.forEach(farmer => {

      farmer.first_name = formalizeWord(farmer.first_name);
      farmer.last_name = formalizeWord(farmer.last_name);

   });

   return next();
});



// INIT. THE DATA MODEL
const AGC_MODEL = mongoose.model('agcs', agcSchema);



// EXPORT THE MODEL
module.exports = AGC_MODEL;