// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY agc-routes.js
const chalk = require('../utils/chalk-messages');
const { _getNextPayload } = require('../utils/utils.js')
const AGC_MODEL = require('../models/agc-model.js')
const LEGACY_AGC_MODEL = require('../models/legacy-agc-model.js');
const LEGACY_AGC_FARMERS_MODEL = require('../models/legacy-agc-farmers-model.js');
const catchAsyncError = require('../utils/catch-async');



// CHECK THAT THE agc_id IS VALID BEFORE RUNNING getAgc()
// FIXME < COMPLETE THIS FN. 
exports.checkID = async (req, res, next) => {

   next();
}



// GET A SINGLE AGC
exports.getAgc = async (req, res) => {

   try {

		console.log(chalk.success("YOU SUCCESSFULLY CALLED THE getAgc CONTROLLER FN. "));

      // EXTRACT THE agc_id FROM THE QUERY OBJ.
      let queryObj = { ...req.query }
      const queryObjKey = Object.keys(queryObj);

      // RE-BUILD THE QUERY OBJ.
      queryObj = {
         "properties.agc_id" : queryObjKey[0]
      }

      // CONDUCT THE DB QUERY
      console.log(queryObj);
      const dbQuery = AGC_MODEL.find(queryObj)

      const agc = await dbQuery
      console.log(agc);
      
      res.status(200).json({
         status: 'success',
         // The query using 'agc_id' returns an array with only one element; deal with it..
         agcData: agc[0]
      })
      
   } catch (err) {
      console.log(chankError(err));
   }
}



// GET A SINGLE LEGACY AGC
exports.getLegacyAgc = async (req, res) => {
   try {
      
		console.log(chalk.success("YOU SUCCESSFULLY CALLED THE getLegacyAgc CONTROLLER FN. "));

      // EXTRACT THE agc_id FROM THE QUERY OBJ.
      let queryObj = { ...req.query }
      const queryObjKey = Object.keys(queryObj);

      // RE-BUILD THE QUERY OBJ.
      queryObj = {
         "properties.agc_id" : queryObjKey[0]
      }

      // CONDUCT THE DB QUERY
      console.log(queryObj);
      const dbQuery = LEGACY_AGC_MODEL.find(queryObj)

      const agc = await dbQuery
      console.log(agc);
      
      res.status(200).json({
         status: 'success',
         // The query using 'agc_id' returns an array with only one element; deal with it..
         agcData: agc[0]
      })
      
   } catch (getLegacyAgcsErr) {
      console.error(chalk.fail(getLegacyAgcErr.message))
   }
};



// GET ALL AGCS ROUTE HANDLER FN.
exports.getAllAgcs = async (request, response) => {

	try {

		console.log(chalk.success("YOU SUCCESSFULLY CALLED THE getAllAgcs CONTROLLER FN. "));

      // FILTER _EXAMPLE 1
      // GET TOURS DATA FROM DATABASE > 
      // const tours_data = await AGC_MODEL.find(request.query);
		// const tours_data = await AGC_MODEL.find({
		//    duration: 5,
		//    difficulty: 'easy'
		// })

      // FILTER _EXAMPLE 2
      // GET TOURS DATA FROM DATABASE > 
		// FILTER USING SPECIAL MONGOOSE METHODS
		// const tours_data = await AGC_MODEL.find()
		// 	.where("duration")
		// 	.equals(3)
		// 	.where("difficult")
      //    .equals("easy")
      //    .where('price')
      //    .lt(500); // less than

      
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
               
               console.log(`formattedQueryStr: ${formattedQueryStr}`);
               
               
         // BUILD THE QUERY
         // AGC_MODEL.find() returns a Query obj., and you can chain more Query class mtds. (like .sort()) to it.
         let dbQuery = AGC_MODEL.find(JSON.parse(formattedQueryStr)); 
         

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
         // GET request: 127.0.0.1:9090/api/v1/tours?fields=name,price,ratingsAverage,summary
         if (request.query.fields) {
            const fields = request.query.fields.split(',').join(' ');
            dbQuery = dbQuery.select(fields) // mongoose format > .select('name price ratingsAverage')
         } else {
            dbQuery = dbQuery.select('-__v') // exclude the "__v" field (use the "-")
         }


         // 5. PAGINATION
         // GET request: 127.0.0.1:9090/api/v1/tours?limit=3&page=2
         // 1-10 => page 1, 11-20 => page 2, 21-30 => page 3
         const page = request.query.page * 1 || 1; // page num. (default > page 1)
         const limit = request.query.limit * 1 || 100; // num. results per page (default > 100)
         const skippedResults = (page - 1) * limit; // num. results to skip 
         dbQuery = dbQuery.skip(skippedResults).limit(limit)

         // DONT SKIP IF ...
         if (request.query.page) {
            const numParceledAgcs = await AGC_MODEL.countDocuments();
            if( skippedResults >= numParceledAgcs) {
               throw new Error('That number of pages does not exist..')
            }
         }


      // EXECUTE THE QUERY
      const returnedAgcData = await dbQuery


      // SEND RESPONSE
		response.status(200).json({
			status: "success",
			requested_at: request.requestTime, // using the custom property from our custom middleware in app.js
			num_agcs: returnedAgcData.length,
		   agcs: returnedAgcData,
      })
      
	} catch (err) {
		console.log(err);
		response.status(404).json({
			// 400 => bad request
			status: "fail",
			message: err,
			console_message: "That GET request failed.",
		});
	}
};



// 
exports.getAllLegacyAgcs = async (request, response, next) => {
	try {

		console.log(chalk.success("YOU SUCCESSFULLY CALLED THE getAllLegacyAgcs CONTROLLER FN. "));
      
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
               
               console.log(`formattedQueryStr: ${formattedQueryStr}`);
               
               
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
            console.log(chalk.highlight(fields))
            dbQuery = dbQuery.select(fields) // mongoose format > .select('name price ratingsAverage')
         } else {
            dbQuery = dbQuery.select('-__v') // exclude the "__v" field (use the "-")
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
            if( skippedResults >= numLegacyAgcs) {
               throw new Error('That number of pages does not exist..')
            }
         }


      // EXECUTE THE QUERY
      const returnedLegacyAgcData = await dbQuery


      // COMPUTE THE NUMBER OF FEATURES PER. GEO-CLUSTER
      const featsLengths = [];
      returnedLegacyAgcData.forEach(geoCluster => {
         console.log(geoCluster);
         if (geoCluster.properties.geo_cluster_total_features) {
            featsLengths.push(geoCluster.properties.geo_cluster_total_features)
         };
      })
      let totalFeatures = featsLengths.reduce((sum, numFeats) => sum + numFeats);


      // SEND RESPONSE
      response.status(200).json({
			status: "success",
			requested_at: request.requestTime, // using the custom property from our custom middleware in app.js
			num_legacy_agcs: returnedLegacyAgcData.length,
         num_plot_owners: totalFeatures,
		   legacy_agcs: returnedLegacyAgcData,
      })
      
	} catch (err) {
		console.log(err);
		response.status(404).json({
			// 400 => bad request
			status: "fail",
			message: err,
			console_message: "That GET request failed.",
		});
	}
}



// CREATE/INSERT A NEW AGC (POST REQUEST) HANDLER FN.
exports.insertAgc = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE insertAgc CONTROLLER FN. `))
   
   // GET PAYLOAD FROM PREV. M.WARE. (res.locals.appendedGeojson) VS. API CALL PARAM (req.body)
   const agcPayload = _getNextPayload(res.locals.appendedGeojson, req.body);
   
   console.log(agcPayload);

   try {
      
      // CREATE A NEW AGC DOCUMENT _MTD 1
      // const newAgc = new AGC_MODEL(req.body)
      // newAgc.save // returns a promise
      
      // CREATE A NEW AGC DOCUMENT _MTD 2
      // const newAgc = await AGC_MODEL.create(req.body) // "model.create" returns a promise
      const newAgc = await AGC_MODEL.create(agcPayload) // "model.create" returns a promise

      // SERVER RESPONSE
      res.status(201).json({
         status: 'success',
         inserted_at: req.requestTime,
         data: newAgc
         // agcData: {
         //    agc: newAgc
         // }
      });
      
      // next();

   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed. Check your JSON data payload.',
         error_msg: err.message,
      });
   }
};



// 
exports.insertLegacyAgc = async (req, res, next) => {
	console.log(chalk.success(`CALLED THE insertLegacyAgc CONTROLLER FN. `))
   
   const legacyAgcPayload = req.body;
   
   console.log(legacyAgcPayload);

   try {
      
      // CREATE A NEW AGC DOCUMENT _MTD 1
      // const newLegacyAgc = new AGC_MODEL(req.body)
      // newLegacyAgc.save // returns a promise
      
      // CREATE A NEW AGC DOCUMENT _MTD 2
      // const newLegacyAgc = await AGC_MODEL.create(req.body) // "model.create" returns a promise
      const newLegacyAgc = await LEGACY_AGC_MODEL.create(legacyAgcPayload) // "model.create" returns a promise

      // SERVER RESPONSE
      res.status(201).json({
         status: 'success',
         inserted_at: req.requestTime,
         data: newLegacyAgc
         // agcData: {
         //    agc: newLegacyAgc
         // }
      });
      
      // next();

   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed. Check your JSON data payload.',
         error_msg: err.message,
      });
   }
}



// INSERT FARMERS WHOSE BVNs HAVE BEEN VALIDATED
exports.insertProcessedFarmers = async (req, res, next) => {
	console.log(chalk.success(`CALLED THE insertProcessedFarmers CONTROLLER FN. `))
   
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
   }
}



//
exports.insertProcessedLegacyAgc = async (req, res, next) => {
}



// TODO
exports.getAllFailedLegacyAgcs = async (req, res, next) => {

}