// TODO > NOT YET IMPEMENTED


const mongoose = require("mongoose");


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
   properties: {
      chunk_index: {
         type: Number,
         required: [true, "Each parcelized plot/chunk in the AGC must have an index"],
         unique: false
      },
      chunk_id: {
         type: String,
         required: [true, "Each parcelized plot/chunk in the AGC must have an ID"],
         // unique: [true, `Each parcelized plot/chunk in the AGC must have a unique ID`]
      },
      chunk_size: {
         type: Number,
         required: [true, "Each farm parcel in the AGC must have an allocated size"],
      },
      owner_id: {
         type: String,
         // required: [true, "Each farm parcel in the AGC must be assigned to a farmer"],
         required: false, // the chunk could be an unassigned leftover from parcelization process
         // unique: true
      },
      owner_name: {
         type: String,
         // required: true,
         unique: false
      },
      owner_photo_url: {
         type: String,
         required: false,
         unique: [true, `The link to each farmer's photo must be unique`]
      },
      center_lng: {
         type: Number,
         required: false
      },
      center_lat: {
         type: Number,
         required: false
      },
      coordinates: String
   }
});


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
});


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
});


// A SIMPLIFIED SCHEMA WITH PRE-COMPUTED PROPERTIES FOR EASE OF RENDERING
const parcelizedGeoClusterSchema = new monggoose.Schema({

   type: {
      type: String,
      enum: ["FeatureCollection"],
      default: "FeatureCollection",
      required: true
   },

   features: {
      type: [featureSchema],
      required: [true, `The featureCollection must have at least one feature or an array of features`],
      validate: [(entry) => Array.isArray(entry) && entry.length > 0, `The parelized geo-cluster featureCollection must have at least one feature or an array of features`],
   },

   properties: {

      geocluster_id: {
         type: String,
      },

      geocluster_title: {
         type: String,
      },

      geocluster_created_date: {
         type: Date
      },

      geocluster_feats_num: {
         type: Number,
      },

      geocluster_area: {
         type: Number
      },

      geocluster_used_area: {
         type: Number,
      },

      geocluster_unused_area: {
         type: Number,
      },

      geocluster_center_point_feat: {
         type: pointSchema,
      },

      geocluster_admin_lvl1: {
         type: String,
      },

      geocluster_admin_lvl2: {
         type: String,
      },

      geocluster_admin_lvl3: {
         type: String,
      },

      geocluster_admin_lvl4: {
         type: String,
      },

      geocluster_location: {
         type: String,
      },

      geocluster_render_hash: {
         type: String,
      },

      geocluster_subdivistion_metadata: {
         type: String,
         required: true,
         unique: true
      },

      geocluster_primary_commodity: {
         type: String,
      },

      geocluster_gov_admin1: {
         type: {
            adminName1: {
               type: String,
            },
            adminName2: {
               type: String,
            },
            adminName3: {
               type: String,
            },
         },
      },

      geocluster_gov_admin2: {
         type: {
            adminName1: {
               type: String,
            },
            adminName2: {
               type: String,
            },
            adminName3: {
               type: String,
            },
         },
      },

      geocluster_polygon: {
         type: [polygonSchema],
         required: [true, `The geocluster must have a renderable polygon`],
      },

   }

});


// PARCELIZED AGC DATA MODEL
const PARCELIZED_GEO_CLUSTER_MODEL = mongoose.model('parcelized_geoclusters', parcelizedGeoClusterSchema);


// EXPORT THE MODEL
module.exports = PARCELIZED_GEO_CLUSTER_MODEL