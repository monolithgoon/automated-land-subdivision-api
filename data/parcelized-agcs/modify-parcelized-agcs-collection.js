const chalk = require('../../utils/chalk-messages')
const dbConnect = require('../../utils/db-connect.js')

const fs = require('fs')
const Mongoose = require('mongoose') // MongoDB driver that facilitates connection to remote db
const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
dotenv.config({path: '../../config.env'}) // CONFIGURE ENV. VARIABLES BEFORE CALL THE APP

const PARCELIZED_AGC_MODEL = require('../../models/parcelized-agc-model.js')




// CONNECT TO THE REMOTE ATLAS DB
// async function dbConnect() {
//    try {
//       console.log(chalk.working('Connecting to the remote Atlas DB...'));

//       const database = process.env.ATLAS_DB_STRING.replace('<PASSWORD>', process.env.ATLAS_DB_PASSOWRD) // REPLACE THE PLACEHOLDER TEXT IN THE CONNECTION STRING
   
//       Mongoose.connect(database, {
//       // handle deprecation warnings
//       useNewUrlParser: true,
//       useCreateIndex: true,
//       useFindAndModify: false,
//       useUnifiedTopology: true
//    })
//       .then(connectionObject => {
//          // console.log((connectionObject))
//          console.log(chalk.connected('YOU CONNECTED TO THE ATLAS DATABASE SUCCESSFULLY '));
//       })
   
//    } catch(err) {
//       console.log(err.message);
//    }
// }



// DELETE ALL DATA FROM PARCELIZED AGCS COLLECTION
const wipeParcelizedAgcCollection = async () => {
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
                  console.log(chalk.highlight('The parcelized AGCs collection was successfully wiped from the ATLAS database'));
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
const exportAgcs = async () => {

   try {

      const parcelizedAgcs = JSON.parse(fs.readFileSync('./data/bulk-data/parcelized-agcs.geojson', 'utf-8'));
   
      await dbConnect();
   
      // SAVE EACH PARCELIZED AGC TO DB
      parcelizedAgcs.forEach(async (agc) => {
            
         try {
               
            await PARCELIZED_AGC_MODEL.create(agc)
            console.log(chalk.success('The parcelized AGC data was successfully written to the ATLAS database'));
   
         } catch(err) {
            
            console.error(chalk.fail(err.message));
         }
      });
   
      // (async function() {
      //    await process.exit() // end the NODE process
      // })(); 

   } catch (err) {
      console.error(chalk.fail(err.message));
   }
};



const exportAgc = async (agcFileName) => {
   // const parcelizedAgc = JSON.parse(fs.readFileSync(`./${agcFileName}.geojson', 'utf-8`));
}



// DELETE ONE PARCELIZED AGC
const deleteAgc = async (agcID) => {

   try {
      
      // INIT A 'readline' INTERFACE
      const readline = require('readline').createInterface({
         input: process.stdin,
         output: process.stdout
      });
   
      // CLOSE THE USER PROMPT & END THE PROCESS
      const endInteraction = () => {
         console.log(chalk.warning('Exiting interaction.. '));
         readline.close();
         process.exit();
      }
   
      // INITIATE USER INTERACTION
      readline.question(chalk.waiting(`Are you sure you want to delete this AGC: ${agcID}? [ y / yes / Y ]: `), async (answer) => {

         if (answer === 'y' || answer === 'yes' || answer === 'Y') {

            readline.question(chalk.waiting('Type the name of the collection you want to erase from: '), async (name) => {

               if (name === 'parcelized-agcs' || name === 'PARCELIZED-AGCS' || 'pagcs') {

                  // CONNECT TO THE DB..
                  await dbConnect();

                  // CHECK IF THAT PARTICULAR AGC ID EXISTS                  
                  // if (await PARCELIZED_AGC_MODEL.count({'properties.agc_id': agcID}, limit = 1) !==0) {
                  if (await PARCELIZED_AGC_MODEL.countDocuments({'properties.agc_id': agcID}) !==0) {

                     // DELETE THE DOCUMENT THAT PARTICULAR AGC ID
                     await PARCELIZED_AGC_MODEL.deleteOne({"properties.agc_id": agcID}, (err, daa) => {

                        if (!err) {

                           console.log(chalk.success(`The AGC ${agcID} was successfully deleted from the ATLAS database `));
                           endInteraction();

                        } else {

                           console.log(chalk.fail(`Something went wrong with the delete operation.. `));
                           endInteraction();
                        }
                     });
                     
                  } else {

                     console.log(chalk.warning(`That AGC ID does not belong to any AGC in the database `));
                     endInteraction();
                  }
                                    
               } else {
                  endInteraction();
               }
            })
         } else {
            endInteraction();
         }
      });

   } catch (err) {

      console.error(chalk.fail(err.message));
      
   }
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
      exportAgcs()
   
   } else if (process.argv[2] === '--export' && process.argv[3]) {
      exportAgc(process.argv[3])
      
   } else if (process.argv[2] === '--explore') {
      exploreData();
   
   } else if (process.argv[2] === '--wipe') {
      wipeParcelizedAgcCollection()
   } else if (process.argv[2] === '--delete' && process.argv[3]) {
      deleteAgc(process.argv[3])
   }