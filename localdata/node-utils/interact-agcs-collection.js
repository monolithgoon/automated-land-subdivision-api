`use strict`
const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv"); // read the data from the config file. and use them as env. variables in NODE
dotenv.config({ path: "../../default.env" }); // CONFIGURE ENV. VARIABLES BEFORE CALL THE APP
const AGC_MODEL = require("../../models/agc-model.js");
const PARCELIZED_AGC_MODEL = require("../../models/parcelized-agc-model.js");
const LEGACY_AGC_MODEL = require("../../models/legacy-agc-model.js");
const PROCESSED_LEGACY_AGC_MODEL = require("../../models/processed-legacy-agc-model.js");
const chalk = require("../../utils/chalk-messages.js");
const dbConnect = require("../../utils/db-connect.js");
const { findOneDocument } = require("../../controllers/handler-factory/handler-factory.js");

// DELETE ALL DATA FROM PARCELIZED AGCS COLLECTION
const wipeParcelizedClustersCollection = async () => {
	try {
		// close the user prompt & end the process
		const endInteraction = () => {
			console.log("Exiting interaction..");
			readline.close();
			process.exit();
		};

		// init a readline interface
		const readline = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		// INITIATE USER INTERACTION
		readline.question(
			"Are you sure you want to wipe the parcelized AGCs collection? [ y / yes / Y ]: ",
			async (answer) => {
				if (answer === "y" || answer === "yes" || answer === "Y") {
					readline.question(
						"Type the name of the collection you want to erase: ",
						async (name) => {
							if (name === "parcelized_agcs") {
								await dbConnect();
								await PARCELIZED_AGC_MODEL.deleteMany();
								console.log(
									chalk.highlight(
										"The parcelized AGCs collection was successfully wiped from the ATLAS database"
									)
								);
								endInteraction();
							} else {
								endInteraction();
							}
						}
					);
				} else {
					endInteraction();
				}
			}
		);
	} catch (err) {
		console.log(err.message);
		console.error(err.message);
	}
};

/**
 * 
 */
async function axiosRequest(method, url, data={}) {
	try {
		const response = await axios({
			method,
			url,
			crossDomain: true,
			headers: {
				"Content-Type": "application/json",
			},
		data,
		})
		console.log(chalk.success(`axiosRequest: ${response.statusText}`))
	} catch (error) {
		console.error(chalk.fail(`axiosRequest: ${error}`))
	}
};

// Upload many parcelized clusters from file to database
const saveParcelizedAgcsToDatabase = async (uploader) => {

	try {

		// let parcelizedAgcs = JSON.parse(
		// 	fs.readFileSync("../parcelized-agcs/uploads/parcelized-agcs.geojson", "utf-8")
		// );
		
		const fileData = JSON.parse(
			fs.readFileSync("../parcelized-agcs/bulk-import-data/parcelized-agcs-2023-03-19-T08.02.01.296Z.json", "utf-8")
		);

		let parcelizedAgcs = fileData.data.parcelized_agcs;

		switch (uploader) {

			case "axios":
				for (cluster of parcelizedAgcs) {
					axiosRequest("POST", "http://127.0.0.1:9443/api/v1/parcelized-agcs/", JSON.stringify(cluster))
				}
				// axiosRequest("POST", "http://127.0.0.1:9443/api/v1/parcelized-agcs/", JSON.stringify(parcelizedAgcs[0]))
				break;

			case "mongoose":
				await dbConnect();
				parcelizedAgcs.forEach(async (agc, index) => {
					try {
						await PARCELIZED_AGC_MODEL.create(agc);
						console.log(
							chalk.success(
								"The parcelized AGC data was successfully written to the ATLAS database"
							)
						);
					} catch (err) {
						console.error(chalk.fail(err.message));
						if (index == parcelizedAgcs.length - 1) {
							process.exit();
						}
					}
				});
				break;
			default:
				console.error(chalk.fail("Unsupported uploader specified"));
				break;
		}
	} catch (_err) {
		console.error(chalk.fail(_err.message));
	}
};

// TODO
// WIP
const saveAgcsToDatabase = async (agcFileName) => {

	// READ THE JSON FILE
	const agcs = JSON.parse(fs.readFileSync("../agcs/batch-imports/kuje-fct-agcs.geojson", "utf-8"));
	// const agcs = JSON.parse(fs.readFileSync(`../agcs/${agcFileName}.geojson', 'utf-8`));

	try {
		await dbConnect();
		await AGC_MODEL.create(agcs);
		console.log(success("The AGC data was successfully written to the ATLAS database"));
	} catch (err) {
		console.error(error(err.message));
	}
	process.exit(); // end the NODE process
};

// DELETE ONE PARCELIZED AGC
const deleteOneAGC = async (docId) => {
	// CONNECT TO THE DB..
	await dbConnect();

	try {
		// INIT A 'readline' INTERFACE
		const readline = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		// CLOSE THE USER PROMPT & END THE PROCESS
		const endInteraction = () => {
			console.log(chalk.warning("Exiting interaction.. "));
			readline.close();
			process.exit();
		};

		// INITIATE USER INTERACTION
		readline.question(
			chalk.interaction(`Are you sure you want to delete this AGC: ${docId}? [ y / yes / Y ]: `),
			async (answer) => {
				if (answer === "y" || answer === "yes" || answer === "Y") {
					readline.question(
						chalk.interaction("Type the name of the collection you want to erase from: "),
						async (name) => {
							let dbModel, mongoQueryObj;

							switch (true) {
								case name === "agcs" || name === "AGCS":
									dbModel = AGC_MODEL;
									mongoQueryObj = { "properties.agc_id": docId };
									break;

								case name === "parcelized-agcs" ||
									name === "PARCELIZED-AGCS" ||
									name === "pagcs":
									dbModel = PARCELIZED_AGC_MODEL;
									mongoQueryObj = { "properties.agc_id": docId };
									break;

								case name === "legacy-agcs" ||
									name === "LEGACY-AGCS" ||
									name === "lagcs" ||
									name === "LAGCS":
									dbModel = LEGACY_AGC_MODEL;
									mongoQueryObj = { "properties.geo_cluster_id": docId };
									break;

								case name === "processed-legacy-agcs" ||
									name === "PROCESSED-LEGACY-AGCS" ||
									name === "proclagcs" ||
									name === "PROCLAGCS":
									dbModel = PROCESSED_LEGACY_AGC_MODEL;
									mongoQueryObj = { "properties.legacy_agc_id": docId };
									break;

								default:
									endInteraction();
									break;
							}

							// CHECK IF THAT PARTICULAR AGC ID EXISTS
							if (await findOneDocument(dbModel, mongoQueryObj)) {
								// DELETE THE DOCUMENT THAT PARTICULAR AGC ID
								await dbModel.deleteOne(mongoQueryObj, (err, data) => {
									if (!err) {
										console.log(
											chalk.success(
												`The AGC ${docId} was successfully deleted from the ${name} db. collection `
											)
										);
										endInteraction();
									} else {
										console.log(
											chalk.fail(`Something went wrong with the delete operation.. `)
										);
										endInteraction();
									}
								});
							} else {
								console.log(
									chalk.warning(
										`That AGC ID does not belong to any AGC in the ${name} db. collection `
									)
								);
								endInteraction();
							}
						}
					);
				} else {
					endInteraction();
				}
			}
		);
	} catch (deleteOneAGCErr) {
		console.error(chalk.fail(deleteOneAGCErr.message));
		process.exit();
	}
};

// EXPLORE THE DATA IN THE PARCELIZED AGC COLLECTION
const exploreParcelizedClustersCollection = async () => {
	try {
		await dbConnect();
		const parcelizedGeoClusters = await PARCELIZED_AGC_MODEL.find();

		switch (process.argv[3]) {
			case `--props`:
				for (const geoCluster of parcelizedGeoClusters) {
					console.log(geoCluster.properties);
				}
				break;

			case `--props-ids`:
				for (const geoCluster of parcelizedGeoClusters) {
					console.log(geoCluster.properties.agc_id);
				}
				break;

			case `--props-ids-areas`:
				for (const geoCluster of parcelizedGeoClusters) {
					console.log(
						`${geoCluster.properties.agc_id} - ${geoCluster.properties.agc_area.toFixed(
							2
						)} ha.`
					);
				}
				break;

			default:
				console.log(parcelizedGeoClusters);
				break;
		}

		console.log(chalk.success(`${parcelizedGeoClusters.length} PARCELIZED CLUSTERS `));
	} catch (_err) {
		console.log(_err.message);
	}
	process.exit();
};

// RETURN & SAVE ALL THE PARCELIZED AGCS FROM THE DATABASE
async function returnAllParcelizedClusters() {
	try {
		const axiosRequest = axios({
			method: "get",
			// url: `https://geoclusters.herokuapp.com/api/v1/parcelized-agcs/`,
			url: `http://127.0.0.1:9443/api/v1/parcelized-agcs/`,
			crossDomain: true,
			responseType: "application/json",
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
				// 'Authorization': ''
			},
			data: {},
		});

		// GET RESPONSE FROM API CALL
		const apiResponse = await axiosRequest;
		const dbCollectionData = JSON.stringify(apiResponse.data);
		const parcelizedClusters = JSON.stringify(apiResponse.data.data.parcelized_agcs);
		const numDocs = apiResponse.data.num_parcelized_agcs;

		// CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
		let requestTimeStr = new Date(Date.parse(apiResponse.data.requested_at)).toISOString();
		requestTimeStr = requestTimeStr.replace(/:/g, ".");
		requestTimeStr = requestTimeStr.replace(/T/g, "-T");

		// WRITE RESULT TO NEW FILE
		fs.writeFile(
			`../parcelized-agcs/bulk-import-data/parcelized-agcs-${requestTimeStr}.json`,
			dbCollectionData,
			(err, data) => {
				if (err) {
					console.log(chalk.fail(err.message));
					process.exit();
				} else {
					console.log(
						chalk.success(
							`All the returned parcelized AGCs (${numDocs}) were saved to file.. `
						)
					);
					process.exit();
				}
			}
		);
	} catch (error) {
		console.error(error.message);
	}
}

/**
 * A sinple command line script using `process.arg` to selectively execute Atlas DB commands for different collections
 */
// console.log(process.argv);

if (!process.argv[2]) {
	console.log(
		chalk.consoleYlow(
			`usage: [--explore] [--upload-many] [--upload-one <agc_id>] [--wipe] [--delete <agc_id>] [--import--all]`
		)
	);
} else if (process.argv[2] === "--upload-many") {
	saveParcelizedAgcsToDatabase(process.argv[3]);
} else if (process.argv[2] === "--upload-one" && process.argv[3]) {
	saveAgcsToDatabase(process.argv[3]);
} else if (process.argv[2] === "--explore") {
	exploreParcelizedClustersCollection();
} else if (process.argv[2] === "--wipe") {
	wipeParcelizedClustersCollection();
} else if (process.argv[2] === "--delete" && process.argv[3]) {
	deleteOneAGC(process.argv[3]); // agcId
} else if (process.argv[2] === "--import-all") {
	returnAllParcelizedClusters();
}