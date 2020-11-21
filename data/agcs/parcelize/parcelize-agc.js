const chalk = require('../../../utils/chalk-messages');
const DB_CONNECT = require('../../../utils/db-connect.js');
const mongoose = require('mongoose')

const fs = require('fs')

const AGC_MODEL = require('../../../models/agc-model.js')
const PARCELIZED_AGC_MODEL = require('../../../models/parcelized-agc-model.js')

// IMPORT MAIN PARCELIZATION SCRIPT
const { PARCELIZE_SHAPEFILE } = require('./chunkify-moving-frames.js')



// IMPORT THE AGC & PARCELIZED AGCS FILES
const importAgcsToParcelize = async () => {
   try {
      // CONNECT TO THE REMOTE ATLAS DB
      await DB_CONNECT();

      // GET AGCS 
      const agcs = await AGC_MODEL.find()
      const parcelizedAgcs = await PARCELIZED_AGC_MODEL.find()

      // COMPARE AGCS WITH PARCELIZED AGCS
      const unprocessedAgcs = await compareAgcs(agcs, parcelizedAgcs)

      // RETURN AGCS THAT HAVE NOT BEEN PARCELIZED
      return unprocessedAgcs;

   } catch(err) {
      console.log(chalk.fail(err.message));
   }
}



// COMPARE AGCS WITH PARCELIZED AGCS TO CHECK WHICH NEED TO BE PARCELIZED
const compareAgcs = (agcs, parcelizedAgcs) => {

   let PENDING_AGCS;
   const PROCESSED_AGCS = [];
      
   // BUILD AN ARRY OF AGCS THAT HAVE ALREADY BEEN PROCESSED
   for (let i = 0; i < agcs.length; i++) {

      const agcID = agcs[i].properties.agc_id;

      for (let j = 0; j < parcelizedAgcs.length; j++) {

         const parcelizedAgcID = parcelizedAgcs[j].properties.agc_id;

         if (agcID === parcelizedAgcID) {
            PROCESSED_AGCS.push(agcs[i])
            break
         }
      }
      
      // FILTER OUT AGCS FROM 'agcs' THAT ARE NOT INCLUDED IN processedAgcs
      PENDING_AGCS = agcs.filter(agc => !(PROCESSED_AGCS.includes(agc)));
   }
   
   return PENDING_AGCS;
}



const parcelizeAgc = (agc) => {
   
   try {
      
      // INIT. PARCELIZATION VARIABLES
      const selectedShapefile = agc

      // GET THE FARM HA. ALLOCATIONS
      const farmerAllocations = [];
      const farmers_data = agc.properties.farmers;
      agc.properties.farmers.forEach(farmer=>farmerAllocations.push(farmer.allocation));
   
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
      const dirOptionsArray = [
         { katanaSliceDirection: "south", chunkifyDirection: "east" },
         { katanaSliceDirection: "south", chunkifyDirection: "west" },
         { katanaSliceDirection: "north", chunkifyDirection: "east" },
         { katanaSliceDirection: "north", chunkifyDirection: "west" },
         { katanaSliceDirection: "east", chunkifyDirection: "south" },
         { katanaSliceDirection: "east", chunkifyDirection: "north" },
         { katanaSliceDirection: "west", chunkifyDirection: "south" },
         { katanaSliceDirection: "west", chunkifyDirection: "north" },
      ]
      // for (let idx = 0; idx < dirOptionsArray.length; idx++) {
      //    const directionsObj = dirOptionsArray[idx];
      //    const parcelizedAgcGeojson = await PARCELIZE_SHAPEFILE(selectedShapefile, farmerAllocations, agcID, agcLocation, directionsObj)
      //    if (parcelizedAgcGeojson) {
      //       await saveToFile(parcelizedAgcGeojson, agcID, idx);
      //    }
      // }

      // GET CHUNKIFY DIRECTIONS
      // const dirComboConfigObj = dirOptionsMap.wn;
      // const dirComboConfigObj = dirOptionsMap.ws;
      // const dirComboConfigObj = dirOptionsMap.en;
      // const dirComboConfigObj = dirOptionsMap.es;
      // const dirComboConfigObj = dirOptionsMap.ne;
      // const dirComboConfigObj = dirOptionsMap.nw;
      const dirComboConfigObj = dirOptionsMap.sw;
      // const dirComboConfigObj = dirOptionsMap.se;

      // PARCELIZE
      // const parcelizedShapefile = await PARCELIZE_SHAPEFILE(selectedShapefile, farmerAllocations, dirComboConfigObj)
      const parcelizedShapefile = PARCELIZE_SHAPEFILE(selectedShapefile, farmers_data, dirComboConfigObj)

      return parcelizedShapefile;

   } catch (err) {
      console.log(chalk.fail(err.message));
   }
}



const parcelizeAgcs = (agcs) => {
   
   const parcelizedAgcs = [];

   try {
      
      // PARCELIZE
      agcs.forEach((agc) => {

         const parcelizedAgc = parcelizeAgc(agc);

         // CHECK IF PARCELIZATION SUCCEEDED
         if (!parcelizedAgc) {

            console.log(chalk.warning(`Parcelization of ${agc.properties.agc_id} failed. Try different direction combo. `));

         } else {
            
            // SAVE TO ARRAY FOR DB. SAVE
            parcelizedAgcs.push(parcelizedAgc);
         }
      });
   
      // RETURN ARRAY TO SAVE TO DB
      return parcelizedAgcs;
      
   } catch (err) {
      console.log(chalk.fail(err.message));
   }   
};



// SAVE TO FILE
function saveToFile(featureCollection) {

   const agcID = featureCollection.properties.agc_id;
   const dirCode = `${featureCollection.properties.parcelization_metadata.katana_slice_dir.charAt(0)}${featureCollection.properties.parcelization_metadata.moving_frames_dir.charAt(0)}`

   const fileName = dirCode ? `${agcID.toLowerCase()}-${dirCode}` : `${agcID.toLowerCase()}`

   // SAVE TO FILE > APPEND agc_id && directionsCombo TO FILE NAME
   fs.writeFile(`../../parcelized-agcs/data/${fileName}.geojson`, JSON.stringify(featureCollection), (err, data) => {
      if(err) {
         console.log(chalk.fail(err.message))
      } else {
         console.log(chalk.success('The AGC was parcelized and saved to file.. '));
      }
   });
};



// PERSIST TO DB
saveToDatabase = async (agcData) => {

   try {
      
      // CONNECT TO THE REMOTE ATLAS DB
      await DB_CONNECT();
      
      // SAVE TO DB
      // const agc = await PARCELIZED_AGC_MODEL.findOne({agc_id:agcData.properties.agc_id}, (err, queryObj) => queryObj)
      await PARCELIZED_AGC_MODEL.create(agcData)
      // await PARCELIZED_AGC_MODEL.update(agcData)
      
      console.log(chalk.success(`The parcelized AGC data (${agcData}) was successfully written to the database `));

      process.exit() // end the NODE process

   } catch(err) {
      
      console.error(chalk.fail(err.message));

      process.exit() // end the NODE process
   }
};



// MAIN CONTROLLER FN.
async function bulkParcelize () {

   try {
          
      const unprocessedAgcs = await importAgcsToParcelize();
      
      if (unprocessedAgcs.length !== 0) {

         console.log(chalk.working(`Parcelizing ${unprocessedAgcs.length} AGCs.. `))

         const parcelizedAgcs = parcelizeAgcs(unprocessedAgcs);
      
         parcelizedAgcs.forEach((agc) => saveToFile(agc));
   
         saveToDatabase(parcelizedAgcs);

      } else {

         console.log(chalk.warning(`Nothing to parcelize. Exiting.. `))
         process.exit();
      }
   

   } catch (err) {
      console.log(chalk.fail(err.message));
   } 
   // finally {
   //    mongoose.disconnect();
   // }
}

bulkParcelize();