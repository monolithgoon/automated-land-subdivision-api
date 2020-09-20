const chalk = require('chalk')
const success = chalk.white.bgGreen.bold
const allGood = chalk.white.bgBlue.bold;
const highlight = chalk.white.bgYellow.bold
const error = chalk.white.bgRed.bold
const fs = require('fs')
const Mongoose = require('mongoose') // MongoDB driver that facilitates connection to remote db
const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
dotenv.config({path: '../config.env'}) // CONFIGURE ENV. VARIABLES BEFORE CALL THE APP

const AGC_MODEL = require('../models/agc-model.js')




// CONNECT TO THE REMOTE ATLAS DB
async function dbConnect() {
   try {
      console.log('Connecting to the remote Atlas DB...');

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
         console.log(allGood('YOU CONNECTED TO THE ATLAS DATABASE SUCCESSFULLY '));
      })
   
   } catch(err) {
      console.log(err.message);
   }
}



// EXPORT DATA INTO THE REMOTE DB
const exportData = async (agcFileName) => {

   // READ THE JSON FILE
   const agcs = JSON.parse(fs.readFileSync('./kuje-fct-agcs.geojson', 'utf-8'));
   // const agcs = JSON.parse(fs.readFileSync(`./${agcFileName}.geojson', 'utf-8`));
   
   try {
      await dbConnect();
      await AGC_MODEL.create(agcs)
      console.log(success('The AGC data was successfully written to the ATLAS database'));
   } catch(err) {
      console.error(error(err.message));
   }
   process.exit() // end the NODE process
}



// A SIMPLE COMMAND LINE SCRIPT USING process.argv TO SELECTIVELY EXECUTE FUNCTIONS IN THIS FILE
// EXECUTE IT BY TYPING: node export-fs-data-to-db.js --export/delete

   // if (process.argv[2] === '--export') {
   if (process.argv[2] === '--export') {
      exportData(process.argv[3])
   
   } else if (process.argv[2] === '--explore') {
      exploreData();
   
   } else if (process.argv[2] === '--wipe') {
      deleteData()
   }
