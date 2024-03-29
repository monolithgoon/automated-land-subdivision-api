`use strict`
const chalk = require("../../chalk-messages.js");
const fs = require("fs");
const { PARCELIZE_AGC } = require("../parcelize-agc.js");




// THIS IS NEEDED FOR NON-EXPRESS APPS (LIKE THIS ONE) THAT CALL THIS MODULE FROM THE CMD. LINE
// __approotdir IS USED IN THE _getAllocationsMetadata FN. IN _utils.js
global.__approotdir = `../../..`




// IMPORT AGC FROM FILE
fs.readFile("../../../localdata/agcs/temp-agcs/temp-agc.geojson", function read(err, data) {

	if (err) {
      // throw err;
      console.error(chalk.fail(err));
   }
   
   const unprocessedAgc = JSON.parse(data);

   if (process.argv[2] === undefined) {

      console.log(chalk.warning(`Enter the parcelization directions code flag (eg: 'nw', 'se'). Exiting.. `))

      process.exit;

   } else {
      
      // PARCELIZE THE AGC 
      const parcelizedAgc = PARCELIZE_AGC(unprocessedAgc, process.argv[2]); 

      // SAVE THE PARCELIZED AGC TO FILE
      saveToFile(parcelizedAgc)
   }
});



// SAVE TO FILE
function saveToFile(parcelizedAgc) {

   try {
         
      // GET THE AGC ID
      const agcID = parcelizedAgc.properties.agc_id;
      // GET DIRECTION OF THE PARCELIZATION
      const directionCode = `${parcelizedAgc.properties.parcelization_metadata.katana_slice_dir.charAt(0)}${parcelizedAgc.properties.parcelization_metadata.moving_frames_dir.charAt(0)}`
   
      const fileName = directionCode ? `${agcID.toLowerCase()}-${directionCode}` : `${agcID.toLowerCase()}`
   
      // SAVE TO FILE > APPEND agc_id && directionsCombo TO FILE NAME
      fs.writeFile(`../../localdata/parcelized-agcs/data/temp-agcs/${fileName}.geojson`, JSON.stringify(parcelizedAgc), (err, data) => {
         if(err) {
            console.log(chalk.fail(err.message))
         } else {
            console.log(chalk.success('The AGC was parcelized and saved to file.. '));
         }
      });

   } catch (err) {
      console.log(chalk.fail(err.message));
   }
};