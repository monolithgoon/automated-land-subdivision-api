// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY farm-parcels-routes.js



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
            message: 'That was an invalid ID, you absolute cuck.'
         })
      }
      
      next();
   }
   
   catch (err) {
      console.log(err);
   };
}




// REMOVE > REQUEST BODY VALIDATION MIDDLEWARE
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

		console.log("YOU SUCCESSFULLY CALLED THE NIRSAL PARCELIZED AGCs API");
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
            const numParceledAgcs = await PARCELIZED_AGC_MODEL.countDocuments();
            if( skippedResults >= numParceledAgcs) {
               throw new Error('That number of pages does not exist..')
            }
         }


      // EXECUTE THE QUERY
      const parceledAgcData = await dbQuery


      // SEND RESPONSE
		response.status(200).json({
			status: "success",
			requested_at: request.requestTime, // using our the custom property from our custom middleware in server.js
			num_parcelized_agcs: parceledAgcData.length,
			data: {
				parcelized_agcs: parceledAgcData,
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
// GET request: 127.0.0.1:9090/api/v1/parceled-agcs/5ef5d303f3aea23050903c56
exports.getParcelizedAgc = async (request, response) => {

   try {

      console.log(`Tihs is the request parameter: ${request.params.id}`);

      // search the agcs collection for agc with id === req.params.id
      const searchedFarmParcel = await PARCELIZED_AGC_MODEL.findById(request.params.id) // findById is a mongoose shorthand
      // const searchedFarmParcel = await PARCELIZED_AGC_MODEL.findOne({ _id: req.params.id }) // same as above


      response.status(200).json({
         status: 'success',
         // data: searchedFarmParcel
         data: {
            agc: searchedFarmParcel
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



// CREATE/INSERT A NEW PARCELIZED AGC (POST REQUEST) HANDLER FN.
exports.insertParcelizedAgc = async (req, res) => {

   try {
      
      // CREATE A NEW PARCELIZED AGC DOCUMENT _MTD 1
      // const newAgc = new TOUR_MODEL(req.body)
      // newAgc.save // returns a promise
      
      // CREATE A NEW TOUR DOCUMENT _MTD 2
      const newAgc = await PARCELIZED_AGC_MODEL.create(req.body) // "model.create" returns a promise

      res.status(201).json({
         status: 'success',
         data: {
            tour: newAgc
         }
      })
      
   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed.',
         error_msg: err.message,
      })
   }
}