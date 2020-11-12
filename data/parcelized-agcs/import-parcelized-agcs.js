const chalk = require('../../utils/chalk-messages.js')
const fs = require("fs");
const axios = require("axios");



// RETURN & SAVE ALL THE PARCELIZED AGCS FROM THE DATABASE
async function returnAllParcelizedAgcs() {

	try {
      
      const axiosRequest = axios({
         method: 'get',
         url: `https://agcfarmlands.herokuapp.com/api/v1/parcelized-agcs/`,
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
      const parcelizedAgcsData = JSON.stringify(apiResponse.data)
      const numAgcs = apiResponse.data.num_parcelized_agcs


      // CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
      let requestTimeStr = new Date( Date.parse(apiResponse.data.requested_at)).toISOString();
      requestTimeStr = requestTimeStr.replace(/:/g, ".");
      requestTimeStr = requestTimeStr.replace(/T/g, "-T");

      
      // WRITE RESULT TO NEW FILE
      fs.writeFile(`./data/bulk-data/parcelized-agcs-${requestTimeStr}.geojson`, parcelizedAgcsData, (err, data) => {

         if(err) {
            console.log(chalk.error(err.message))
            process.exit();
         } else {
            console.log(chalk.success(`All the returned parcelized AGCs (${numAgcs}) were saved to file.. `));
            process.exit();
         }
      });
	}
	catch (error) {
		console.error(error.message);
	};
};



// A SIMPLE COMMAND LINE SCRIPT USING process.argv TO SELECTIVELY EXECUTE FUNCTIONS IN THIS FILE

if (process.argv[2] === '--all') {

   returnAllParcelizedAgcs();

}