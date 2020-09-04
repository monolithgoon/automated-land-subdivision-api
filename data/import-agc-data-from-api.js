const chalk = require('chalk');
const chalkError = chalk.white.bgRed.bold
const chalkSuccess = chalk.white.bgGreen.bold
const chalkWarning = chalk.white.bgYellow.bold

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
//             console.log(chalkError(err.message))
//          }

//          console.log(chalkSuccess('The returned AGC data was saved to file..'))
//       });

// 	} else {
//       console.log(chalkError(error))
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
      fs.writeFileSync(`./agc-data-${Math.random()*99999}.geojson`, apiResponse, (err, Data) => {

         if(err) {
            console.log(chalkError(err.message))
         } else {
            console.log(chalkSuccess('The returned AGC data was saved to file..'))
         }
      });
      
   } catch (apiReqErr) {
      
      console.log(chalkError(apiReqErr.message));  

      fs.writeFile('./api-call-error-log.txt', apiReqErr, (err, Data) => {

         if(err) {
            console.log(chalkError(err.message))
         } else {
            console.log(chalkWarning('The the API call error was saved to the log file..'))
         }
      });
   }
}


// PEREFORM THE AXIOS REQUEST
getAgcData();
