const chalk = require('../../utils/chalk-messages')
const dbConnect = require('../../utils/db-connect.js')

const fs = require('fs')
const axios = require("axios");
const dotenv = require('dotenv') // read the data from the config file. and use them as env. variables in NODE
dotenv.config({path: '../../default.env'}) // CONFIGURE ENV. VARIABLES BEFORE CALL THE APP

const AGC_MODEL = require('../../models/agc-model.js')
const PARCELIZED_AGC_MODEL = require('../../models/parcelized-agc-model.js')
const LEGACY_AGC_MODEL = require('../../models/legacy-agc-model.js')
const PROCESSED_LEGACY_AGC_MODEL = require('../../models/processed-legacy-agc-model.js')

const { findOneDocument } = require('../../controllers/handler-factory.js')




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



// TODO
const exportAgc = async (agcFileName) => {
   // const parcelizedAgc = JSON.parse(fs.readFileSync(`./${agcFileName}.geojson', 'utf-8`));
};



// DELETE ONE PARCELIZED AGC
const deleteOneAGC = async (docId) => {

   // CONNECT TO THE DB..
   await dbConnect();
   
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
      };
         
         // INITIATE USER INTERACTION
         readline.question(chalk.interaction(`Are you sure you want to delete this AGC: ${docId}? [ y / yes / Y ]: `), async (answer) => {
   
            if (answer === 'y' || answer === 'yes' || answer === 'Y') {
   
               readline.question(chalk.interaction('Type the name of the collection you want to erase from: '), async (name) => {
   
                  let dbModel, mongoQueryObj;

                  switch (true) {
                     
                     case name === 'agcs' || name === 'AGCS':
                        dbModel = AGC_MODEL;
                        mongoQueryObj = {'properties.agc_id': docId};
                        break;

                     case name === 'parcelized-agcs' || name === 'PARCELIZED-AGCS' || name === 'pagcs':
                        dbModel = PARCELIZED_AGC_MODEL;
                        mongoQueryObj = {'properties.agc_id': docId};
                        break;

                     case name === 'legacy-agcs' || name === 'LEGACY-AGCS' || name === 'lagcs' || name === 'LAGCS':
                        dbModel = LEGACY_AGC_MODEL;
                        mongoQueryObj = {'properties.geo_cluster_id': docId};
                        break;
                  
                     case name === 'processed-legacy-agcs' || name === 'PROCESSED-LEGACY-AGCS' || name === 'proclagcs' || name === 'PROCLAGCS':
                        dbModel = PROCESSED_LEGACY_AGC_MODEL;
                        mongoQueryObj = {'properties.legacy_agc_id': docId};
                        break;
                  
                     default:
                        endInteraction();
                        break;
                  };
                        
                  // CHECK IF THAT PARTICULAR AGC ID EXISTS                  
                  if (await findOneDocument(dbModel, mongoQueryObj)) {

                     // DELETE THE DOCUMENT THAT PARTICULAR AGC ID
                     await dbModel.deleteOne(mongoQueryObj, (err, data) => {

                        if (!err) {

                           console.log(chalk.success(`The AGC ${docId} was successfully deleted from the ${name} db. collection `));
                           endInteraction();

                        } else {

                           console.log(chalk.fail(`Something went wrong with the delete operation.. `));
                           endInteraction();
                        }
                     });
                     
                  } else {
                     console.log(chalk.warning(`That AGC ID does not belong to any AGC in the ${name} db. collection `));
                     endInteraction();
                  };                                       
               });

            } else {
               endInteraction();
            };
         });

   } catch (deleteOneAGCErr) {
      console.error(chalk.fail(deleteOneAGCErr.message));
      process.exit();
   };
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
         url: `https://geoclusters.herokuapp.com/api/v1/parcelized-agcs/`,
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
      fs.writeFile(`../parcelized-agcs/bulk-data/parcelized-agcs-${requestTimeStr}.geojson`, parcelizedAgcsData, (err, data) => {

         if(err) {
            console.log(chalk.fail(err.message))
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
      deleteOneAGC(process.argv[3]) // agcId
   } else if (process.argv[2] === '--import--all') {
      returnAllParcelizedAgcs();
   }