"use-strict";

const path = require('path');
const express = require('express')
const EXPRESS_APP = express();
const Morgan = require('morgan'); // HTTP request logger
const BodyParser = require('body-parser'); // GET THE CONTENTS OF request.body
const compression = require('compression'); // server response compression
const cors = require('cors'); // this will allow other websites access the api
const AppError = require('./utils/app-error.js');
const globalErrorHandler = require('./controllers/error-controller.js');
const { _customHeaders } = require('./utils/helpers.js');



// APPEND THE APP BASE DIR. TO THE GLOBAL OBJ.
// Node HAS A GLOBAL NAMESPACE OBJECT CALLED "global"
// ANYTHING THAT YOU ATTACH TO THIS OBJ. WILL BE AVAIL. EVERYWHERE IN YOUR APP
global.__approotdir = __dirname;



// SET THE TEMPLATING ENGINE TO "PUG"
// PUG IS A WHTESPACE SENSITIVE SYNTAX FOR WRITING HTML
EXPRESS_APP.set('view engine', 'pug');
EXPRESS_APP.set('views', path.join(__dirname, 'views'));



// 3RD PARTY MIDDLEWARE > SERVE STATIC FILES
EXPRESS_APP.use(express.static(path.join(__dirname, 'public')));



// 3RD PARTY MIDDLEWARE > IMPLEMENT CORS
// THIS ADDS "Access-Control-Allow-Oriin" TO THE RESPONSE HEADER FOR THE SPECIFIED ORIGINS
EXPRESS_APP.use(cors({
   origin: 
      [
         "http://127.0.0.1:1010",
         "https://avgmap.herokuapp.com", 
         "https://avg-dashboard.herokuapp.com",
         // "https://google.com"
      ]
}));

// IF API IS @ api.natours.com; & FRONTEND IS @ natours.com
// TO ENABLE CORS FOR ONLY natours.com >
   // EXPRESS_APP.use(cors({
   //    origin: 'https://www.natours.com'
   // }))



// PRE-FLIGHT "OPTIONS" REQUEST RESPONSE(?)
EXPRESS_APP.options('*', cors()); // enable cors pre-flight requests for all routes

// EXPRESS_APP.options('/api/v1/parcelized-agcs/:id', cors()) // enable cors for complex requests (delete, patch, post) only on this specific route



// 3RD PARTY MIDDLEWARE > PARSE DATA FROM INCOMING REQUESTS
EXPRESS_APP.use(BodyParser.json({limit: '16mb'}))

// 3RD PARTY MIDDLEWARE > REQ. LOGGING
// perform logging only while in development mode..
if (process.env.NODE_ENV === 'development') {
   // console.log(highlight(`Our node environment is currently: ${process.env.NODE_ENV} `))
   EXPRESS_APP.use(Morgan('dev'))
};



// CUSTOM MIDDLEWRE EXAMPLE #1
// MW. IS PART OF THE REQ, RES CYCLE
// MUST BE DEFINED BEFORE ALL THE ROUTE HANDLERS (OR ROUTERS) BELOW
// OTHERWISE IT DOESN'T WORK because the routes WOULD terminte the req, res cycle BEFORE MW. RUNS
EXPRESS_APP.use((request, response, next) => {
   // console.log(allGood('Hello from the 1st (custom) middleware in app.js..'));
   next();
});



// CUSTOM MIDDLEWRE EXAMPLE #2
// MANIPULATE THE REQUEST OBJ. >> THIS ADDS A CUSTOM PROPERTY TO THE REQUEST OBJ.
EXPRESS_APP.use((request, response, next) => {
   request.requestTime = new Date().toISOString(); // add a new custom property ('requestTime') to the req. obj.
   next();
});



// SERVER RESPONSE COMPRESSION MIDDLEWARE FOR ALL TEXT SENT TO CLIENTS
EXPRESS_APP.use(compression());



// DISABLE DEFAULT HEADERS
EXPRESS_APP.use((req, res, next) => {
   return _customHeaders(EXPRESS_APP, req, res, next);
});



// LOAD THE ROUTERS
const parcelizedAgcsRouter = require('./routes/parcelized-agc-routes.js');
const agcsRouter = require('./routes/agc-routes.js');
const usersRouter = require('./routes/user-routes.js');
const viewRouter = require('./routes/view-routes.js');
const geoClustersRouter = require('./routes/geo-cluster-routes.js');
const geofilesRouter = require('./routes/geofile-routes.js');
const legacyAgcsRouter = require('./routes/legacy-agc-routes.js');
const pmroRouter = require('./routes/pmro-routes.js');



// MOUNTING THE ROUTERS
EXPRESS_APP.use('/', viewRouter);
EXPRESS_APP.use('/api/demo/', viewRouter);
EXPRESS_APP.use('/api/v1/agcs/', agcsRouter);
EXPRESS_APP.use('/api/v2/geo-clusters/', geoClustersRouter);
EXPRESS_APP.use('/api/v1/parcelized-agcs/', parcelizedAgcsRouter);
EXPRESS_APP.use('/api/v1/users/', usersRouter);
EXPRESS_APP.use('/api/v2/geofiles/', geofilesRouter);
EXPRESS_APP.use('/api/v2/legacy-agcs/', legacyAgcsRouter);
EXPRESS_APP.use(`/api/v2/pmros/`, pmroRouter);



// HANDLE ALL NON-EXISTING ROUTES
EXPRESS_APP.use('*', (req, res, next) => {

   res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server.`
   });

   // const err = new Error(`Can't find ${req.originalUrl} on this server.`);

   // // DEFINE CUSTOM PROPS. ON err
   // err.status = `fail`;
   // err.statusCode = 404;

   // // ANY ARG. PASSED TO next() IS ASSUMED BY EXPRESS TO BE AN ERROR.
   // next(err)

   // next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404))
});



// GLOBAL ERROR HANDLING M.WARE
EXPRESS_APP.use(globalErrorHandler);



//  ?????
EXPRESS_APP.use(express.urlencoded({ extended: true}));



module.exports = EXPRESS_APP;