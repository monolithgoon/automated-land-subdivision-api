const chalk = require('./chalk-messages.js')
const mongoose = require('mongoose') // MongoDB driver that facilitates connection to remote db



// REMOVE > THE ENVIROMENT VARS. HAVE ALREADY BEEN LOADED INTO process.env AFTER server.js RUNS
// const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
// dotenv.config({path: `C:/Users/Mummy Okpue/OneDrive/Documents/Web Development Projects/Mapping/agc-parcelization-api/config.env`}) // CONFIGURE ENV. VARIABLES
// dotenv.config({path: '../config.env'}) // CONFIGURE ENV. VARIABLES
// console.log(`${__dirname}config.env`)
// console.log(dotenv.config({path: `./config.env`}))



// CONNECT TO THE REMOTE ATLAS DB
async function dbConnect() {
   
   try {
      
      console.log(chalk.working('Connecting to the remote MongoDB Atlas DB...'));

      const database = process.env.ATLAS_DB_STRING.replace('<PASSWORD>', process.env.ATLAS_DB_PASSWORD) // REPLACE THE PLACEHOLDER TEXT IN THE CONNECTION STRING
   
      mongoose.connect(database, {
         // handle mongoDB deprecation warnings
         // useNewUrlParser: true,
         // useCreateIndex: true,
         // useFindAndModify: false,
         useUnifiedTopology: true
      })
      .then(connectionObject => {
         // console.log((connectionObject))
         console.log(chalk.connected('YOU CONNECTED TO THE ATLAS DATABASE SUCCESSFULLY '));
         return connectionObject;
      })
      .catch(_err => {
         console.log(chalk.fail(`ERROR CONNECTING TO THE REMOTE DATABASE. CHECK YOUR INTERNET CONNECTION. `))
         console.log(chalk.fail(`${_err.message}`))
         process.exit();
      });
   
   } catch(_err) {
      console.log(chalk.fail(_err.message));
      process.exit();
   } 
}



module.exports = dbConnect;