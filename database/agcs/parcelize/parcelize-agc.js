const chalk = require('../../../utils/chalk-messages');
const DB_CONNECT = require('../../../utils/db-connect.js')

const fs = require('fs')

const AGC_MODEL = require('../../../models/agc-model.js')
const PARCELIZED_AGC_MODEL = require('../../../models/parcelized-agc-model.js')

// IMPORT MAIN PARCELIZATION SCRIPT
const { PARCELIZE_SHAPEFILE } = require('./chunkify-moving-frames.js')



// IMPORT THE AGC & PARCELIZED AGCS FILES
const importAgcData = async () => {
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
const compareAgcs = async (agcs, parcelizedAgcs) => {

   const pendingAgcs = [];
   
   // const PENDING_AGCS = agcs.filter(agc => parcelizedAgcs.includes(agc));
   
   pendingAgcs.push(agcs);
   // for (let i = 0; i < agcs.length; i++) {

   //    const agcID = agcs[i].properties.agc_id;

   //    parcelizedAgcs.forEach( parcelizedAgc => {

   //       const parcelizedAgcID = parcelizedAgc.properties.agc_id;

   //       console.log(`agc: ${agcID}`)
   //       console.log(`p-agc: ${parcelizedAgcID}`)

   //    if (agcID !== parcelizedAgcID) {
   //          PENDING_AGCS.push(agcs[i])
   //       }
   //    })
      // for (let j = 0; j < parcelizedAgcs.length; j++) {
      //    const parcelizedAgcID = parcelizedAgcs[j].properties.agc_id;
      //    if (agcID !== parcelizedAgcID) {
      //       console.log(`agc: ${agcID}`)
      //       console.log(`p-agc: ${parcelizedAgcID}`)
      //       PENDING_AGCS.push(agcs[i])
      //    }
      // } 
   // }
   // console.log(pendingAgcs);
   return pendingAgcs
}



const parcelizeAgcs = async (agcs) => {
   
   const parcelizedAgcs = [];

   try {
      
      // PARCELIZE
      agcs.forEach(async (agc) => {

         try {

            // INIT. PARCELIZATION VARIABLES
            const selectedShapefile = agc

            // GET THE FARM HA. ALLOCATIONS
            const farmerAllocations = [];
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
            //       await fileParcelizedAgc(parcelizedAgcGeojson, agcID, idx);
            //    }
            // }
      
            // GET CHUNKIFY DIRECTIONS
            // const dirComboConfigObj = dirOptionsMap.wn;
            const dirComboConfigObj = dirOptionsMap.ws;
            // const dirComboConfigObj = dirOptionsMap.ne;
            // const dirComboConfigObj = dirOptionsMap.es;
      
            // PARCELIZE
            const parcelizedAgcGeojson = await PARCELIZE_SHAPEFILE(selectedShapefile, farmerAllocations, dirComboConfigObj)
      
            // CHECK IF PARCELIZATION SUCCEEDED
            if (!parcelizedAgcGeojson) {

               console.log(chalk.warning(`Parcelization of ${agc.properties.agc_id} failed. Try different direction combo. `));
            } else {
               
               // SAVE TO FILE
               await fileParcelizedAgc(parcelizedAgcGeojson);

               // SAVE TO ARRAY FOR DB.
               parcelizedAgcs.push(parcelizedAgcGeojson);
            }
      
            
         } catch (err) {
            console.log(chalk.fail(err.message));
         }
      });
   
      // RETURN ARRAY TO SAVE TO DB
      return parcelizedAgcs;
      
   } catch (err) {
      console.log(chalk.fail(err.message));
   }   
}


// SAVE TO FILE
async function fileParcelizedAgc(featureCollection, directions) {

   const agcID = featureCollection.properties.agc_id;

   if (directions) {

      // SAVE TO FILE > APPEND agc_id && directionsCombo TO FILE NAME
      fs.writeFile(`../../parcelized-agcs/data/${agcID.toLowerCase()}-${directions}.geojson`, JSON.stringify(featureCollection), (err, data) => {
         if(err) {
            console.log(chalk.fail(err.message))
         } else {
            console.log(chalk.success('The AGC was parcelized and saved to file.. '));
         }
      });

   } else {

      // SAVE TO FILE > APPEND agc_id TO FILE NAME
      fs.writeFile(`../../parcelized-agcs/data/${agcID.toLowerCase()}.geojson`, JSON.stringify(featureCollection), (err, data) => {

         if(err) {
            console.log(chalk.fail(err.message))
         } else {
            console.log(chalk.success('The AGC was parcelized and saved to file.. '));
         }
      });
   }
};



// PERSIST TO DB
const exportParcelizedAgc = async (parcelizedAgc) => {
   
   // CONNECT TO THE REMOTE ATLAS DB
   await DB_CONNECT();

   // SAVE TO DB
      try {
            
         // const agc = await PARCELIZED_AGC_MODEL.findOne({agc_id:parcelizedAgc.properties.agc_id}, (err, queryObj) => queryObj)
         // console.log(agc);
         await PARCELIZED_AGC_MODEL.create(parcelizedAgc)
         // await PARCELIZED_AGC_MODEL.update(parcelizedAgc)
         console.log(chalk.success('The parcelized AGC data was successfully written to the database '));

         process.exit() // end the NODE process

      } catch(err) {
         
         console.error(chalk.fail(err.message));

         process.exit() // end the NODE process
      }

};



async function runProgram() {

   try {
          
      const unprocessedAgcs = await importAgcData();
   
      // await parcelizeAgcs(unprocessedAgcs);
      const parcelizedAgcs = await parcelizeAgcs(unprocessedAgcs[0]);
   
      console.log(parcelizedAgcs);
      await exportParcelizedAgc(parcelizedAgcs);

   } catch (err) {
      console.log(chalk.fail(err.message));
   }
}

runProgram();