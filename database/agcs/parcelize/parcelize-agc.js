const chalk = require('../../../utils/chalk-messages');
const DB_CONNECT = require('../../../utils/db-connect.js')

const fs = require('fs')

const AGC_MODEL = require('../../../models/agc-model.js')
const PARCELIZED_AGC_MODEL = require('../../../models/parcelized-agc-model.js')

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
   
         // INIT. PARCELIZATION VARIABLES
         const selectedShapefile = agc
         const farmAllocations = [ 1.5, 1.5, 2, 2, 3, 3, 2.1, 3, 3.1 ];
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
   
         // GET CHUNKIFY DIRECTIONS
         const dirComboConfigObj = dirOptionsMap.wn;
   
         // FOR agc_id && location, CHECK WHETHER FEAT. OR FEAT. COLL.
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
         console.log(selectedShapefile);
         const parcelizedAgcGeojson = await PARCELIZE_SHAPEFILE(selectedShapefile, farmAllocations, agcID, agcLocation, dirComboConfigObj)
   
         // SAVE TO FILE
         await fileParcelizedAgc(parcelizedAgcGeojson, agcID);
   
         // SAVE TO ARRAY
         parcelizedAgcs.push(parcelizedAgcGeojson);
   
      });
   
      // RETURN ARRAY TO SAVE TO DB
      return parcelizedAgcs;
      
   } catch (err) {
      console.log(chalk.fail(err.message));
   }   
}


// SAVE TO FILE
async function fileParcelizedAgc(featureCollection, agcID) {

   // console.log(JSON.stringify(featureCollection));

   // SAVE TO FILE > APPEND agc_id TO FILE NAME
   fs.writeFile(`../data/${agcID.toLowerCase()}.geojson`, JSON.stringify(featureCollection), (err, data) => {

      if(err) {
         console.log(chalk.fail(err.message))
         // process.exit();
      } else {
         console.log(chalk.success('The AGC was parcelized and saved to file.. '));
         // process.exit();
      }
   });
};



// PERSIST TO DB
const exportParcelizedAgc = async (parcelizedAgc) => {
   
   // CONNECT TO THE REMOTE ATLAS DB
   await DB_CONNECT();

   // SAVE TO DB
      try {
            
         await PARCELIZED_AGC_MODEL.create(parcelizedAgc)
         console.log(chalk.success('The parcelized AGC data was successfully written to the database '));

         // process.exit() // end the NODE process

      } catch(err) {
         
         console.error(chalk.fail(err.message));

         // process.exit() // end the NODE process
      }

};



async function runProgram() {

   try {
          
      const unprocessedAgcs = await importAgcData();
   
      // await parcelizeAgcs(unprocessedAgcs);
      const parcelizedAgcs = await parcelizeAgcs(unprocessedAgcs[0]);
   
      console.log(parcelizedAgcs);
      // await exportParcelizedAgc(parcelizedAgcs);

   } catch (err) {
      console.log(chalk.fail(err.message));
   }
}

runProgram();