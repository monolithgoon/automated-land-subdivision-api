const chalk = require('chalk');
const chalkError = chalk.white.bgRed.bold
const allGood = chalk.blue.bgGrey.bold
const chalkSuccess = chalk.white.bgGreen.bold
const chalkWarning = chalk.white.bgYellow.bold
const chalkData = chalk.grey.bold

const fs = require('fs')
const Mongoose = require('mongoose') // MongoDB driver that facilitates connection to remote db
const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
dotenv.config({path: '../../../config.env'}) // CONFIGURE ENV. VARIABLES BEFORE CALL THE APP

const PARCELIZED_AGC_MODEL = require('../../../models/parcelized-agc-model.js')

const { PARCELIZE_SHAPEFILE } = require('./chunkify-moving-frames.js')



// IMPORT THE AGCS



// CHECK THE ONES THAT NEED TO BE PARCELIZED
const selectedShapefile = {"type":"FeatureCollection","properties":{"agc_id":"AGCABJ002BMAIZE","extended_name":"The newest maize growers AGC","location":"Kubwa, FCT Abuja","farmers":[{"farmer_name":"Farmer one","farmer_id":"AGCFCT000019000041","allocation":3.9},{"farmer_name":"Farmer Two","farmer_id":"AGCFCT000019000042","allocation":3},{"farmer_name":"Farmer Three","farmer_id":"AGCFCT000019000043","allocation":2.3}]},"features":[{"type":"Feature","properties":{"shape":"Rectangle","name":"Unnamed Geoman Layer","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[7.517157,9.095486],[7.51808,9.095465],[7.51883,9.093643],[7.519603,9.092541],[7.519603,9.091376],[7.522884,9.091397],[7.522884,9.092795],[7.523764,9.093643],[7.52385,9.096397],[7.52179,9.09644],[7.519131,9.099851],[7.517222,9.099872],[7.517157,9.095486]]]},"id":"1dc64de0-3678-4c07-acfd-9388beeb0080"}]};
const farmAllocations = [ 3, 2.1, 3, 3.1 ];
const dirOptionsMap = {
   se: { katanaSliceDirection: "south", chunkifyDirection: "east" },
   sw: { katanaSliceDirection: "south", chunkifyDirection: "west" },
   ne: { katanaSliceDirection: "north", chunkifyDirection: "east" },
   nw: { katanaSliceDirection: "north", chunkifyDirection: "west" },
   es: { katanaSliceDirection: "east", chunkifyDirection: "south" },
   en: { katanaSliceDirection: "east", chunkifyDirection: "north" },
   ws: { katanaSliceDirection: "west", chunkifyDirection: "south" },
   wn: { katanaSliceDirection: "west", chunkifyDirection: "north" },
}



// GET CHUNKIFY DIRECTIONS
const dirComboConfigObj = dirOptionsMap.ws;



// CHECK WHETHER FEAT. OR FEAT. COLL.
let agcID, agcLocation
if (selectedShapefile.type === 'FeatureCollection' && selectedShapefile.properties) {
   agcID = selectedShapefile.properties.agc_id
   agcLocation = selectedShapefile.properties.location
}
else if (selectedShapefile.type === "FeatureCollection") {
   agcID = selectedShapefile.features[0].properties.agc_id
   agcLocation = selectedShapefile.features[0].properties.location
}
else if (selectedShapefile.type === "Feature") {
   agcID = selectedShapefile.properties.agc_id
   agcLocation = selectedShapefile.properties.location
}



// PARCELIZE
const parcelizedAgcGeojson = PARCELIZE_SHAPEFILE(selectedShapefile, farmAllocations, agcID, agcLocation, dirComboConfigObj)



// SAVE TO FILE
async function saveParcelizedAgc(featureCollection, agcID) {

   console.log(JSON.stringify(featureCollection));

   // SAVE TO FILE
   // GET THE agc_id TO APPEND TO THE FILE NAME
   fs.writeFile(`../${agcID.toLowerCase()}.geojson`, featureCollection, (err, data) => {

      if(err) {
         console.log(chalkError(err.message))
         process.exit();
      } else {
         console.log(allGood('The AGC was parcelized and saved to file.. '));
         process.exit();
      }
   });
};

// await saveParcelizedAgc(JSON.stringify(parcelizedAgcGeojson), agcID);



// CONNECT TO THE REMOTE ATLAS DB
async function dbConnect() {
   try {
      console.log('Connecting to the remote Atlas DB...');

      const database = process.env.ATLAS_DB_STRING.replace('<PASSWORD>', process.env.ATLAS_DB_PASSOWRD) // REPLACE THE PLACEHOLDER TEXT IN THE CONNECTION STRING
   
      Mongoose.connect(database, {
      // handle deprecation warnings
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
   })
      .then(connectionObject => {
         // console.log((connectionObject))
         console.log(allGood('YOU CONNECTED TO THE ATLAS DATABASE SUCCESSFULLY '));
      })
   
   } catch(err) {
      console.log(err.message);
   }
}


// PERSIST TO DB
const exportParcelizedAgc = async (parcelizedAgc) => {
   
   await dbConnect();

   // SAVE TO DB
      try {
            
         await PARCELIZED_AGC_MODEL.create(parcelizedAgc)
         console.log(chalkSuccess('The parcelized AGC data was successfully written to the ATLAS database'));

      } catch(err) {
         
         console.error(chalkError(err.message));
      }

   process.exit() // end the NODE process
};



async function persistParcelizedagc() {
   await saveParcelizedAgc(JSON.stringify(parcelizedAgcGeojson), agcID);
   await exportParcelizedAgc(parcelizedAgcGeojson);
}

persistParcelizedagc();