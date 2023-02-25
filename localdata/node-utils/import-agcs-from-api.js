const chalk = require("../../utils/chalk-messages.js");
const fs = require("fs");
const axios = require("axios");

// API CALL FUNCTION
async function apiCall(method, url, responseType, data = {}) {
	console.log({ data });
	try {
		const axiosRequest = axios({
			method: method,
			url: url,
			crossDomain: true,
			responseType: responseType,
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
				// 'Authorization': ''
			},
			data: data,
		});

		const apiResponse = await axiosRequest;
		return apiResponse.data;
	} catch (error) {
		console.error(chalk.fail(`apiCall: ${error.message}`));
	}
}

// SAVE DATA TO FILE FUNCTION
function saveToFile(fileName, data) {
	try {
		fs.writeFile(fileName, data, (err, data) => {
			if (err) {
				console.log(chalk.fail(err.message));
				process.exit();
			} else {
				console.log(chalk.success(`The data was saved to file.. `));
				process.exit();
			}
		});
	} catch (error) {
		console.error(chalk.fail(`saveToFile: ${error.message}`));
	}
}

// RETURN & SAVE ALL THE AGCS FROM THE DATABASE
async function returnAllAgcs() {
	try {
		const apiResponse = await apiCall(
			"get",
			"http://127.0.0.1:9443/api/v1/agcs",
			"application/json",
			{}
		);
		const agcsData = JSON.stringify(apiResponse);
		const numAgcs = apiResponse?.num_agcs;
		let requestTimeStr = new Date(Date.parse(apiResponse.requested_at)).toISOString();
		requestTimeStr = requestTimeStr.replace(/:/g, ".");
		requestTimeStr = requestTimeStr.replace(/T/g, "-T");
		agcsData && saveToFile(`../agcs/batch-imports/agcs-${requestTimeStr}.geojson`, agcsData);
	} catch (error) {
		console.error(chalk.fail(`returnAllAgcs: ${error.message}`));
	}
}

// RETURN & SAVE ONE AGC FROM THE DATABASE
async function returnAgc(agc_id) {
	try {
		const apiResponse = await apiCall(
			"get",
			`http://127.0.0.1:9443/api/v1/agcs/agc/?${agc_id.toUpperCase()}`,
			"application/json",
			{}
		);
		console.log({ apiResponse });
		const agcDataString = JSON.stringify(apiResponse?.agcData);
		agcDataString && saveToFile(`../agcs/${agc_id.toLowerCase()}.geojson`, agcDataString);
	} catch (error) {
		console.error(chalk.fail(`returnAgc: ${error.message}`));
	}
}

// A SIMPLE COMMAND LINE SCRIPT USING process.argv TO SELECTIVELY EXECUTE FUNCTIONS IN THIS FILE
if (process.argv[2] === "--all") {
	returnAllAgcs();
} else if (process.argv[2] === "--one" && process.argv[3]) {
	returnAgc(process.argv[3]);
}
