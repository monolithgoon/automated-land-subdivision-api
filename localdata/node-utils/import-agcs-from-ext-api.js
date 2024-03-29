`use strict`
const chalk = require("../../utils/chalk-messages.js")

const fs = require("fs");
const axios = require("axios");
const request = require("request");




// // REQUEST HEADERS
// const headers = {
// 	"Accept": "*/*",
// 	"Content-Type": "application/json",
// };

// // REQUEST PARAMS.
// const params = '{ "page": 0, "size": 10, "token": "5bf36b8c3f89b4fcf0936ef49c1427ac22a7ca4766b5aaec7e21bb0e0165cfda46ce01a94968c3162aca0af3cffbf6"}';

// // FULL REQUEST
// const options = {
// 	url: "http://pagewallets.com:8080/cabsol-uploader/v1/geoonboarding/v1/parcelized",
// 	method: "POST",
// 	headers: headers,
// 	body: params,
// };

// // REQUEST HANDLER
// function callback(error, response, responseBody) {

// 	if (!error && response.statusCode === 200) {

//       console.log(responseBody);
      
//       // WRITE RESULT TO NEW FILE
//       fs.writeFileSync('/agc-data.geojson', responseBody, (err, Data) => {

//          if(err) {
//             console.log(chalk.fail(err.message))
//          }

//          console.log(chalk.success('The returned AGC data was saved to file..'))
//       });

// 	} else {
//       console.log(chalk.fail(error))
//    }
// }

// // PERFORM REQUEST 
// request(options, callback);




// AXIOS REQUEST LOGIC
async function getAgcData() {

   try {

      const axiosRequest = axios({
         method: 'post',
         url: `http://pagewallets.com:8080/cabsol-uploader/v1/geoonboarding/v1/parcelized`,
         crossDomain: true,
         responseType: "application/json",
         headers: {
            // 'Accept': "application/json",
            "Accept": "*/*",
            "Content-Type": "application/json",
            'Authorization': "5bf36b8c3f89b4fcf0936ef49c1427ac22a7ca4766b5aaec7e21bb0e0165cfda46ce01a94968c3162aca0af3cffbf6",
         },
         data: {
            page: 0,
            size: 10,
         },
         // timeout: 5000,
      })
      
      // GET RESPONSE FROM API CALL
      const apiResponse = await axiosRequest;

      
      // console.log(apiResponse);


      // WRITE RESULT TO NEW FILE
      fs.writeFileSync(`./agcs/agc-${Math.random()*99999}.geojson`, apiResponse, (err, data) => {

         if(err) {
            console.log(chalk.fail(err.message))
         } else {
            console.log(chalk.success('The returned AGC data was saved to file..'))
         }
      });
      
   } catch (apiReqErr) {
      
      console.log(chalk.fail(apiReqErr.message));  

      fs.writeFile('./agcs/api-call-error-log.txt', apiReqErr, (err, data) => {

         if(err) {
            console.log(chalk.fail(err.message))
         } else {
            console.log(chalk.warning('The error from the API call was saved to the log file..'))
         }
      });
   }
}


// PEREFORM THE AXIOS REQUEST
getAgcData();