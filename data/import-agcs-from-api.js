const chalk = require('chalk');
const chalkError = chalk.white.bgRed.bold
const allGood = chalk.blue.bgGrey.bold
const chalkSuccess = chalk.white.bgGreen.bold
const chalkWarning = chalk.white.bgYellow.bold
const chalkData = chalk.grey.bold

const fs = require("fs");
const axios = require("axios");
const request = require("request");



// RETURN & SAVE ALL THE AGCS FROM THE DATABASE
async function returnAllAgcs() {

	try {
      
      const axiosRequest = axios({
         method: 'get',
         // url: `https://agcfarmlands.herokuapp.com/api/v1/agcs/`,
         url: `http://127.0.0.1:9090/api/v1/agcs`,
         crossDomain: true,
         responseType: 'application/json',
         headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            // 'Authorization': ''
         },
         data: {

         }
      });


      // GET RESPONSE FROM API CALL
      const apiResponse = await axiosRequest
      const agcsData = JSON.stringify(apiResponse.data)


      // CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
      let requestTimeStr = new Date( Date.parse(apiResponse.data.requested_at)).toISOString();
      requestTimeStr = requestTimeStr.replace(/:/g, "-");
      requestTimeStr = requestTimeStr.replace(/T/g, "-T");

      
      // WRITE RESULT TO NEW FILE
      fs.writeFile(`./agcs/agcs-${requestTimeStr}.geojson`, agcsData, (err, data) => {

         if(err) {
            console.log(chalkError(err.message))
            process.exit();
         } else {
            console.log(allGood('All the returned AGCs were saved to file.. '));
            process.exit();
         }
      });
	}
	catch (error) {
		console.error(error.message);
	};
};



// RETURN & SAVE ONE AGC FROM THE DATABASE
async function returnAgc(agc_id) {

	try {
      
      const axiosRequest = axios({
         method: 'get',
         // url: `https://agcfarmlands.herokuapp.com/api/v1/agcs/?${agc_id}`,
         url: `http://127.0.0.1:9090/api/v1/agcs/agc/?${agc_id}`,
         crossDomain: true,
         responseType: 'application/json',
         headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            // 'Authorization': ''
         },
         data: {

         }
      });


      // GET RESPONSE FROM API CALL
      const apiResponse = await axiosRequest
      const agcData = JSON.stringify(apiResponse.data.agcData)


      // WRITE RESULT TO NEW FILE
      fs.writeFile(`./agcs/${agc_id.toLowerCase()}.geojson`, agcData, (err, data) => {

         if(err) {
            console.log(chalkError(err.message))
            process.exit();
         } else {
            console.log(allGood('The returned AGC data was saved to file.. '))
            process.exit();
         }
      });      
	}
	catch (error) {
		console.error(error.message);
	};
};



// A SIMPLE COMMAND LINE SCRIPT USING process.argv TO SELECTIVELY EXECUTE FUNCTIONS IN THIS FILE
// EXECUTE IT BY TYPING: node export-fs-data-to-db.js --export/delete

if (process.argv[2] === '--all') {
   returnAllAgcs();

} else if (process.argv[2] === '--one') {
   returnAgc('NIRSALAGCAD0001');
}