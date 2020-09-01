// looks in the "views" folder for the "base" template && renders it to the browser
exports.renderParcelizedAgcs = (req, res) => {
   res.status(200).render('base', {
      // THIS DATA IS PASSED TO THE PUG TEMPLATE
      // THESE VARIABLES ARE CALLED "LOCALS" IN THE PUG FILE
      // THE PROCESS OF USING THEM IN THE .pug FILE IS CALLED INTERPOLATION
      title: "Parcelized AGCs: Test Batch 1",
      user: "Phillip Moss"
   });
}



exports.renderParcelizedAgc = (req, res) => {
   res.status(200).render('agc-render', {
      title: "Rendered AGC Farm Plots"
   })
}