// CONTAINS THE ROUTE HANDLING FUNCTIONS USED BY tour-routes.js



const TOUR_MODEL = require('./../models/tour-model');



// PARAM. MIDDLEWARE > VALIDATES THE ID FROM tour-route.js
exports.checkID = async (req, res, next, paramValue) => {

   try {

      // console.log(`The tour ID you are trying to validate is: ${req.params.id}`);
      // console.log(`The tour ID you are trying to validate is: ${paramValue}`);

      const databaseQuery = await TOUR_MODEL.findById(paramValue)

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



// PRE-FILL THE QUERY STRING FOR THE USER
// GET request: 127.0.0.1:9090/api/v1/tours/top5cheaptours
exports.aliasTopTours = (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = 'ratingsAverage,price';
   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
   next();
}



class APIFeatures {
   constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
   }
}



// GET ALL TOURS ROUTE HANDLER FN.
exports.getAllTours = async (request, response) => {
	try {
		console.log("THAT WAS THE TOURS HOMEPAGE.");
      console.log(request.query);

      // FILTER _EXAMPLE 1
      // GET TOURS DATA FROM DATABASE > 
      // const tours_data = await TOUR_MODEL.find(request.query);
		// const tours_data = await TOUR_MODEL.find({
		//    duration: 5,
		//    difficulty: 'easy'
		// })

      // FILTER _EXAMPLE 2
      // GET TOURS DATA FROM DATABASE > 
		// FILTER USING SPECIAL MONGOOSE METHODS
		// const tours_data = await TOUR_MODEL.find()
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
               let formatedQueryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // add the '$' sign to the operator
               
               console.log(`formatedQueryStr: ${formatedQueryStr}`);
               
               
         // BUILD THE QUERY
         // TOUR_MODEL.find() returns a Query obj., and you can chain more Query class mtds. (like .sort()) to it.
         let dbQuery = TOUR_MODEL.find(JSON.parse(formatedQueryStr)); 
         
         
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
            const numTours = await TOUR_MODEL.countDocuments();
            if( skippedResults >= numTours) {
               throw new Error('That number of pages does not exist..')
            }
         }


      // EXECUTE THE QUERY
      const tours_data_2 = await dbQuery


      // SEND RESPONSE
		response.status(200).json({
			status: "success",
			requested_at: request.requestTime, // using our the custom property from our custom middleware in server.js
			// num_tours: tours_data.length,
			num_tours: tours_data_2.length,
			data: {
            // tours: tours_data
				tours: tours_data_2,
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



// GET A SINGLE TOUR ROUTE HANDLER FN.
// GET request: 127.0.0.1:9090/api/v1/tours/5ef5d303f3aea23050903c56
exports.getTour = async (request, response) => {

   try {

      console.log(`Tihs is the request parameter: ${request.params.id}`);

      // search the tours collection for tour with id === req.params.id
      const searchedTour = await TOUR_MODEL.findById(request.params.id) // findById is a mongoose shorthand
      // const searchedTour = await TOUR_MODEL.findOne({ _id: req.params.id }) // same as above


      response.status(200).json({
         status: 'success',
         // data: searchedTour
         data: {
            tour: searchedTour
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



// UPDATE TOUR ROUTE HANDLER FN.
// patch request replaces only the fields that are different in teh body
exports.updateTour = async (request, response) => {

   try {

      const updatedTour = await TOUR_MODEL.findByIdAndUpdate(request.params.id, request.body, { 
         new: true, // return the modified document
         upsert: false, // creates the object if it doesn't exist
         runValidators: true
       })
      
      response.status(200).json({
         status: 'success', 
         data: {
            tour: updatedTour
         }
      })

   } catch (err) {
      response.status(404).json({
         staus: 'fail',
         message: 'That PATCH request failed.',
         eerror_msg: err.message

      })
   }
}



// DELETE TOUR ROUTE HANDLER FN.
exports.deleteTour = async (request, response) => {

   try {

      await TOUR_MODEL.findByIdAndDelete(requests.params.id)

      response.status(204).json({
         status: 'success',
         data: null
      })

   } catch(err) {
      response.status(404).json({
         staus: 'fail',
         message: "That DELETE request failed.",
         error_msg: err.message
      })
   };
}



// CREATE A TOUR (POST REQUEST) HANDLER FN.
exports.createTour = async (req, res) => {

   try {
      
      // CREATE NEW TOUR DOCUMENT _MTD 1
      // const newTour = new TOUR_MODEL(req.body)
      // newTour.save // returns a promise
      
      // CREATE A NEW TOUR DOCUMENT _MTD 2
      const newTour = await TOUR_MODEL.create(req.body) // "model.create" returns a promise

      res.status(201).json({
         status: 'success',
         data: {
            tour: newTour
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