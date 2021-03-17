const chalk = require('../../utils/chalk-messages')
const dbConnect = require('../../utils/db-connect.js')

const fs = require('fs')
const axios = require("axios");
const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
dotenv.config({path: '../../config.env'}) // CONFIGURE ENV. VARIABLES BEFORE CALL THE APP

const PARCELIZED_AGC_MODEL = require('../../models/parcelized-agc-model.js')
const AGC_MODEL = require('../../models/agc-model.js')




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

      const parcelizedAgcs = JSON.parse(fs.readFileSync('../parcelized-agcs/bulk-data/parcelized-agcs.geojson', 'utf-8'));
      // const parcelizedAgcs = JSON.parse(fs.readFileSync('../agcs/data/sample-agc.geojson', 'utf-8'));
   
      await dbConnect();
   
      // SAVE EACH PARCELIZED AGC TO DB
      parcelizedAgcs.forEach(async (agc, index) => {
            
         try {
               
            // await PARCELIZED_AGC_MODEL.create(agc)
            await AGC_MODEL.create(agc)
            console.log(chalk.success('The parcelized AGC data was successfully written to the ATLAS database'));

         } catch(err) {
            
            console.error(chalk.fail(err.message));

            if (index == parcelizedAgcs.length - 1) {
               process.exit();
            }
         }
      });
   
   } catch (_err) {
      console.error(chalk.fail(_err.message));
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
      readline.question(chalk.interaction(`Are you sure you want to delete this AGC: ${agcID}? [ y / yes / Y ]: `), async (answer) => {

         if (answer === 'y' || answer === 'yes' || answer === 'Y') {

            readline.question(chalk.interaction('Type the name of the collection you want to erase from: '), async (name) => {

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
// EXPLORE THE DATA IN THE PARCELIZED AGC COLLECTION
const exploreData = async () => {
	try {
		await dbConnect();
		const parcelizedGeoClusters = await PARCELIZED_AGC_MODEL.find();

		switch (process.argv[3]) {
			case `--props`:
				for (const geoCluster of parcelizedGeoClusters) {
					console.log(geoCluster.properties);
				}
				break;

			case `--props-ids`:
				for (const geoCluster of parcelizedGeoClusters) {
					console.log(geoCluster.properties.agc_id);
				}
				break;

			case `--props-ids-areas`:
				for (const geoCluster of parcelizedGeoClusters) {
					console.log(`${geoCluster.properties.agc_id} - ${(geoCluster.properties.agc_area).toFixed(2)} ha.`);
				}
				break;

			default:
				console.log(parcelizedGeoClusters);
				break;
		}

		console.log(
			chalk.highlight(`${parcelizedGeoClusters.length} PARCELIZED CLUSTERS `)
		);
	} catch (_err) {
		console.log(_err.message);
	}
	process.exit();
};



// RETURN & SAVE ALL THE PARCELIZED AGCS FROM THE DATABASE
async function returnAllParcelizedAgcs() {

	try {
      
      const axiosRequest = axios({
         method: 'get',
         url: `https://agcfarmlands.herokuapp.com/api/v1/parcelized-agcs/`,
         crossDomain: true,
         responseType: 'application/json',
         headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            // 'Authorization': ''
         },
         data: {

         }
      });


      // GET RESPONSE FROM API CALL
      const apiResponse = await axiosRequest
      const parcelizedAgcsData = JSON.stringify(apiResponse.data)
      const numAgcs = apiResponse.data.num_parcelized_agcs


      // CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
      let requestTimeStr = new Date( Date.parse(apiResponse.data.requested_at)).toISOString();
      requestTimeStr = requestTimeStr.replace(/:/g, ".");
      requestTimeStr = requestTimeStr.replace(/T/g, "-T");

      
      // WRITE RESULT TO NEW FILE
      fs.writeFile(`../data/parcelized-agcs/bulk-data/parcelized-agcs-${requestTimeStr}.geojson`, parcelizedAgcsData, (err, data) => {

         if(err) {
            console.log(chalk.error(err.message))
            process.exit();
         } else {
            console.log(chalk.success(`All the returned parcelized AGCs (${numAgcs}) were saved to file.. `));
            process.exit();
         }
      });
	}
	catch (error) {
		console.error(error.message);
	};
};



// A SIMPLE COMMAND LINE SCRIPT USING process.argv TO SELECTIVELY EXECUTE FUNCTIONS IN THIS FILE
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
   } else if (process.argv[2] === '--import--all') {
      returnAllParcelizedAgcs();
   }