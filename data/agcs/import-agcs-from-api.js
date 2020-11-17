const chalk = require('../../utils/chalk-messages.js')
const fs = require("fs");
const axios = require("axios");;



// RETURN & SAVE ALL THE AGCS FROM THE DATABASE
async function returnAllAgcs() {

	try {
      
      const axiosRequest = axios({
         method: 'get',
         url: `https://agcfarmlands.herokuapp.com/api/v1/agcs/`,
         // url: `http://127.0.0.1:9090/api/v1/agcs`,
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
      const numAgcs = apiResponse.data.num_agcs


      // CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
      let requestTimeStr = new Date( Date.parse(apiResponse.data.requested_at)).toISOString();
      requestTimeStr = requestTimeStr.replace(/:/g, ".");
      requestTimeStr = requestTimeStr.replace(/T/g, "-T");

      
      // WRITE RESULT TO NEW FILE
      fs.writeFile(`./data/bulk-data/agcs-${requestTimeStr}.geojson`, agcsData, (err, data) => {

         if(err) {
            console.log(chalk.error(err.message))
            process.exit();
         } else {
            console.log(chalk.success(`All the returned AGCs (${numAgcs}) were saved to file.. `));
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
      const agcDataString = JSON.stringify(apiResponse.data.agcData)


      // SAVE AGC DATA TO FILE
      fs.writeFile(`./data/${agc_id.toLowerCase()}.geojson`, agcDataString, (err, data) => {

         if(err) {
            console.log(chalk.error(err.message))
            process.exit();
         } else {
            console.log(chalk.success('The returned AGC data was saved to file.. '))
            process.exit();
         }
      });      
	}
	catch (_error) {
		console.error(_error.message);
	};
};



// A SIMPLE COMMAND LINE SCRIPT USING process.argv TO SELECTIVELY EXECUTE FUNCTIONS IN THIS FILE
// EXECUTE IT BY TYPING: node export-fs-data-to-db.js --export/delete

if (process.argv[2] === '--all') {
   returnAllAgcs();

} else if (process.argv[2] === '--one' && process.argv[3]) {
   // returnAgc('NIRSALAGCAD0001');
   returnAgc(process.argv[3]);
}