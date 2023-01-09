const chalk = require('./utils/chalk-messages');
const dbConnect = require('./utils/db-connect.js')
const EXPRESS_APP = require('./app.js')
const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
dotenv.config({path: './default.env'}) // IMPORTANT > CONFIGURE ENV. VARIABLES BEFORE U CALL THE APP 




// ENVIRONMENT VARIABLES
console.log(process.env.SESSION_USER); // NODE environment variables
console.log(process.env.SESSION_PASSWORD); // NODE environment variables
console.log(EXPRESS_APP.get('env')); // express environment variables




// CONNECT TO THE REMOTE DB
dbConnect();




// START THE SERVER
const port = process.env.PORT || 8080
EXPRESS_APP.listen(port, () => {
   console.log(chalk.running(`EXPRESS IS RUNNING server.js ON PORT: ${port} `))
});