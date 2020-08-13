const Express = require('express')
const EXPRESS_APP = Express()

const Morgan = require('morgan'); // HTTP request logger
const BodyParser = require('body-parser'); // GET THE CONTENTS OF request.body

const chalk = require('chalk');
const compression = require('compression'); // server response compression




// 3RD PARTY MIDDLEWARE
// EXPRESS_APP.use(Express.static(`${__dirname}/client/public`)) // serve static files

// 3RD PARTY MIDDLEWARE
EXPRESS_APP.use(BodyParser.json())

// 3RD PARTY MIDDLEWARE > REQ. LOGGING
// perform logging only while in development mode..
if (process.env.NODE_ENV === 'development') {
   console.log(chalk.blue.bgWhite.bold(`Our node environment is currently: ${process.env.NODE_ENV} `))
   EXPRESS_APP.use(Morgan('dev'))
}




// CUSTOM MIDDLEWRE EXAMPLE #1
// MW. IS PART OF THE REQ, RES CYCLE
// MUST BE DEFINED BEFORE ALL THE ROUTE HANDLERS (OR ROUTERS) BELOW
// OTHERWISE IT DOESN'T WORK because the routes WOULD terminte the req, res cycle BEFORE MW. RUNS
EXPRESS_APP.use((request, response, next) => {
   console.log('Hello from the 1st (custom) middleware in app.js..');
   next();
})




// CUSTOM MIDDLEWRE EXAMPLE #2
// MANIPULATE THE REQUEST OBJ.
EXPRESS_APP.use((request, response, next) => {
   request.requestTime = new Date().toISOString(); // add a new custom property to the req. obj.
   next();
});




// ADD SERVER RESPONSE COMPRESSION MIDDLEWARE FOR ALL TEXT SENT TO CLIENTS
EXPRESS_APP.use(compression())




// REMOVE > 
// LOAD THE ROUTES
// const TOURS_ROUTE = require('./routes/tour-routes.js')
// const USERS_ROUTE = require('./routes/user-routes.js')

// LOAD THE ROUTES
const PARCELIZED_AGC_ROUTES = require('./routes/parcelized-agc-routes.js');




// REMOVE > 
// MOUNTING THE ROUTER
// EXPRESS_APP.use('/', TOURS_ROUTE)
// EXPRESS_APP.use('/api/v1/tours', TOURS_ROUTE)
// EXPRESS_APP.use('/api/v1/users', USERS_ROUTE)

// MOUNTING THE ROUTER
EXPRESS_APP.use('/', PARCELIZED_AGC_ROUTES);
EXPRESS_APP.use('/api/v1/parcelized-agcs', PARCELIZED_AGC_ROUTES);




module.exports = EXPRESS_APP