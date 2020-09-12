const fs = require('fs')
const Mongoose = require('mongoose') // MongoDB driver that facilitates connection to remote db
const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
dotenv.config({path: '../config.env'}) // CONFIGURE ENV. VARIABLES BEFORE CALL THE APP

const PARCELIZED_AGC_MODEL = require('../models/parcelized-agc-model.js')

const chalk = require('chalk')
const success = chalk.white.bgGreen.bold
const allGood = chalk.white.bgBlue.bold;
const highlight = chalk.white.bgYellow.bold
const error = chalk.white.bgRed.bold




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



// DELETE ALL DATA FROM PARCELIZED AGCS COLLECTION
const deleteData = async () => {
   try {
      
      // close the user prompt & end the process
      const endInteraction = () => {
         console.log('Exiting interaction..');
         readline.close();
         process.exit();
      }
      
      // init a readline interface
      const readline = require('readline').createInterface({
         input: process.stdin,
         output: process.stdout
      });
      
      // INITIATE USER INTERACTION
      readline.question('Are you sure you want to wipe the parcelized AGCs collection? [ y / yes / Y ]: ', async (answer) => {
         if (answer === 'y' || answer === 'yes' || answer === 'Y') {
            readline.question('Type the name of the collection you want to erase: ', async (name) => {
               if (name === 'parcelized_agcs') {
                  await dbConnect();
                  await PARCELIZED_AGC_MODEL.deleteMany();
                  console.log(highlight('The parcelized AGCs collection was successfully wiped from the ATLAS database'));
                  endInteraction();
               } else {
                  endInteraction();
               }
            })
         } else {
            endInteraction();
         }
      });

   } catch(err) {
      console.log(err.message);
      console.error(err.message)
   }
}



// READ THE JSON FILE
const exportData = async (agcFileName) => {
   
   const parcelizedAgcs = JSON.parse(fs.readFileSync('./parcelized-agcs.geojson', 'utf-8'));
   // const parcelizedAgcs = JSON.parse(fs.readFileSync(`./${agcFileName}.geojson', 'utf-8`));

   await dbConnect();

   parcelizedAgcs.forEach(async (agc) => {
         
      try {
            
         await PARCELIZED_AGC_MODEL.create(parcelizedAgcs)
         console.log(success('The parcelized AGC data was successfully written to the ATLAS database'));

      } catch(err) {
         
         console.error(error(err.message));
      }
   });

   // (async function() {
   //    await process.exit() // end the NODE process
   // })();
   
};



// EXPLORE THE DATA IN THE PARCELIZED AGC COLLECTION
const exploreData = async () => {
   try {
      await dbConnect();
      const parcelizedAgcs = await PARCELIZED_AGC_MODEL.find()
      console.log(parcelizedAgcs);
   } catch(err) {
      console.log(err.message);
   }
   process.exit();
}



// A SIMPLE COMMAND LINE SCRIPT USING process.argv TO SELECTIVELY EXECUTE FUNCTIONS IN THIS FILE
// EXECUTE IT BY TYPING: node export-fs-data-to-db.js --export/delete
// console.log(process.argv);

   // if (process.argv[2] === '--export') {
   if (process.argv[2] === '--export') {
      exportData(process.argv[3])
   
   } else if (process.argv[2] === '--explore') {
      exploreData();
   
   } else if (process.argv[2] === '--wipe') {
      deleteData()
   }
