const fs = require('fs')
const chalk = require('../../../utils/chalk-messages');
const DB_CONNECT = require('../../../utils/db-connect.js');
const AGC_MODEL = require('../../../models/agc-model.js')
const PARCELIZED_AGC_MODEL = require('../../../models/parcelized-agc-model.js')
const { PARCELIZE_AGC } = require("./parcelize-agc.js"); // IMPORT AGC PARCELIZATION SCRIPT




// THIS IS NEEDED FOR NON-EXPRESS APPS (LIKE THIS ONE) THAT CALL THIS MODULE FROM THE CMD. LINE
// __approotdir IS USED IN THE _getAllocationsMetadata FN. IN _utils.js
global.__approotdir = `../../..`




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
};



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
};



const parcelizeAgcs = (agcs) => {
   
   const parcelizedAgcs = [];

   try {
         
      // PARCELIZE
      agcs.forEach((agc) => {

         const parcelizedAgc = PARCELIZE_AGC(agc, process.argv[2]);

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
function saveToFile(parcelizedAgc) {

   // GET THE AGC ID
   const agcID = parcelizedAgc.properties.agc_id;
   // GET DIRECTION OF THE PARCELIZATION
   const directionCode = `${parcelizedAgc.properties.parcelization_metadata.katana_slice_dir.charAt(0)}${parcelizedAgc.properties.parcelization_metadata.moving_frames_dir.charAt(0)}`

   const fileName = directionCode ? `${agcID.toLowerCase()}-${directionCode}` : `${agcID.toLowerCase()}`

   // SAVE TO FILE > APPEND agc_id && directionsCombo TO FILE NAME
   fs.writeFile(`../../parcelized-agcs/data/${fileName}.geojson`, JSON.stringify(parcelizedAgc), (err, data) => {
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

      if (process.argv[2] === undefined) {

         console.log(chalk.warning(`Enter the parcelization directions code flag (eg: 'nw', 'se'). Exiting.. `))
   
         process.exit;
   
      } else {
         
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
      }
          
   } catch (err) {
      console.log(chalk.fail(err.message));
   } 
   // finally {
   //    mongoose.disconnect();
   // }
}

bulkParcelize();