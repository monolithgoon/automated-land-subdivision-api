const PMRO_MODEL = require(`../models/pmro-model.js`);
const chalk = require(`../utils/chalk-messages.js`);


const getAllDocuments = async function (request, model) {

   // extract only db filters from the request query string object
   const queryObj = { ...request.query }; // make a copy of the request query string object
   const excludedFields = ['page', 'sort', 'limit', 'fields']; 
   excludedFields.forEach(el => delete queryObj[el]); // exclude those fields from the query obj.

   // RE-FORMAT A QUERY STRING TO MONGODB FILTER FORMAT
   // GET request: 127.0.0.1:9443/api/v1/tours?difficulty=easy&price[lte]=500
   // { difficulty: 'easy', price: { lte: 500} } // mongoDB filter query string obj. from above GET req.
   let queryStr = JSON.stringify(queryObj);
   let formattedQueryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // add the '$' sign to the operator

   // BUILD THE QUERY
   // model.find() returns a Query obj., and you can chain more Query class mtds. (like .sort()) to it.
   let dbQuery = model.find(JSON.parse(formattedQueryStr)); 

   console.log(chalk.working(`Waiting for DB. response .. `))

   // 3. SORTING
   // GET request: 127.0.0.1:9443/api/v1/tours?difficulty=hard&sort=price,ratingsQuantity => ascending
   // GET request: 127.0.0.1:9443/api/v1/tours?difficulty=hard&sort=-price,-ratingsQuantity => descending
   if (request.query.sort) { // check if the query string obj. has a sort property
      const sortByCriteria = request.query.sort.split(',').join(' ');
      dbQuery = dbQuery.sort(sortByCriteria) // mongoose format > .sort('price ratingsQuality')
   } else {
      dbQuery = dbQuery.sort('-createdAt');
   };

   // 4. LIMIT FIELDS IN EACH RESULT (aka: "PROJECTING")
   // GET request: http://127.0.0.1:9443/api/v1/tours?fields=name,price,ratingsAverage,summary
   if (request.query.fields) {
      const fields = request.query.fields.split(',').join(' ');
      dbQuery = dbQuery.select(fields) // mongoose format > .select('name price ratingsAverage')
   } else {
      dbQuery = dbQuery.select('-__v') // exclude the MongoDB "__v" field (use the "-")
   };

   // 5. PAGINATION
   // GET request: 127.0.0.1:9443/api/v1/tours?limit=3&page=2
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
      const numDocuments = await model.countDocuments();
      if (skippedResults >= numDocuments) {
         throw new Error(`That page [ page: ${page} ] does not exist..`);
      };
   };

   // EXECUTE THE QUERY
   const retreivedDocs = await dbQuery;

   return retreivedDocs;
};


exports.getAllPMROs = async (req, res, next) => {

   const pmros = await getAllDocuments(req, PMRO_MODEL);

   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: {
         collection_name: `pmros`,
         docs_count: pmros.length,
      },
   });
};


exports.insertPMRO = async (req, res, next) => {
   
   const pmroPayload = req.body;
   
   console.log(pmroPayload);

   try {
            
      // CREATE A NEW DOCUMENT
      const newPMRO = await PMRO_MODEL.create(pmroPayload) // "model.create" returns a promise

      // SERVER RESPONSE
      res.status(201).json({
         status: 'success',
         inserted_at: req.requestTime,
         data: newPMRO,
      });
      
   } catch (err) { 
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed. Check your JSON data payload.',
         error_msg: err.message,
      });
   };
};