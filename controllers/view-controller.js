const PARCELIZED_AGC_MODEL = require('../models/parcelized-agc-model.js')
const catchAsync = require('../utils/catch-async.js') // TODO < 
const chalk = require('chalk')
const chalkError = chalk.white.bgRed.bold




// PARAM. MIDDLEWARE > VALIDATES THE ID FROM parcelized-agc-routes.js
exports.checkDatabaseID = async (req, res, next, paramValue) => {

   try {

      console.log(`The AGC ID you are trying to validate is: ${req.params.id}`);
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




// this fn. looks in the "views" folder for the "overview" template && renders it to the browser
exports.renderAllParcelizedAgcs = async (req, res) => {

   try {

      // 1. GET ALL THE PARCELIZED AGCS DATA FROM THE ATLAS DB
      const parcelizedAgcs = await PARCELIZED_AGC_MODEL.find();

      // 2 BUILD TEMPLATE

      // 3. RENDER THAT TEMPLATE USING DATA FROM 1.)
      console.log(parcelizedAgcs);
      res.status(200).render('agcs-overview', {
         // THIS DATA IS PASSED TO THE .pug TEMPLATE
         // THESE VARIABLES ARE CALLED "LOCALS" WHEN USED IN THE .pug FILE
         // THE PROCESS OF USING THEM IN THE .pug FILE IS CALLED INTERPOLATION
         title: "Parcelized AGCs: Test Batch 1",
         user: "Phillip Moss",
         parcelizedAgcsData: parcelizedAgcs
      });

   } catch (err) {

      console.log(err.message);
   }
}



// DB QUERY USING QUERY OBJECT
// http://127.0.0.1:9090/parcelized-agc?AGC-UNIQUE-AGC-ID-XXX-XXX-XXX
exports.renderParcelizedAgc = async (req, res) => {

   try {
      
      // DB QUERY OBJECT
      let queryObj = { ...req.query }
      
      // IDEALLY, THE QUERY OBJECT IS SUPPOSED TO BE:
      // http://127.0.0.1:9090/parcelized-agc?properties.agc_id=AGC-UNIQUE-AGC-ID-XXX-XXX-XXX
      // THE QUERY OBJ. IS NOW IN THE FORM { UNIQUE-AGC-ID-XXX-XXX-XXX: " " }
      
      // EXTRACT THE agc_id FROM THE QUERY OBJ.
      const queryObjKey = Object.keys(queryObj);


      // const formattedAgcID = queryObjKey[0].toUpperCase();

      
      // RE-BUILD THE QUERY OBJ.
      queryObj = {
         "properties.agc_id" : queryObjKey[0]
         // "properties.agc_id" : formattedAgcID
      }
      

      // let queryStr = JSON.stringify(queryObj)
      // const formattedQueryStr = queryStr.replace()


      // CONDUCT DB QUERY
      // let dbQuery = PARCELIZED_AGC_MODEL.find(JSON.parse(formattedQueryStr))
      let dbQuery = PARCELIZED_AGC_MODEL.find(queryObj)


      const parcelizedAgc = await dbQuery
      console.log(parcelizedAgc);


      // SET DEFAULT TITLE IF AGC DOES NOT HAVE A LOCATION
      // The query using 'agc_id' returns an array with only one element; deal with it..
      const pageTitle = parcelizedAgc[0].properties.location ? `AGC Plots | ${parcelizedAgc[0].properties.location}` : 'Parcelized AGC'


      res.status(200).render('agc-render', {
         title: pageTitle,
         parcelizedAgcData: parcelizedAgc[0]
      })

   } catch (err) {
      console.error(chalkError(err.message));
   }
}



// DB QUERY USING THE MONGO DB "_id" PARAM
exports.renderParcelizedAgcByID = async (req, res) => {

   try {

      // CONDUCT THE DB QUERY
      const parcelizedAgc = await PARCELIZED_AGC_MODEL.findById(req.params.id);


      // SET DEFAULT TITLE IF AGC DOES NOT HAVE A LOCATION
      const pageTitle = parcelizedAgc.properties.location ? `AGC Plots | ${parcelizedAgc.properties.location}` : 'Parcelized AGC'


      res.status(200).render('agc-render', {
         title: pageTitle,
         parcelizedAgcData: parcelizedAgc
      })

   } catch (err) {
      console.error(err.message);
   }
}