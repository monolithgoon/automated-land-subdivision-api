const chalk = require('../utils/chalk-messages.js');
const cloudinary = require("cloudinary").v2;
const { PARCELIZE_SHAPEFILE } = require('../utils/auto-parcelize/chunkify-moving-frames.js');
const { _generateRandomString } = require('../utils/auto-parcelize/_utils.js');


// AUTO-SUBDIVIDE / AUTO-PARCELIZATION LOGIC FN.
function autoParcelizeGJ(agc) {
   
   try {
      
      // INIT. PARCELIZATION VARIABLES
      const selectedShapefile = agc;
      
      // REMOVE 
      // GET THE PLOT OWNER ALLOCATIONS
      const farmerAllocations = [];
      agc.properties.farmers.forEach(farmer=>farmerAllocations.push(farmer.allocation));
      
      // GET THE PLOT OWNER ALLOCATIONS
      const PLOT_OWNERS_DATA = agc.properties.farmers;
      
      const dirOptionsArray = [
         { katanaSliceDirection: "south", chunkifyDirection: "east" },
         { katanaSliceDirection: "south", chunkifyDirection: "west" },
         { katanaSliceDirection: "north", chunkifyDirection: "east" },
         { katanaSliceDirection: "north", chunkifyDirection: "west" },
         { katanaSliceDirection: "east", chunkifyDirection: "south" },
         { katanaSliceDirection: "east", chunkifyDirection: "north" },
         { katanaSliceDirection: "west", chunkifyDirection: "south" },
         { katanaSliceDirection: "west", chunkifyDirection: "north" },
      ];

      for (let idx = 0; idx < dirOptionsArray.length; idx++) {

         const directionsObj = dirOptionsArray[idx];
         
         console.log(chalk.interaction(`trying: ${JSON.stringify(directionsObj)} dir. combo.`));

         const parcelizedClusterGJ = PARCELIZE_SHAPEFILE(selectedShapefile, PLOT_OWNERS_DATA, directionsObj)

         if (parcelizedClusterGJ) {

            if (parcelizedClusterGJ.properties.parcelization_metadata.land_parity_ok) {

               // GET A PREVIEW MAP URL HASH
               parcelizedClusterGJ.properties["preview_map_url_hash"] = _generateRandomString();
               
               console.log({parcelizedClusterGJ});

               return parcelizedClusterGJ;
            };
         };
      };

   } catch (autoParcelizeErr) {
      console.log(chalk.fail(`autoParcelizeErr: ${autoParcelizeErr.message}`));
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

                        //IMPORTANT > UPDATE THE farmer_photo_url FIELD
                        plotAdmin.farmer_photo_url = cloudUploadResult.secure_url;
                     };
                  }
               );

            } else {
               plotAdmin.farmer_photo_url = undefined;
               console.error(chalk.warning(`This PLOT OWNER ${plotAdminId} does not have a base64ImageStr..`))
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

      let clusterGJPayload = res.locals.appendedGeofileGeoJSON;

      console.log((clusterGJPayload.properties));

      // SAVE THE PLOT ADMIN PHOTOS
      clusterGJPayload = await cloudinaryBase64Upload(clusterGJPayload);
      
      // AUTO-PARCELIZE THE CLUSTER
      const parcelizedGeofile = autoParcelizeGJ(clusterGJPayload);

      // PASS PARCELIZED AGC TO insertParcelizedAgc M.WARE.
      if (parcelizedGeofile) {

         res.locals.parcelizedGeofile = parcelizedGeofile;

         next();
         
      } else {
         throw new Error(`The auto-parcelization of [ ${req.file.originalname} ] is taking longer than usual. In 30 minutes, query the parcelized clusters API endpoint using the agc_id to retreive the parcelization result. If this fails, the polyon derived from the geo-file might have holes, and therefore cannot be parcelized.`)
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

   let clusterGJPayload = res.locals.appendedClusterGeoJSON;

   console.log((clusterGJPayload.properties));

   // SAVE THE PLOT ADMIN PHOTOS TO CLOUD
   clusterGJPayload = await cloudinaryBase64Upload(clusterGJPayload);

   // TODO > GENERATE URL HASH HERE

   try {
      
      // AUTO-PARCELIZE THE CLUSTER
      const parcelizedGeoCluster = autoParcelizeGJ(clusterGJPayload);

      // PASS PARCELIZED AGC TO insertParcelizedAgc M.WARE.
      if (parcelizedGeoCluster) {

         res.locals.parcelizedGeoCluster = parcelizedGeoCluster;

         next();
         
      } else {
         throw new Error(`The auto-parcelization algo. is taking longer than usual. In 30 minutes, query the parcelized clusters API endpoint using the agc_id to retreive the parcelization result. If this fails, the geo-cluster polygon might have holes, and therefore cannot be parcelized.`)
      };

   } catch (_err) {
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: `The Geo-cluster GeoJSON was successfully uploaded. Parcelization failed. Contact auto-parcelization service Admin.`,
         error_msg: _err.message,
      });
   };
};