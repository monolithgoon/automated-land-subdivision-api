const PARCELIZED_AGC_MODEL = require('../models/parcelized-agc-model.js')
const catchAsync = require('../utils/catch-async.js') // TODO < 




// PARAM. MIDDLEWARE > VALIDATES THE ID FROM parcelized-agc-routes.js
exports.checkID = async (req, res, next, paramValue) => {

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



exports.renderParcelizedAgc = async (req, res) => {

   try {
      
      const parcelizedAgc = await PARCELIZED_AGC_MODEL.findById(req.params.id);
      console.log(parcelizedAgc)

      res.status(200).render('agc-render', {
         title: "Rendered AGC Farm Plots",
         parcelizedAgcData: parcelizedAgc
      })

   } catch (err) {
      console.error(err.message);
   }
}