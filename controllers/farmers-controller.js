`use strict`;
const chalk = require(`../utils/chalk-messages.js`);
const catchAsyncServer = require("../utils/catch-async-server.js");
const { getAllDocuments, returnOneDocument, returnOneDocument2 } = require("./handler-factory/handler-factory.js");
const FARMER_BIODATA_MODEL = require("../models/farmer-biodata-model.js");

exports.getAllFarmersBiodata = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED the [ getAllFarmers ] CONTROLLER FN. `));
	const farmers = await getAllDocuments(req, FARMER_BIODATA_MODEL);
	res.status(200).json({
		status: `success`,
		requested_at: req.requestTime,
		num_docs: farmers.length,
		data: {
			collection_name: `farmers`,
			collection_docs: farmers,
			docs_count: farmers.length,
		},
	});
});

// REMOVE
exports.getFarmerBiodata = catchAsyncServer(async (req, res, next) => {

	console.log(chalk.success(`CALLED the [ getFarmerBiodata ] CONTROLLER FN. `));

	// EXTRACT THE farmer_global_id FROM THE QUERY OBJ.
	let query = { ...req.query };

	const queryObjKey = Object.keys(query);

	// RE-BUILD THE QUERY OBJ.
	const queryObj = {
		farmer_global_id: `${queryObjKey[0]}`,
	};

	const farmerBiodata = await returnOneDocument(FARMER_BIODATA_MODEL, queryObj);

	res.status(200).json({
		status: "success",
		data: farmerBiodata,
	});
}, `getFarmerBiodata`);

// REMOVE
exports.getFarmerBiodata2 = catchAsyncServer(async (req, res, next) => {

	console.log(chalk.success(`CALLED the [ getFarmerBiodata ] CONTROLLER FN. `));

	// Copy the parsed request query
	let parsedQuery = { ...req.query };

  console.log({ parsedQuery })

  let queryString = req.originalUrl;

  console.log({ queryString })

  // Extract farmer global ID from query string
	const queryObjKey = Object.keys(parsedQuery);
  const farmerGlobalId = queryObjKey[0];

	// RE-BUILD THE QUERY OBJ.
	const queryObj = {
		farmer_global_id: farmerGlobalId,
	};

	// const farmerBiodata = await returnOneDocument2(FARMER_BIODATA_MODEL, queryString, queryObj);
	const farmerBiodata = await returnOneDocument2(FARMER_BIODATA_MODEL, parsedQuery, queryObj);

	res.status(200).json({
		status: "success",
		data: farmerBiodata,
	});
}, `getFarmerBiodata`);

/**
 * @async
 * @function getFarmerBiodata3
 * @description This controller function retrieves farmer biodata from the database using the farmer's global UUID
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next function.
 * @returns {Promise<void>} Returns a promise that resolves to nothing.
 * @throws {AppError} If an error occurs while retrieving the farmer biodata.
 */
exports.getFarmerBiodata3 = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED the [ getFarmerBiodata3 ] CONTROLLER FN. `));

  // Parse the query parameters and create a copy of them
	let parsedQuery = { ...req.query };

  console.log({ parsedQuery })

	// Build a query object using the farmer's global UUID as a parameter
	const queryObj = {
		farmer_global_id: req.params.id,
	};

  // Retrieve the farmer biodata using the query object and parsed query parameters
	const farmerBiodata = await returnOneDocument2(FARMER_BIODATA_MODEL, parsedQuery, queryObj);

	res.status(200).json({
		status: "success",
		data: farmerBiodata,
	});
  
}, `getFarmerBiodata`);
