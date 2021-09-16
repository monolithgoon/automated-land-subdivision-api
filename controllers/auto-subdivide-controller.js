const turf = require('@turf/turf');
const chalk = require('../utils/chalk-messages.js');
const cloudinary = require("cloudinary").v2;
const { PARCELIZE_SHAPEFILE } = require('../utils/auto-parcelize/chunkify-moving-frames.js');


// AUTO-SUBDIVIDE / AUTO-PARCELIZATION LOGIC FN.
// async function parcelize(agc, dirCombo) { // FIXME > THIS SHOULDN'T BE AN ASYNC FN.
function parcelize(agc, dirCombo) {
   
   try {
      
      // INIT. PARCELIZATION VARIABLES
      const selectedShapefile = agc

      const farmers_data = agc.properties.farmers;
      // console.log(chalk.highlight(farmers_data))
      
      // GET THE FARM HA. ALLOCATIONS
      const farmerAllocations = [];
      agc.properties.farmers.forEach(farmer=>farmerAllocations.push(farmer.allocation));
   
      const dirOptionsMap = {
         se: { katanaSliceDirection: "south", chunkifyDirection: "east" },
         sw: { katanaSliceDirection: "south", chunkifyDirection: "west" },
         ne: { katanaSliceDirection: "north", chunkifyDirection: "east" },
         nw: { katanaSliceDirection: "north", chunkifyDirection: "west" },
         es: { katanaSliceDirection: "east", chunkifyDirection: "south" },
         en: { katanaSliceDirection: "east", chunkifyDirection: "north" },
         ws: { katanaSliceDirection: "west", chunkifyDirection: "south" },
         wn: { katanaSliceDirection: "west", chunkifyDirection: "north" },
      }
      const dirOptionsArray = [
         { katanaSliceDirection: "south", chunkifyDirection: "east" },
         { katanaSliceDirection: "south", chunkifyDirection: "west" },
         { katanaSliceDirection: "north", chunkifyDirection: "east" },
         { katanaSliceDirection: "north", chunkifyDirection: "west" },
         { katanaSliceDirection: "east", chunkifyDirection: "south" },
         { katanaSliceDirection: "east", chunkifyDirection: "north" },
         { katanaSliceDirection: "west", chunkifyDirection: "south" },
         { katanaSliceDirection: "west", chunkifyDirection: "north" },
      ]
      // for (let idx = 0; idx < dirOptionsArray.length; idx++) {
      //    const directionsObj = dirOptionsArray[idx];
      //    const parcelizedAgcGeojson = await PARCELIZE_SHAPEFILE(selectedShapefile, farmerAllocations, agcID, agcLocation, directionsObj)
      //    if (parcelizedAgcGeojson) {
      //       await saveToFile(parcelizedAgcGeojson, agcID, idx);
      //    }
      // }

      // GET CHUNKIFY DIRECTIONS
      // const dirComboConfigObj = dirOptionsMap.wn;
      // const dirComboConfigObj = dirOptionsMap.ws;
      // const dirComboConfigObj = dirOptionsMap.sw;
      const dirComboConfigObj = dirOptionsMap[dirCombo];

      // PARCELIZE
      const parcelizedShapefile = PARCELIZE_SHAPEFILE(selectedShapefile, farmers_data, dirComboConfigObj);

      return parcelizedShapefile;

   } catch (err) {
      console.log(chalk.fail(err.message));
   }
};



// UPLOAD IMAGE TO CLOUD
async function cloudinaryBase64Upload(geoCluster) {

   const UPLOAD_URL_MAPS = [];

	// CONFIG
	cloudinary.config({
		cloud_name: "dmvx8fnuz",
		api_key: "476581483278117",
		api_secret: "yIptwJZ4ahB36DNXebOI_UsXUTM",
		secure: true,
	});
   
   try {

      const geoClusterId = geoCluster.properties.agc_id;
      const plotsAdmins = geoCluster.properties.farmers;

      if (plotsAdmins) {

         for (let idx = 0; idx < plotsAdmins.length; idx++) {
         
            const plotAdmin = plotsAdmins[idx];
            const plotAdminId = plotAdmin.farmer_id;
            const base64ImageStr = plotAdmin.farmer_photo;

            // UPLOAD OPTIONS
            uploadOptions = {
               public_id: plotAdminId,
               folder: `/nirsal/parcelized-agcs/farmer-photos/${geoClusterId}/`,
               use_filename: true,
               unique_filename: false,
            };
            
            // UPLOAD BASE64 IMAGE URI TO EXISTING OR RECURSIVELY CREATED FOLDER
            if (JSON.stringify(base64ImageStr) !== `[""]`) {

               await cloudinary.uploader.upload(`data:image/jpg;base64,${base64ImageStr}`, uploadOptions,
                  function (cloudUploadErr, cloudUploadResult) {
                     if (cloudUploadErr) {
                        console.warn(chalk.fail(cloudUploadErr.message));
                     } else {
                        console.log(chalk.highlight(cloudUploadResult.secure_url));
                        // console.log(chalk.console(JSON.stringify(cloudUploadResult)));
                        // waitForAllUploads("pizza", cloudUploadErr, cloudUploadResult);
                        plotAdmin.farmer_photo_url = cloudUploadResult.secure_url;
                     };
                  }
               );

            } else {
               plotAdmin.farmer_photo_url = undefined;
               console.error(chalk.warning(`This PLOT OWNER ${farmer.first_name} ${farmer.last_name} does not have a base64ImageStr..`))
            };
         };

         return geoCluster;   
      };
   } catch (savePhotosErr) {
     console.error(chalk.fail(`savePhotosErr: ${savePhotosErr.message}`));
   };
};      



// PARCELIZE THE NEW AGC GEO-FILE AND INSERT INTO DB.
exports.subdivideGeofile = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ parcelizeAGCGeofile ] CONTROLLER FN. `))

   try {

      const agcPayload = res.locals.appendedGeofileGeoJSON;

      console.log((agcPayload.properties));

      // SANDBOX > SAVE THE PLOT ADMIN PHOTOS
      await cloudinaryBase64Upload(agcPayload);
      
      // PARCELIZE THE NEW AGC

      // const parcelizedGeofile = await parcelize(res.locals.appendedGeofileGeoJSON); // IMPORTANT < DON'T USE await HERE < 
      let parcelizedGeofile;

      const directionsArray = [ 'nw', 'ne', 'sw', 'se', 'es', 'en', 'ws', 'wn' ];
      
      for (const dirCombo of directionsArray) {

         console.log(chalk.warning(`trying: ${dirCombo} dir. combo.`));

         parcelizedGeofile = parcelize(agcPayload, dirCombo);
         
         if (parcelizedGeofile) {
            if (parcelizedGeofile.properties.parcelization_metadata.land_parity_ok) {
               break;
            };
         };
      };

      // PASS PARCELIZED AGC TO insertParcelizedAgc M.WARE.
      if (parcelizedGeofile) {

         res.locals.parcelizedGeofile = parcelizedGeofile;

         next();
         
         // REMOVE > DEPRECATED > NOW PASSING parcelizedGeofile TO NEXT M.WARE 
         // const insertedAgc = await PARCELIZED_AGC_MODEL.create(parcelizedGeofile) // "model.create" returns a promise

         // if (insertedAgc) {
         //    // SERVER RESPONSE
         //    res.status(201).json({
         //       status: 'success',
         //       // status: 'This file [ ${req.file.originalname} ] was successfully uploaded, converted to GeoJSON, parcelized & saved to the database.',
         //       inserted_at: req.requestTime,
         //       data: insertedAgc
         //    })
         // }

      } else {
         throw new Error(`THIS PARCELIZATION ATTEMPT OF [ ${req.file.originalname} ] WAS NOT SUCCESSFUL. RECALIBRATING ALGO. & RE-TRYING WITH DIFF. PARAM. SET.`)
      };

   } catch (_err) {
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: `[ ${req.file.originalname} ] was successfully uploaded to the server, converted to a GeoJSON polygon, and updated with the farmer allocations JSON.`,
         error_msg: _err.message,
      });
   }
};



// PARCELIZE THE GEO-CLUSTER GEOJSON AND INSERT INTO DB.
exports.subdivideGeoClusterGJ = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ subdivideGeoClusterGJ ] CONTROLLER FN. `))

   let agcPayload = res.locals.appendedClusterGeoJSON;

   console.log((agcPayload.properties));

   // SANDBOX > SAVE THE PLOT ADMIN PHOTOS
   agcPayload = await cloudinaryBase64Upload(agcPayload);

   try {
      
      let parcelizedGeoCluster;
      
      const directionsArray = [ 'nw', 'ne', 'sw', 'se', 'es', 'en', 'ws', 'wn' ];
      
      for (const dirCombo of directionsArray) {
         console.log(chalk.warning(`trying: ${dirCombo} `))
         // PARCELIZE THE GEO CLUSTER
         parcelizedGeoCluster = parcelize(agcPayload, dirCombo); 
         // CONFIM THE SUB-DIVISION WENT OK
         if (parcelizedGeoCluster) {
            if (parcelizedGeoCluster.properties.parcelization_metadata.land_parity_ok) {
               break;
            };
         };
      };

      // PASS PARCELIZED AGC TO insertParcelizedAgc M.WARE.
      if (parcelizedGeoCluster) {

         res.locals.parcelizedGeoCluster = parcelizedGeoCluster;

         next();
         
      } else {
         throw new Error(`THIS PARCELIZATION ATTEMPT OF THE GEO-CLUSTER FAILED. RECALIBRATING ALGO. & RE-TRYING WITH DIFF. PARAM. SET. QUERY THE API WITH THE agc_id FOR THE PARCELIZATION RESULT LATER.`)
      };

   } catch (_err) {
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: `The Geo-cluster GeoJSON was successfully uploaded. Parcelization failed. Contact auto-parcelization service Admin.`,
         error_msg: _err.message,
      });
   };
};