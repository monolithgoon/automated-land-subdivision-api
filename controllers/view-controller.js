const PARCELIZED_AGC_MODEL = require('../models/parcelized-agc-model.js')
const catchAsync = require('../utils/catch-async.js') // TODO < 




// this fn. looks in the "views" folder for the "overview" template && renders it to the browser
exports.renderAllParcelizedAgcs = async (req, res, next) => {

   try {

      // 1. GET ALL THE PARCELIZED AGCS DATA FROM THE ATLAS DB
      const parcelizedAgcs = await PARCELIZED_AGC_MODEL.find();

      // 2 BUILD TEMPLATE

      // 3. RENDER THAT TEMPLATE USING DATA FROM 1.)
      console.log(parcelizedAgcs);
      res.status(200).render('overview', {
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
   const parcelizedAgcs = await PARCELIZED_AGC_MODEL.find();
   res.status(200).render('agc-render', {
      title: "Rendered AGC Farm Plots",
      parcelizedAgcsData: parcelizedAgcs
   })
}