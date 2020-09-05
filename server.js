const chalk = require('chalk');
const allGood = chalk.white.bgBlue.bold

const Mongoose = require('mongoose') // MongoDB driver that facilitates connection to remote db
const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
dotenv.config({path: './config.env'}) // IMPORTANT > CONFIGURE ENV. VARIABLES BEFORE U CALL THE APP 
const EXPRESS_APP = require('./app.js')




// ENVIRONMENT VARIABLES
console.log(process.env.SESSION_USER); // NODE environment variables
console.log(process.env.SESSION_PASSWORD); // NODE environment variables
console.log(EXPRESS_APP.get('env')); // express environment variables




// CONNECT TO THE REMOTE DB
try {
   const database = process.env.ATLAS_DB_STRING.replace('<PASSWORD>', process.env.ATLAS_DB_PASSOWRD) // REPLACE THE PLACEHOLDER TEXT IN THE CONNECTION STRING

   Mongoose.connect(database, {
   // handle deprecation warnings
   useNewUrlParser: true,
   useCreateIndex: true,
   useFindAndModify: false,
   useUnifiedTopology: true
})
   .then(connectionObject => {
      // console.log((connectionObject))
      console.log(allGood('YOU CONNECTED TO THE REMOTE ATLAS DATABASE SUCCESSFULLY  '));
   })

} catch(err) {
   console.log(err.message);
}




// START THE SERVER
const port = process.env.PORT || 8080
EXPRESS_APP.listen(port, () => {
   console.log(`Express is running server.js on ${port}`)
})