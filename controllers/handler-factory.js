`use strict`;
const chalk = require(`../utils/chalk-messages.js`);
const { _catchAsyncError } = require("../utils/helpers.js");
const ServerError = require("../utils/server-error.js");

exports.getAllDocuments = async function (request, model) {
	// extract only db filters from the request query string object
	const queryObj = { ...request.query }; // make a copy of the request query string object
	const excludedFields = ["page", "sort", "limit", "fields"];
	excludedFields.forEach((el) => delete queryObj[el]); // exclude those fields from the query obj.

	// RE-FORMAT A QUERY STRING TO MONGODB FILTER FORMAT
	// GET request: 127.0.0.1:9443/api/v1/tours?difficulty=easy&price[lte]=500
	// { difficulty: 'easy', price: { lte: 500} } // mongoDB filter query string obj. from above GET req.
	let queryStr = JSON.stringify(queryObj);
	let formattedQueryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // add the '$' sign to the operator

	// BUILD THE QUERY
	// model.find() returns a Query obj., and you can chain more Query class mtds. (like .sort()) to it.
	let dbQuery = model.find(JSON.parse(formattedQueryStr));

	console.log(chalk.consoleGy(`Querying database .. `));

	// 3. SORTING
	// GET request: 127.0.0.1:9443/api/v1/tours?difficulty=hard&sort=price,ratingsQuantity => ascending
	// GET request: 127.0.0.1:9443/api/v1/tours?difficulty=hard&sort=-price,-ratingsQuantity => descending
	if (request.query.sort) {
		// check if the query string obj. has a sort property
		const sortByCriteria = request.query.sort.split(",").join(" ");
		dbQuery = dbQuery.sort(sortByCriteria); // mongoose format > .sort('price ratingsQuality')
	} else {
		dbQuery = dbQuery.sort("-createdAt");
	}

	// 4. LIMIT FIELDS IN EACH RESULT (aka: "PROJECTING")
	// GET request: http://127.0.0.1:9443/api/v1/tours?fields=name,price,ratingsAverage,summary
	if (request.query.fields) {
		const fields = request.query.fields.split(",").join(" ");
		dbQuery = dbQuery.select(fields); // mongoose format > .select('name price ratingsAverage')
	} else {
		dbQuery = dbQuery.select("-__v"); // exclude the MongoDB "__v" field (use the "-")
	}

	// 5. PAGINATION
	// GET request: 127.0.0.1:9443/api/v1/tours?limit=3&page=2
	// 1-10 => page 1, 11-20 => page 2, 21-30 => page 3
	const page = request.query.page * 1 || 1; // page num. (default > page 1)
	const limit = request.query.limit * 1 || 100; // num. results per page (default > 100)

	// MTD. 1
	const skippedResults = (page - 1) * limit; // num. results to skip
	dbQuery = dbQuery.skip(skippedResults).limit(limit);

	// MTD. 2
	const resultsStartIndex = (page - 1) * limit;
	const resultsEndIndex = page * limit;

	// DONT SKIP IF ...
	if (request.query.page) {
		const numDocuments = await model.countDocuments();
		if (skippedResults >= numDocuments) {
			throw new Error(`That page [ page: ${page} ] does not exist..`);
		}
	}

	// EXECUTE THE QUERY
	const retreivedDocs = await dbQuery;

	console.log(chalk.consoleGy(`Query complete `));

	return retreivedDocs;
};

exports.insertOneDocument = async function (request, response, model) {
	const payload = request.body;

	try {
		const newDBDoc = await model.create(payload);

		if (newDBDoc) {
			response.status(201).json({
				status: "success",
				inserted_at: request.requestTime,
				data: newDBDoc,
			});
		}
	} catch (insertDocErr) {
		console.log(chalk.fail(`insertDocErr: ${insertDocErr.message}`));

		response.status(400).json({
			status: "fail",
			message:
				"That POST request failed. Refer to the API documentation, and fix your JSON payload.",
			error_msg: insertDocErr.message,
		});
	}
};

exports.findOneDocument = async (model, queryObj) => {
	console.log({ queryObj });
	try {
		// if (await model.count(queryObj) !==0) return true;
		if ((await model.countDocuments(queryObj)) !== 0) return true;
		else return false;
	} catch (findDocErr) {
		console.log(chalk.fail(`findDocErr: ${findDocErr.message}`));
	}
};

exports.returnOneDocument = async (model, queryObj) => {
	try {
		const dbQuery = model.find(queryObj);
		const doc = await dbQuery;
		return doc;
	} catch (returnDocErr) {
		console.log(chalk.fail(`returnDocErr: ${returnDocErr.message}`));
	}
};

exports.insertDocumentIfNotExists = async (model, queryObj, reqBody, next) => {
	try {
		// Check if a matching document already exists
		const dbDoc = await exports.findOneDocument(model, queryObj);
		if (dbDoc) {
			throw new ServerError(
				`A document matching <${JSON.stringify(queryObj)}> already exists in the database`,
				409
			);
		}
		const newDBDoc = await model.create(reqBody);
		return newDBDoc;
	} catch (error) {
		// Handle any errors thrown by findOneDocument or model.create
		return next(
			new ServerError(`Problem inserting new document in database: ${error.message}`, 500)
		);
	}
};
