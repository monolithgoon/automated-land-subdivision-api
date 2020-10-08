// THIS MODULE REPLACES THE try / catch BLOCK IN AN ASYNC FUNCTION

// fn IS ASYNC. FUNCITON WHICH USED TO HAVE A try / catch BLOCK
function catchAsyncError(fn) {

   // RETURN AN ANNONYMOUS FN. THAT EXPRESS IS GOING TO CALL FOR THE PARTICULAR RESOURCE
   return function (request, response, next) {

      // CALL | EXECUTE "fn"
      // THE ASYNC FUNCTION THIS IS WRAPPED AROUND RETURNS A PROMISE IF THERE IS AN ERROR
      // THAT ERROR IS PASSED VIA "next(err)" TO THE GLOBAL ERROR HANDLNG FN. IN error-controller.js
      fn(request, response, next).catch(err => {
         err.statusCode = 400
         // err.message = `Server resource request failed.`
         next(err)
      }) 
      // fn(request, response, next).catch(next) // SAME AS ABOVE
   };
};

module.exports = catchAsyncError