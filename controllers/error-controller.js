// GLOBAL ERROR HANDLING M.WARE
module.exports = ((err, req, res, next) => {

   // DEFINE A BASE ERROR STATUS CODE > 500: INT. SERVER ERR.
   err.statusCode = err.statusCode || 500;
   err.status = err.status || `error`;

   res.status(err.statusCode).json({
      status: err.status,
      message: err.message
   });

   // next();
});