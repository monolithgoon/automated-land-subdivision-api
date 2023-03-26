const chalk = require('./utils/chalk-messages');
const dbConnect = require('./utils/db-connect.js')
const EXPRESS_APP = require('./app.js')
// const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
// dotenv.config({path: './default.env'}) // IMPORTANT > CONFIGURE ENV. VARIABLES BEFORE YOU START THE APP 
const APP_CONFIG = require("./config/index.js");

// CONNECT TO THE REMOTE DB
dbConnect();


// START THE SERVER
// const port = process.env.PORT || 9443
EXPRESS_APP.listen(APP_CONFIG.port, () => {
   console.log(chalk.running(`EXPRESS IS RUNNING server.js ON PORT: ${APP_CONFIG.port} `))
});