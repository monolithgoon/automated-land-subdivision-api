const chalk = require("../utils/chalk-messages");
const LEGACY_AGC_MODEL = require("../models/legacy-agc-model.js");
const LEGACY_AGC_FARMERS_MODEL = require("../models/legacy-agc-farmers-model.js");
const PROCESSED_LEGACY_AGC_MODEL = require("../models/processed-legacy-agc-model.js");
const { getAllDocuments, insertOneDocument, findOneDocument, returnOneDocument } = require("./handler-factory");


// CHECK THAT THE agc_id IS VALID BEFORE RUNNING getAgc()
// FIXME < COMPLETE THIS FN.
exports.checkID = async (req, res, next) => {

	console.log(chalk.console(`Checking the agc_id .. { DUMMY FN. }`));

	next();
};


exports.insertLegacyAgc = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE insertLegacyAgc CONTROLLER FN. `))
   
   const legacyAgcPayload = req.body;
   
   console.log({legacyAgcPayload});

   try {
      
      // CREATE A NEW DOCUMENT
      const newLegacyAgc = await LEGACY_AGC_MODEL.create(legacyAgcPayload) // "model.create" returns a promise

      // SERVER RESPONSE
      res.status(201).json({
         status: 'success',
         inserted_at: req.requestTime,
         data: newLegacyAgc
      });
      
   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: "That POST request failed. Refer to the API documentation, and fix your JSON payload.",
         error_msg: err.message,
      });
   };
};


// GET A SINGLE LEGACY AGC
exports.getLegacyAgc = async (req, res) => {
   
   try {
      
		console.log(chalk.success("YOU SUCCESSFULLY CALLED THE [ getLegacyAgc ] CONTROLLER FN. "));

      // EXTRACT THE geo_cluster_id FROM THE QUERY OBJ.
      let queryObj = { ...req.query }
      const queryObjKey = Object.keys(queryObj);

      // RE-BUILD THE QUERY OBJ.
      queryObj = {
         "properties.geo_cluster_id" : queryObjKey[0]
      };

      let returnedDoc, apiMessage = "";

      if (await findOneDocument(LEGACY_AGC_MODEL, queryObj)) {
         returnedDoc = await returnOneDocument(LEGACY_AGC_MODEL, queryObj);
         // The query using 'geo_cluster_id' returns an array with only one element; deal with it..
         returnedDoc = returnedDoc[0];
      } else {
         returnedDoc = null;
         apiMessage = `Could not find a legacy AGC document for: [ ${queryObjKey[0]} ]`;
      };

      res.status(200).json({
         status: 'success',
         collection_doc: returnedDoc,
         message: apiMessage,
      });
      
   } catch (getLegacyAgcErr) {
      console.error(chalk.fail(getLegacyAgcErr.message));
      res.status(404).json({
			status: "fail",
			console_msg: `That GET request failed.`,
         error_msg: getLegacyAgcErr.message,
		});
   };
};


exports.getAllLegacyAgcs = async (request, response, next) => {

	try {

		console.log(chalk.success("YOU SUCCESSFULLY CALLED THE [ getAllLegacyAgcs ] CONTROLLER FN. "));
      
      // BUILDING THE QUERY
      
         // 1. FILTERING _EXAMPLE 3
         // GET request: 127.0.0.1:9090/api/v1/tours?difficulty=easy&page=2&sort=1&limit=10
         // extract only db filters from the request query string object
            const queryObj = { ...request.query }; // make a copy of the request query string object
            const excludedFields = ['page', 'sort', 'limit', 'fields']; 
            excludedFields.forEach(el => delete queryObj[el]); // exclude those fields from the query obj.
            

         // 2. ADVANCED FILTERING
            // RE-FORMAT A QUERY STRING TO MONGODB FILTER FORMAT
            // { difficulty: 'easy', duration: { $gte: 5} } // normal mongoDB filter string format

            // GET request: 127.0.0.1:9090/api/v1/tours?difficulty=easy&price[lte]=500
               // { difficulty: 'easy', price: { lte: 500} } // query string obj. from above GET req.
               let queryStr = JSON.stringify(queryObj);
               let formattedQueryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // add the '$' sign to the operator
               
               console.log(chalk.warning(`formattedQueryStr: ${formattedQueryStr}`));
               
               
         // BUILD THE QUERY
         // AGC_MODEL.find() returns a Query obj., and you can chain more Query class mtds. (like .sort()) to it.
         let dbQuery = LEGACY_AGC_MODEL.find(JSON.parse(formattedQueryStr)); 
         

         console.log(chalk.working(`Waiting for DB. response .. `))
         
         
         // 3. SORTING
         // GET request: 127.0.0.1:9090/api/v1/tours?difficulty=hard&sort=price,ratingsQuantity > ascending
         // GET request: 127.0.0.1:9090/api/v1/tours?difficulty=hard&sort=-price,-ratingsQuantity > descending
         // console.log(request.query.sort);
         if(request.query.sort) { // check if the query string obj. has a sort property
            const sortByCriteria = request.query.sort.split(',').join(' ');
            console.log(sortByCriteria);
            dbQuery = dbQuery.sort(sortByCriteria) // mongoose format > .sort('price ratingsQuality')
         } else {
            dbQuery = dbQuery.sort('-createdAt')
         }


         // 4. LIMIT FIELDS IN EACH RESULT (aka: "PROJECTING")
         // GET request: http://127.0.0.1:9090/api/v1/tours?fields=name,price,ratingsAverage,summary
         if (request.query.fields) {
            const fields = request.query.fields.split(',').join(' ');
            console.log(chalk.highlight(`fields: ${fields}`))
            dbQuery = dbQuery.select(fields) // mongoose format > .select('name price ratingsAverage')
         } else {
            dbQuery = dbQuery.select('-__v') // exclude the MongoDB "__v" field (use the "-")
         }


         // 5. PAGINATION
         // GET request: 127.0.0.1:9090/api/v1/tours?limit=3&page=2
         // 1-10 => page 1, 11-20 => page 2, 21-30 => page 3
         const page = request.query.page * 1 || 1; // page num. (default > page 1)
         const limit = request.query.limit * 1 || 100; // num. results per page (default > 100)
         
         // MTD. 1
         const skippedResults = (page - 1) * limit; // num. results to skip 
         dbQuery = dbQuery.skip(skippedResults).limit(limit)

         // MTD. 2
         const resultsStartIndex = (page - 1) * limit;
         const resultsEndIndex = page * limit;
         
         // DONT SKIP IF ...
         if (request.query.page) {
            const numLegacyAgcs = await LEGACY_AGC_MODEL.countDocuments();
            if (skippedResults >= numLegacyAgcs) {
               throw new Error(`That page [ page: ${page} ] does not exist..`);
            };
         };


      // EXECUTE THE QUERY
      const returnedLegacyAGCData = await dbQuery;


      // COMPUTE THE NUMBER OF FEATURES PER. GEO-CLUSTER
      const featsLengths = [];
      let totalFeatures = 0;

      returnedLegacyAGCData.forEach(geoCluster => {
         // console.log(geoCluster);
         console.log(chalk.console(`retreived legacy geocluster`));
         if (geoCluster.properties.geo_cluster_total_features) {
            featsLengths.push(geoCluster.properties.geo_cluster_total_features)
         };
      });
      
      if (featsLengths.length > 0) {
         totalFeatures = featsLengths.reduce((sum, numFeats) => sum + numFeats);
      };


      // SEND RESPONSE
      response.status(200).json({

			status: "success",
			requested_at: request.requestTime, // using the custom property from our custom middleware in app.js
			num_legacy_agcs: returnedLegacyAGCData.length,
         num_plot_owners: totalFeatures,
		   legacy_agcs: returnedLegacyAGCData,

         data: {
            collection_docs: returnedLegacyAGCData,
            collection_name: `legacy-agcs`,
            docs_count: returnedLegacyAGCData.length,
         }
      });

      
	} catch (_err) {
		response.status(404).json({
			status: "fail",
			console_msg: `That GET request failed.`,
         error_msg: _err.message,
		});
	}
};


// REMOVE > DEPRC.
// INSERT FARMERS WHOSE BVNs HAVE BEEN VALIDATED
exports.insertProcessedFarmers = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ insertProcessedFarmers ] CONTROLLER FN. `))
   
   const processedFarmersPayload = req.body;
   
   console.log(processedFarmersPayload);

   try {
      
      // CREATE A NEW AGC DOCUMENT _MTD 2
      // const newProcessedFarmersDoc = await AGC_MODEL.create(req.body) // "model.create" returns a promise
      const newProcessedFarmersDoc = await LEGACY_AGC_FARMERS_MODEL.create(processedFarmersPayload) // "model.create" returns a promise

      // SERVER RESPONSE
      res.status(201).json({
         status: 'success',
         inserted_at: req.requestTime,
         data: newProcessedFarmersDoc
      });
      
      // next();

   } catch (_err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         error_msg: `That POST request failed. Check your JSON data payload. ${_err}`,
      });
   };
};


// REMOVE > DEPRC.
exports.updateProcessedFarmers = async (req, res, next) => {

	console.log(chalk.success(`Called the [ updateProcessedFarmers ] controller fn.`));

	const payload = req.body;

	try {
		// create a filter for the legacy AGC to update
		const updateFilter = { agc_id: req.body.agc_id };

		// create a document if no documents match the filter
		const updateOptions = { upsert: false };

		// create a document that updates the legacy farmers document
		const updateDoc = {
			$set: {
				farmers: req.body.farmers,
			},
		};

      // execute update
		const updateResult = await LEGACY_AGC_FARMERS_MODEL.updateOne(updateFilter, updateDoc, updateOptions);

		console.log (chalk.result(
			`${updateResult.matchedCount} document(s) matched the filter, updated ${updateResult.modifiedCount} document(s)`
		));
	} catch (updateLegacyFarmersErr) {
		console.log(chalk.fail(`${updateLegacyFarmersErr}`));
	}
};


// REMOVE > DEPRC.
exports.getProcessedLegacyAgcFarmers = async (req, res, next) => {
   
   console.log(chalk.success("SUCCESSFULLY CALLED THE [ getProcessedFarmers ] CONTROLLER FN. "));

   const docs = await getAllDocuments(req, LEGACY_AGC_FARMERS_MODEL);

   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: {
         collection_name: `processed-legacy-agc-farmers`,
         collection_docs: docs,
         docs_count: docs.length,
      },
   });
};


exports.insertProcessedLegacyAgc = async (req, res, next) => {
   insertOneDocument(req, res, PROCESSED_LEGACY_AGC_MODEL);
};


exports.getAllProcessedLegacyAgcs = async (req, res, next) => {
   
   console.log(chalk.success("SUCCESSFULLY CALLED THE [ getAllProcessedLegacyAgcs ] CONTROLLER FN. "));

   const processedLegacyAgcs = await getAllDocuments(req, PROCESSED_LEGACY_AGC_MODEL);

   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      num_docs: processedLegacyAgcs.length,
      data: {
         collection_name: `processed-legacy-agcs`,
         collection_docs: processedLegacyAgcs,
         docs_count: processedLegacyAgcs.length,
      },
   });
};


// TODO
exports.getAllFailedLegacyAgcs = async (req, res, next) => {
   // nothing here
};