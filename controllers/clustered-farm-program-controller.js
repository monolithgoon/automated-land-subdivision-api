`use strict`;
const { v4: uuidv4 } = require("uuid");
const chalk = require(`../utils/chalk-messages.js`);
const ServerError = require(`../utils/server-error.js`);
const CLUSTERED_FARM_PROGRAM_MODEL = require("../models/clustered-farm-program-model");
const {
	getAllDocuments,
	insertDocumentIfNotExists,
} = require("./handler-factory/handler-factory.js");
const { _catchSyncError, _catchAsyncError } = require("../utils/helpers.js");
const catchAsyncServer = require("../utils/catch-async-server.js");
const CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL = require("../models/clustered-farm-program-feat-coll-model.js");
const FARMER_BIODATA_MODEL = require("../models/farmer-biodata-model.js");

// REMOVE
// exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
// 	console.log(chalk.success(`CALLED [ insertFarmProgram ] CONTROLLER FN.`));

// 	// Check if req.body is not null or undefined
// 	if (req.body) {

// 		const farmProgramId = req.body.farm_program_id;

// 		// REMOVE
// 		// try {
// 		//   // Check if a document with the program_id already exists
// 		//   const dbFarmProgramDoc = await findOneDocument(CLUSTERED_FARM_PROGRAM_MODEL, { farm_program_id: farmProgramId });

// 		//   if (dbFarmProgramDoc) {
// 		//     // A document with the program_id already exists, return an error
// 		//     return next(new ServerError(`A document with this program_id <${farmProgramId}> already exists in the database`, 409));
// 		//   }

// 		//   // Insert the new farm program into the database
// 		//   const newFarmProgramDoc = await CLUSTERED_FARM_PROGRAM_MODEL.create(req.body);

// 		// 	// Extract the object created by the `model.create()` operation
// 		// 	const newFarmProgramObj = newFarmProgramDoc.toObject();

// 		// 	// Append it to the the `req.locals` obj
// 		// 	req.locals.appendedFarmProgram = newFarmProgramObj;

// 		//   next();

// 		// } catch (error) {
// 		//   // Handle any errors thrown by findOneDocument or CLUSTERED_FARM_PROGRAM_MODEL.create
// 		//   return next(new ServerError(`Problem inserting new document in database: ${error.message}`, 500));
// 		// }

// 		const newFarmProgramDoc = await insertDocumentIfNotExists(
// 			CLUSTERED_FARM_PROGRAM_MODEL,
// 			{ farm_program_id: farmProgramId },
// 			req.body,
// 			next
// 		);

// 		if (!newFarmProgramDoc) return next(new ServerError(`Failed to insert the new farm program payload`, 500));

// 		// Extract the object created by the `model.create()` operation
// 		const newFarmProgramObj = newFarmProgramDoc.toObject();

// 		// Append it to the the `req.locals` obj
// 		req.locals.appendedFarmProgram = newFarmProgramObj;

// 		next();

// 	} else {
// 		// req.body is null or undefined, do nothing
// 		next();
// 	}
// }, `inertFarmProgram`);

/**
 * @async
 * @function insertFarmProgram
 * @description Inserts a new farm program into the database if it doesn't already exist.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
exports.insertFarmProgram = catchAsyncServer(async (req, res, next) => {
  console.log(chalk.success(`CALLED [ insertFarmProgram ] CONTROLLER FN.`));

  // Check if req.body is not null or undefined
  if (req.body) {

    const farmProgramId = req.body.farm_program_id;

    // Call insertDocumentIfNotExists to add new farm program to the database
    const newFarmProgramDoc = await insertDocumentIfNotExists(
      CLUSTERED_FARM_PROGRAM_MODEL,
      { farm_program_id: farmProgramId },
      req.body,
      next
    );

    // Handle error if the document failed to insert
    if (!newFarmProgramDoc) return next(new ServerError(`Failed to insert the new farm program payload`, 500));

    // Extract the object created by the `model.create()` operation
    const newFarmProgramObj = newFarmProgramDoc.toObject();

    // Append the new farm program object to the `req.locals` object
    req.locals.appendedFarmProgram = newFarmProgramObj;

    next();

  } else {
    // If req.body is null or undefined, do nothing
    next();
  }
}, `insertFarmProgram`);

const getFarmerCloudImageUrl = _catchAsyncError(async (farmerId, base64Image, cloudService) => {
	const cloudUrl = `https://cloudinary.com/${farmerId}`;
	return cloudUrl;
}, `getFarmerCloudImageUrl`);

// A helper function to update the farmer biodata object with the new image URL
function updateFarmerBiodata(farmerBiodata, farmerCloudImageUrl) {
		
	// /**
	//  * Create a new empty object {} and then use Object.assign() to copy the properties from `farmerBiodata` into the new object.
	//  * Then add the `farmer_cloud_image_url` field with the value of `farmerCloudImageUrl`.
	//  */
	// const updatedFarmerBiodata = Object.assign({}, farmerBiodata, {
	// 	farmer_cloud_image_url: farmerCloudImageUrl,
	// });
	
  return {
    ...farmerBiodata,
    farmer_cloud_image_url: farmerCloudImageUrl,
  };
}

// REMOVE > DEPRECATED
// async function saveFarmerBiodataToDatabase(updatedFarmerBiodata, nextFn) {

// 	console.log({ updatedFarmerBiodata })

// 	if (updatedFarmerBiodata) {

// 		const globalFarmerId = updatedFarmerBiodata.farmer_global_id;
		
// 		// Insert farmer biodata into database
// 		const newFarmerDoc = await insertDocumentIfNotExists(FARMER_BIODATA_MODEL, { farmer_global_id: globalFarmerId }, updatedFarmerBiodata, nextFn);

// 		if (!newFarmerDoc) return nextFn(new ServerError(`Failed to insert the new farmer`, 500));

// 		// Extract the object created by the `model.create()` operation
// 		const newFarmerObj = newFarmerDoc.toObject();

// 		console.log({ newFarmerObj })

// 		// // Send server response
// 		// res.status(201).json({
// 		// 	status: `success`,
// 		// 	inserted_at: req.requestTime,
// 		// 	data: newFarmerObj,
// 		// });		

// 	} else {
// 		// updatedFarmerBiodata is null or undefined; inform the user
// 		// res.status(400).json({
// 		// 	status: `fail`,
// 		// 	message: `The insert operation failed`
// 		// });		
// 		return nextFn(new ServerError(`Something went wrong: <updatedFarmerBiodata> is "null" or "undefined"`))
// 	}

// 	// If all is successful w/out errors, construct a URL to retreive farmer's biodata
// 	const farmerGlobalUrl = `https://geoclusters.com/farmers/farmer/${updatedFarmerBiodata.farmer_global_id}`;

// 	return farmerGlobalUrl;	
// }

// REMOVE
// const saveFarmerBiodataToDatabase = _catchAsyncError(async(updatedFarmerBiodata, nextFn) => {

// 	if (!updatedFarmerBiodata) {
// 		throw new ServerError(`Something went wrong: <updatedFarmerBiodata> is "null" or "undefined"`);
// 	}

// 	// console.log({ updatedFarmerBiodata })

// 	const globalFarmerId = updatedFarmerBiodata.farmer_global_id;

// 	// Insert farmer biodata into database
// 	const newFarmerDoc = await insertDocumentIfNotExists(FARMER_BIODATA_MODEL, { farmer_global_id: globalFarmerId }, updatedFarmerBiodata, nextFn);

// 	if (!newFarmerDoc) {
// 		throw new ServerError(`Failed to insert the new farmer biodata payload`, 500);
// 	}

// 	// Extract the object created by the `model.create()` operation
// 	const newFarmerObj = newFarmerDoc.toObject();

// 	// If all is successful without errors, construct a URL for retrieving the farmer's biodata
// 	const newFarmerGlobalUrl = `api/v3/farmers/farmer/${updatedFarmerBiodata.farmer_global_id}`;

// 	return {
// 		status: "success",
// 		inserted_at: new Date(),
// 		data: { new_farmer: newFarmerObj, new_farmer_global_url: newFarmerGlobalUrl },
// 	};

// }, `saveFarmerBiodataToDatabase`)

/**
 * @async
 * @function saveFarmerBiodataToDatabase
 * @description Asynchronous function for saving a farmer's biodata to the database.
 * @param {object} updatedFarmerBiodata - An object containing the updated farmer biodata to be saved to the database.
 * @param {function} nextFn - The next function to be called in the Express middleware chain.
 * @returns {Promise<object>} Returns a promise that resolves to an object containing information about the inserted farmer biodata.
 * @throws {ServerError} If there is an error during the database insertion operation.
 */
const saveFarmerBiodataToDatabase = _catchAsyncError(async(updatedFarmerBiodata, nextFn) => {

	// Throw an error if the updated farmer biodata object is null or undefined
	if (!updatedFarmerBiodata) {
		throw new ServerError(`Something went wrong: <updatedFarmerBiodata> is "null" or "undefined"`);
	}

	// console.log({ updatedFarmerBiodata })

	// Get the global farmer ID from the updated farmer biodata object
	const globalFarmerId = updatedFarmerBiodata.farmer_global_id;

	// Insert the farmer biodata into the database if it doesn't already exist
	const newFarmerDoc = await insertDocumentIfNotExists(FARMER_BIODATA_MODEL, { farmer_global_id: globalFarmerId }, updatedFarmerBiodata, nextFn);

	// Throw an error if the insertion operation failed
	if (!newFarmerDoc) {
		throw new ServerError(`Failed to insert the new farmer biodata payload`, 500);
	}

	// Extract the object created by the `model.create()` operation
	const newFarmerObj = newFarmerDoc.toObject();

	// If all is successful without errors, construct a URL for retrieving the farmer's biodata
	const newFarmerGlobalUrl = `api/v3/farmers/farmer/${updatedFarmerBiodata.farmer_global_id}`;

	// Return an object containing information about the inserted farmer biodata
	return {
		status: "success",
		inserted_at: new Date(),
		data: { new_farmer: newFarmerObj, new_farmer_global_url: newFarmerGlobalUrl },
	};

}, `saveFarmerBiodataToDatabase`);


// A helper function to update the farmer object with the new image URL and other fields
function updateProgramFarmer(farmer, farmerGlobalUrl, farmerCloudImageUrl) {

  return {
    ...farmer,
    farmer_global_url: farmerGlobalUrl,
    farmer_global_id: farmer.farmer_bio_data.farmer_global_id,
    farm_program_farmer_id: farmer.farm_program_farmer_id,
    farmer_funding_timeline: farmer.farmer_funding_timeline,
    farmer_farm_details: farmer.farmer_farm_details,
    farmer_farm_practice: farmer.farmer_farm_practice,
    farmer_cloud_image_url: farmerCloudImageUrl,
  };
};

// REMOVE -> DEPRECATED FOR `updateFarmProgram`
exports.getFarmerBiodataUrls = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ storeFarmersBiodata ] CONTROLLER FN. `));

	const farmProgram = req.locals.appendedFarmProgram;

	if (!farmProgram) {
		return next(new ServerError(`Something went wrong`, 500));
	}

	const updatedFarmers = [];

	if (farmProgram.farm_program_farmers) {
		
		farmProgram.farm_program_farmers.forEach((farmer) => {

			// Get farmer cloud photo URL
			// const globalFarmerId = farmer["farmer_bio_data"]["farmer_global_id"];
			const { farmer_global_id: globalFarmerId } = farmer.farmer_bio_data;
			// const farmerBase64Image = farmer["farmer_bio_data"]["farmer_image_base64"];
			const { farmer_image_base64: farmerBase64Image } = farmer.farmer_bio_data;
			const farmerCloudImageUrl = getFarmerCloudImageUrl(globalFarmerId, farmerBase64Image, {});

			// Store the `farmer_bio_data` object in a variable
			const farmerBiodata = farmer.farmer_bio_data;

			/**
			 * Create a new empty object {} and then use Object.assign() to copy the properties from `farmerBiodata` into the new object.
			 * Then add the `farmer_cloud_image_url` field with the value of `farmerCloudImageUrl`.
			 */
			const updatedFarmerBiodata = Object.assign({}, farmerBiodata, {
				farmer_cloud_image_url: farmerCloudImageUrl,
			});

			console.log({ updatedFarmerBiodata });

			// TODO
			// Insert in farmer bio data database
			const farmerGlobalUrl = `https://geoclusters.com/farmers/farmer/${globalFarmerId}`;

			const updatedProgramFarmer = {
				...farmer,
				farmer_global_id: farmer.farmer_global_id,
				farm_program_farmer_id: farmer.farm_program_farmer_id,
				farmer_global_url: farmerGlobalUrl,
				farmer_funding_timeline: farmer.farmer_funding_timeline,
				farmer_farm_details: farmer.farmer_farm_details,
				farmer_farm_practice: farmer.farmer_farm_practice,
			};
			// console.log({ updatedProgramFarmer });
			updatedFarmers.push(updatedProgramFarmer);
		});
	}

	const updatedFarmProgram = {
		...farmProgram,
		farm_program_farmers: updatedFarmers,
	};

	req.locals.updatedFarmProgram = updatedFarmProgram;

	// Pass control to the next middleware or controller
	next();
}, `getFarmerBiodataUrls`);

// REMOVE -> DEPRECATED
// async function updateFarmProgram (farmProgram, nextFn) {

//   const updatedFarmers = [];

//   if (farmProgram.farm_program_farmers) {

//     // Loop through each farmer in the program and update their biodata and image URL
//     for (const farmer of farmProgram.farm_program_farmers) {
      
// 			// const globalFarmerId = farmer["farmer_bio_data"]["farmer_global_id"];
//       const { farmer_global_id: globalFarmerId } = farmer.farmer_bio_data;

// 			const farmerBase64Image = farmer["farmer_bio_data"]["farmer_image_base64"];
// 			// const { farmer_image_base64: farmerBase64Image } = farmer.farmer_bio_data;

//       // const farmerCloudImageUrl = getFarmerCloudImageUrl(globalFarmerId, farmerBase64Image, {});
//       const farmerCloudImageUrl = await getFarmerCloudImageUrl(globalFarmerId, farmerBase64Image, {});

//       const updatedFarmerBiodata = updateFarmerBiodata(farmer.farmer_bio_data, farmerCloudImageUrl);

// 			const { data: { new_farmer_global_url: newFarmerGlobalUrl }} = await saveFarmerBiodataToDatabase(updatedFarmerBiodata, nextFn)

//       const updatedProgramFarmer = updateProgramFarmer(farmer, newFarmerGlobalUrl, farmerCloudImageUrl);

// 			console.log({ updatedProgramFarmer })

//       updatedFarmers.push(updatedProgramFarmer);
//     }
//   }

//   const updatedFarmProgram = {
//     ...farmProgram,
//     farm_program_farmers: updatedFarmers,
//   };

// 	return updatedFarmProgram;
// }

/**
 * Update the biodata and image URL for each farmer in a farm program.
 * @param {object} farmProgram - The farm program to update.
 * @param {function} nextFn - A function to call for the next step in the process.
 * @returns {object} - The updated farm program.
 */
async function updateFarmProgram(farmProgram, nextFn) {

  const updatedFarmers = [];

  if (farmProgram.farm_program_farmers) {

    // Loop through each farmer in the program and update their biodata and image URL
    for (const farmer of farmProgram.farm_program_farmers) {
      
      // Extract `farmer_global_id` & `farmer_image_base64` props. from the farmer object using destructuring
      const { farmer_bio_data: { farmer_global_id, farmer_image_base64 } } = farmer;

      // Get the farmer's cloud image URL
      const farmerCloudImageUrl = await getFarmerCloudImageUrl(farmer_global_id, farmer_image_base64, {});

      // Update the farmer's biodata with the new image URL
      const updatedFarmerBiodata = updateFarmerBiodata(farmer.farmer_bio_data, farmerCloudImageUrl);

      // Upload the updated farmer's biodata and get the new global URL
      const { data: { new_farmer_global_url: newFarmerGlobalUrl }} = await saveFarmerBiodataToDatabase(updatedFarmerBiodata, nextFn);

      // Update the farmer's program details with the new global URL and cloud image URL
      const updatedProgramFarmer = updateProgramFarmer(farmer, newFarmerGlobalUrl, farmerCloudImageUrl);

      // Add the updated farmer to the list of updated farmers
      updatedFarmers.push(updatedProgramFarmer);
    }
  }

  // Return the updated farm program with the updated farmers array
  return {
    ...farmProgram,
    farm_program_farmers: updatedFarmers,
  };
}

/**
 * @async
 * @function updateFarmersInProgram
 * @description Updates the farmers in a given farm program and appends the updated program to the `req.locals` object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {Promise<void>}
 */
exports.updateFarmersInProgram = catchAsyncServer(async (req, res, next) => {

	// Log that the controller function was called
	console.log(chalk.success(`CALLED [ updateFarmersInProgram ] CONTROLLER FN. `));

	// Get the appended farm program from `req.locals`
	const farmProgram = req.locals.appendedFarmProgram;

	// Check that the farmProgram exists
	if (!farmProgram) {
		return next(new ServerError(`Something went wrong: could not get <req.locals.appendedFarmProgram>`, 500));
	}

	// Call the updateFarmProgram function with the `farmProgram` object and pass the `next` function for error handling
	const updatedFarmProgram = await updateFarmProgram(farmProgram, next);

	// Set the updated farm program object to the `req.locals` object
	req.locals.updatedFarmProgram = updatedFarmProgram;

	// Pass control to the next middleware or controller
	next();

}, `updateFarmProgram`);

/**
 * @function convertMultiPointToPolygon
 * @description Convert a MultiPoint feature to a Polygon feature by joining the coordinates of the MultiPoint feature.
 * @param {Object} feature - The MultiPoint feature to convert to a Polygon feature.
 * @return {Object} - The Polygon feature with the joined coordinates.
 */
function convertMultiPointToPolygon(feature) {

  // Extract the coordinates from the MultiPoint feature
  const coordinates = feature.geometry.coordinates;

  // Create the polygon coordinates by adding the first coordinate to the end of the array to close the polygon
  const polygonCoordinates = [...coordinates, coordinates[0]];

  // Create the Polygon feature using the same properties as the MultiPoint feature
  const polygonFeature = {
    type: "Feature",
		_id: uuidv4(),
    properties: feature.properties,
    geometry: {
      type: "Polygon",
      coordinates: [polygonCoordinates],
    },
  };

	console.log({ polygonFeature })
	// throw new Error (`FUCK HER`)

  return polygonFeature;
};

// REMOVE > DEPRECATED
// function createFeatureCollection(farmProgramJSON) {

// 	// Eliminate the `farm_program_farmers` field
// 	const filteredFarmProgramJSON = Object.fromEntries(
// 		Object.entries(farmProgramJSON).filter(([key, value]) => key !== "farm_program_farmers")
// 	);

// 	// Init. a FeatureCollection for the farm program
// 	const featureCollection = {
// 		type: "FeatureCollection",
// 		// "features": [],
// 		features: [],
// 		properties: filteredFarmProgramJSON,
// 	};

// 	// Create a MultiPoint GeoJSON Feature based on each farmer's `farmer_farm_details
// 	farmProgramJSON.farm_program_farmers.forEach((farmer) => {

// 		const feature = {
// 			type: "Feature",
// 			geometry: {
// 				type: "MultiPoint",
// 				coordinates: farmer["farmer_farm_details"].farm_coordinates,
// 			},
// 			properties: farmer,
// 		};

// 		const updatedFeature = {
// 			...feature,
// 			// Strip the Feature `properties` of confidential farmer info.
// 			properties: {
// 				farmer_global_url: farmer["farmer_global_url"],
// 				farm_program_farmer_id: farmer["farm_program_farmer_id"],
// 				farmer_farm_details: Object.fromEntries(
// 					Object.entries(farmer["farmer_farm_details"]).filter(
// 						([key, value]) => key !== "farm_coordinates"
// 					)
// 				),
// 				farmer_farm_practice: farmer["farmer_farm_practice"],
// 				farmer_funding_timeline: farmer["farmer_funding_timeline"],
// 			},
// 		};

// 		//
// 		featureCollection.features.push(updatedFeature);
// 	});

// 	return featureCollection;
// }

/**
 * @function createFeatureCollection
 * @description Create a GeoJSON FeatureCollection from a farm program JSON object.
 * @param {Object} farmProgramJSON - A farm program JSON object.
 * @returns {Object} A GeoJSON FeatureCollection object.
 */
function createFeatureCollection(farmProgramJSON) {

  // Eliminate the `farm_program_farmers` field
  const filteredFarmProgramJSON = Object.fromEntries(
    Object.entries(farmProgramJSON).filter(([key, value]) => key !== "farm_program_farmers")
  );

  // Init. a FeatureCollection for the farm program
  const featureCollection = {
    type: "FeatureCollection",
    features: [], // Initialize an empty array of features
    properties: filteredFarmProgramJSON,
		// _id: 
  };

  // Create a MultiPoint GeoJSON Feature based on each farmer's `farmer_farm_details`
  const features = farmProgramJSON.farm_program_farmers.map((farmer) => {

    // Extract the `farmer_farm_details` property from the farmer object
    const { farmer_farm_details } = farmer;

    // Separate the `farm_coordinates` property from `farmer_farm_details`
    const { farm_coordinates, ...otherFarmDetails } = farmer_farm_details;

    // Create a new GeoJSON Feature object with the stripped `farmer_farm_details`
    const multiPointFeature = {
      type: "Feature",
      geometry: {
        type: "MultiPoint",
        coordinates: farm_coordinates,
				// _id: 
      },
			// Append only relevant, non-confidential farmer info to the Feature properties
      properties: {
        farmer_global_url: farmer["farmer_global_url"],
        farm_program_farmer_id: farmer["farm_program_farmer_id"],
        farmer_farm_details: otherFarmDetails,
        farmer_farm_practice: farmer["farmer_farm_practice"],
        farmer_funding_timeline: farmer["farmer_funding_timeline"],
      },
    };

		const polygonFeature = convertMultiPointToPolygon(multiPointFeature);

		// WIP
		return polygonFeature;
    return multiPointFeature;
  });

  // Add the features to the FeatureCollection
  featureCollection.features = features;

  return featureCollection;
};

exports.convertFarmProgramToGeoJson = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED [ convertFarmProgramToGeoJson ] CONTROLLER FN. `));

	// const farmProgram = req.locals.appendedFarmProgram;
	const farmProgram = req.locals.updatedFarmProgram;

	if (!farmProgram)
		return next(
			new ServerError(`Something went wrong: can't find <req.locals.updatedFarmProgram>`, 500)
		);

	const farmProgramFeatColl = createFeatureCollection(farmProgram);

	req.locals.appendedFarmProgramFeatColl = farmProgramFeatColl;

	next();
}, `convertFarmProgramToGeoJson`);

exports.insertFarmProgramGeoJson = catchAsyncServer(async (req, res, next) => {

	console.log(chalk.success(`CALLED [ insertFarmProgramGeoJson ] CONTROLLER FN. `));

	const farmProgramFeatColl = req.locals.appendedFarmProgramFeatColl;

	if (!farmProgramFeatColl)
		return next(new ServerError(
			`Something went wrong: can't find <req.locals.processedFarmProgramFeatColl>`,
			500
		));

	if (farmProgramFeatColl) {

		const farmProgramId = farmProgramFeatColl.properties["farm_program_id"];

		const newFarmProgramFeatCollDoc = await insertDocumentIfNotExists(CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL, { "properties.farm_program_id": farmProgramId }, farmProgramFeatColl, next);

		if (!newFarmProgramFeatCollDoc) return next(new ServerError(`Failed to insert the new farm program FeatureCollection`, 500));

		// Extract the object created by the `model.create()` operation
		const newFarmProgramFeatColl = newFarmProgramFeatCollDoc.toObject();

		// 
		res.status(201).json({
			status: `success`,
			inserted_at: req.requestTime,
			data: newFarmProgramFeatColl,
		});		

	} else {
		// farmProgramFeatColl is null or undefined; inform the user
		res.status(400).json({
			status: `fail`,
			message: `The insert operation failed`
		});		
	}
}, `insertFarmProgramGeoJson`);

exports.getAllFarmPrograms = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED the [ getAllFarmPrograms ] CONTROLLER FN. `));
	const clusteredFarmPrograms = await getAllDocuments(req, CLUSTERED_FARM_PROGRAM_MODEL);
	res.status(200).json({
		status: `success`,
		requested_at: req.requestTime,
		num_docs: clusteredFarmPrograms.length,
		data: {
			collection_name: `clustered-farm-programs`,
			collection_docs: clusteredFarmPrograms,
			docs_count: clusteredFarmPrograms.length,
		},
	});
}, `getAllFarmPrograms`);

exports.getFarmProgram = catchAsyncServer(async (req, res, next) => {}, `getFarmProgram`);

exports.getAllProcessedFarmPrograms = catchAsyncServer(async (req, res, next) => {
	console.log(chalk.success(`CALLED the [ getAllProcessedFarmPrograms ] CONTROLLER FN. `));
	const clusteredFarmProgramFeatureCollections  = await getAllDocuments(req, CLUSTERED_FARM_PROGRAM_FEAT_COLL_MODEL);
	res.status(200).json({
		status: `success`,
		requested_at: req.requestTime,
		num_docs: clusteredFarmProgramFeatureCollections.length,
		data: {
			collection_name: `clustered-farm-programs`,
			collection_docs: clusteredFarmProgramFeatureCollections ,
			docs_count: clusteredFarmProgramFeatureCollections.length,
		},
	});
},
`getAllProcessedFarmPrograms`);

exports.getProcessedFarmProgram = catchAsyncServer(async (req, res, next) => {},
`getProcessedFarmProgram`);
