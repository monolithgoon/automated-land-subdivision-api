const Express = require('express')
const EXPRESS_APP = Express()
const Morgan = require('morgan'); // HTTP request logger
const BodyParser = require('body-parser'); // GET THE CONTENTS OF request.body
const compression = require('compression'); // server response compression
const cors = require('cors'); // this will allow other websites access the api

// REMOVE > NOT WORKING ON HEROKU 
// const chalk = require('chalk');
// const error = chalk.bold.red
// const warning = chalk.keyword('orange');
// const allGood = chalk.bold.green;
// const highlight = chalk.white.bgBlue.bold




// 3RD PARTY MIDDLEWARE > IMPLEMENT CORS
// THIS ADDS "Access-cControl-Allow-Oriin *" TO THE RESPONSE HEADER
EXPRESS_APP.use(cors());
// IF API IS @ api.natours.com; & FRONTEND IS @ natours.com
// TO ENABLE CORS FOR ONLY natours.com >
   // EXPRESS_APP.use(cors({
   //    origin: 'https://www.natours.com'
   // }))

// PRE-FLIGHT "OPTIONS" REQUEST RESPONSE(?)
EXPRESS_APP.options('*', cors()); // enable cors pre-flight requests for all routes
// EXPRESS_APP.options('/api/v1/parcelized-agcs/:id', cors()) // enable cors for complex requests (delete, patch, post) only on this specific route


// 3RD PARTY MIDDLEWARE
// EXPRESS_APP.use(Express.static(`${__dirname}/client/public`)) // serve static files


// 3RD PARTY MIDDLEWARE
EXPRESS_APP.use(BodyParser.json())

// 3RD PARTY MIDDLEWARE > REQ. LOGGING
// perform logging only while in development mode..
if (process.env.NODE_ENV === 'development') {
   // console.log(highlight(`Our node environment is currently: ${process.env.NODE_ENV} `))
   EXPRESS_APP.use(Morgan('dev'))
}




// CUSTOM MIDDLEWRE EXAMPLE #1
// MW. IS PART OF THE REQ, RES CYCLE
// MUST BE DEFINED BEFORE ALL THE ROUTE HANDLERS (OR ROUTERS) BELOW
// OTHERWISE IT DOESN'T WORK because the routes WOULD terminte the req, res cycle BEFORE MW. RUNS
EXPRESS_APP.use((request, response, next) => {
   // console.log(allGood('Hello from the 1st (custom) middleware in app.js..'));
   next();
})




// CUSTOM MIDDLEWRE EXAMPLE #2
// MANIPULATE THE REQUEST OBJ.
EXPRESS_APP.use((request, response, next) => {
   request.requestTime = new Date().toISOString(); // add a new custom property to the req. obj.
   next();
});




// SERVER RESPONSE COMPRESSION MIDDLEWARE FOR ALL TEXT SENT TO CLIENTS
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