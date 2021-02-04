// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY parcelized-agc-routes.js

const chalk = require('../utils/chalk-messages.js')
const catchAsyncError = require('../utils/catch-async.js')
const { _getNextPayload } = require('../utils/utils.js');
const PARCELIZED_AGC_MODEL = require('../models/parcelized-agc-model.js')



// PARAM. MIDDLEWARE > VALIDATES THE ID FROM parcelized-agc-routes.js
exports.checkID = async (req, res, next, paramValue) => {

   try {

      // console.log(`The AGC ID you are trying to validate is: ${req.params.id}`);
      // console.log(`The AGC ID you are trying to validate is: ${paramValue}`);

      const databaseQuery = await PARCELIZED_AGC_MODEL.findById(paramValue)

      if (!databaseQuery) {
         return res.status(404).json({
            status: 'failed',
            message: 'A document with that MongoDB ID does not exist in the collection.'
         })
      }
      
      next();
   }
   
   catch (err) {
      console.log(err);
   };
}




// REMOVE > REQUEST BODY VALIDATION MIDDLEWARE < VALIDATION CURRENTLY HAPPENING IN THE MODEL .. 
exports.checkBody = (req, res, next) => {

   // console.table(req.body)
   
   // if (!req.body.name || !req.body.price) {
   //    return res.status(400).json({
   //       status: 'failed',
   //       message: 'Missing tour name and/or price.'
   //    })
   // }
   next(); // move on to the next middleware, ie., createTour
}



// VALIDATE THE RESULT OF THE DATABASE QUERY
function validateQuery(queryResult, response) {
   // ensure the query is valid
   if (!queryResult) {
      return response.status(404).json({
         status: 'failed',
         message: 'That was an invalid ID.'
      })
   }
}



// GET ALL FARM PARCELS ROUTE HANDLER FN.
exports.getAllParcelizedAgcs = async (request, response) => {

	try {

		console.log(chalk.success("YOU SUCCESSFULLY CALLED THE [ getAllParcelizedAgcs ] CONTROLLER"));
      console.log(request.query);

      // FILTER _EXAMPLE 1
      // GET TOURS DATA FROM DATABASE > 
      // const tours_data = await PARCELIZED_AGC_MODEL.find(request.query);
		// const tours_data = await PARCELIZED_AGC_MODEL.find({
		//    duration: 5,
		//    difficulty: 'easy'
		// })

      // FILTER _EXAMPLE 2
      // GET TOURS DATA FROM DATABASE > 
		// FILTER USING SPECIAL MONGOOSE METHODS
		// const tours_data = await PARCELIZED_AGC_MODEL.find()
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
         // PARCELIZED_AGC_MODEL.find() returns a Query obj., and you can chain more Query class mtds. (like .sort()) to it.
         let dbQuery = PARCELIZED_AGC_MODEL.find(JSON.parse(formattedQueryStr)); 
         
         
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
            const numParcelizedAgcs = await PARCELIZED_AGC_MODEL.countDocuments();
            if( skippedResults >= numParcelizedAgcs) {
               throw new Error('That number of pages does not exist..')
            }
         }


      // EXECUTE THE QUERY
      const returnedAgcData = await dbQuery


      // SEND RESPONSE
		response.status(200).json({
			status: "success",
			requested_at: request.requestTime, // using the custom property from our custom middleware in app.js
			num_parcelized_agcs: returnedAgcData.length,
			data: {
				parcelized_agcs: returnedAgcData,
			},
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



// GET A SINGLE FARM PARCEL - ROUTE HANDLER FN.
// GET request: 127.0.0.1:9090/api/v1/parcelized-agcs/5ef5d303f3aea23050903c56
exports.renderParcelizedAgcByID = async (request, response) => {

   try {

      console.log(`This is the request parameter: ${request.params.id}`);

      // search the agcs collection for agc with id === req.params.id
      const retreivedAgc = await PARCELIZED_AGC_MODEL.findById(request.params.id) // findById is a mongoose shorthand
      // const retreivedAgc = await PARCELIZED_AGC_MODEL.findOne({ _id: req.params.id }) // same as above


      response.status(200).json({
         status: 'success',
         // data: retreivedAgc
         data: {
            agc: retreivedAgc
         }
      })

   } catch (err) {
      response.status(404).json({
         staus: 'fail',
         message: 'That GET request failed.',
         error_msg: err
      })
   }
}



// DB QUERY USING QUERY OBJECT
// http://127.0.0.1:9090/parcelized-agcs/parcelized-agc?UNIQUE-AGC-ID-XXX-XXX
exports.getParcelizedAgc = async (req, res, next) => {

   console.log(chalk.success(`YOU SUCCESSFULLY CALLED THE [ getParcelizedAgc ] FN. `))

   try {
      
      // DB QUERY OBJECT
      let queryObj = { ...req.query }
      
      // IDEALLY, THE QUERY OBJECT IS SUPPOSED TO BE:
      // http://127.0.0.1:9090/parcelized-agcs/parcelized-agc?properties.agc_id=UNIQUE-AGC-ID-XXX-XXX
      // BUT NOW, THE QUERY OBJ. IS NOW IN THE FORM { UNIQUE-AGC-ID-XXX-XXX: " " }
      
      // EXTRACT THE agc_id FROM THE QUERY OBJ.
      const queryObjKey = Object.keys(queryObj);


      // const formattedAgcID = queryObjKey[0].toUpperCase();

      
      // RE-BUILD THE QUERY OBJ.
      queryObj = {
         "properties.agc_id" : queryObjKey[0]
         // "properties.agc_id" : formattedAgcID
      }
      

      // CHECK IF A MATCHING RECORD EXISTS IN THE DB.
      if (await PARCELIZED_AGC_MODEL.countDocuments(queryObj) !==0 ) {


         // CONDUCT THE DB QUERY
         let dbQuery = PARCELIZED_AGC_MODEL.find(queryObj)


         // SAVE THE RESULTS OF THE QUERY
         const parcelizedAgc = await dbQuery
         console.log(parcelizedAgc);

         
         // SEND SUCCESS HEADER
         res.status(200).json({
            status: 'success',
            data: {
               // The query using 'agc_id' returns an array with only one element; deal with it..
               parcelizedAgcData: parcelizedAgc[0]
            }
         })

      } else {

         // NO PARCELIZED AGC WITH THAT ID EXISTS IN THE DB.
         res.status(404).json({
            message: `AGC ${queryObjKey[0]} does not exist in the parcelized AGCs database..`
         });
      };

   } catch (_err) {
      console.error(chalkError(_err.message));
   }
}



// CREATE/INSERT A NEW PARCELIZED AGC (POST REQUEST) HANDLER FN.
exports.insertParcelizedAgc = async (req, res) => {

   try {

      // GET PAYLOAD FROM PREV. M.WARE. (res.locals.appendedGeojson) VS. API CALL PARAM (req.body)
      const parcelizedAgcPayload = _getNextPayload(res.locals.parcelizedAgc, req.body);
      
      // CREATE A NEW PARCELIZED AGC DOCUMENT _MTD 1
      // const newAgc = new TOUR_MODEL(req.body)
      // newAgc.save // returns a promise
      
      // CREATE A NEW PARCELIZED AGC DOCUMENT _MTD 2
      // const newParcelizedAgc = await PARCELIZED_AGC_MODEL.create(req.body) // "model.create" returns a promise
      const newParcelizedAgc = await PARCELIZED_AGC_MODEL.create(parcelizedAgcPayload) // "model.create" returns a promise > resolve with "await"

      res.status(201).json({
         status: 'success',
         message: `[ ${req.file.originalname} ] was successfully uploaded to the server, converted to a GeoJSON polygon, updated with the farmer allocations JSON, parcelized, and inserted into the database.`,
         inserted_at: req.requestTime,
         data: {
            parcelizedAgc: newParcelizedAgc
         }
      });
      
   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         // message: 'That POST request failed.',
         message: `[ ${req.file.originalname} ] was successfully uploaded to the server, converted to a GeoJSON polygon, updated with the farmer allocations JSON, and parcelized.`,
         error_msg: `Failed to insert the parcelized AGC into the database. ${err.message}`,
      })
   }
};


// .. insertParcelizedAgc USING GLOBAL catchAsyncError HANDLER
// exports.insertParcelizedAgc = catchAsyncError(async (req, res, next) => {
   
//    // GET PAYLOAD FROM PREV. M.WARE. (res.locals.appendedGeojson) VS. API CALL PARAM (req.body)
//    const parcelizedAgcPayload = _getNextPayload(res.locals.parcelizedAgc, req.body);
   
//    // CREATE A NEW PARCELIZED AGC DOCUMENT _MTD 2
//    // const newParcelizedAgc = await PARCELIZED_AGC_MODEL.create(req.body) // "model.create" returns a promise
//    const newParcelizedAgc = await PARCELIZED_AGC_MODEL.create(parcelizedAgcPayload) // "model.create" returns a promise > resolve with "await"

//    res.status(201).json({
//       status: 'success',
//       message: `$[ {req.file.originalname} ] was successfully uploaded to the server, converted to a GeoJSON polygon, and parcelized.`,
//       inserted_at: req.requestTime,
//       data: {
//          parcelizedAgc: newParcelizedAgc
//       }
//    })   
// });