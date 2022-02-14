const chalk = require('../utils/chalk-messages.js');
const cloudinary = require("cloudinary").v2;
const { PARCELIZE_SHAPEFILE } = require('../utils/auto-parcelize/chunkify-moving-frames.js');
const { _generateRandomString } = require('../utils/auto-parcelize/_utils.js');


// AUTO-SUBDIVIDE / AUTO-PARCELIZATION LOGIC FN.
function autoSubdivideGJ(agc) {
   
   try {
      
      // INIT. PARCELIZATION VARIABLES
      const selectedShapefile = agc;
      
      // REMOVE > DEPRC.
      // // GET THE PLOT OWNER ALLOCATIONS
      // const farmerAllocations = [];
      // agc.properties.farmers.forEach(farmer=>farmerAllocations.push(farmer.allocation));
      
      // GET THE PLOT OWNER ALLOCATIONS
      const PLOT_ADMINS = agc.properties.farmers;
      
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

         const parcelizedClusterGJ = PARCELIZE_SHAPEFILE(selectedShapefile, PLOT_ADMINS, directionsObj);

         if (parcelizedClusterGJ) {

            // FIXME > RESTORE > THIS IS CAUSING A LOT OF PARCELIZATION ATTEMPTS TO FAIL
            // if (parcelizedClusterGJ.properties.parcelization_metadata.land_parity_ok) {

               // GET A PREVIEW MAP URL HASH
               parcelizedClusterGJ.properties["preview_map_url_hash"] = _generateRandomString();
               
               console.log({parcelizedClusterGJ});

               return parcelizedClusterGJ;
            // };
         };
      };

   } catch (autoParcelizeErr) {
      console.log(chalk.fail(`autoParcelizeErr: ${autoParcelizeErr.message}`));
   }
};


// UPLOAD IMAGE TO CLOUD
async function cloudinaryBase64Upload(docId, uploadFolder, base64ImageStr) {

	// CONFIG
	cloudinary.config({
		cloud_name: "dmvx8fnuz",
		api_key: "476581483278117",
		api_secret: "yIptwJZ4ahB36DNXebOI_UsXUTM",
		secure: true,
	});
   
   try {

      // UPLOAD OPTIONS
      uploadOptions = {
         public_id: docId,
         folder: uploadFolder,
         use_filename: true,
         unique_filename: false,
      };
      
      const cloudResponse = await cloudinary.uploader.upload(`data:image/jpg;base64,${base64ImageStr}`, uploadOptions,
         function (cloudUploadErr, cloudUploadResult) {
            if (cloudUploadErr) {
               console.warn(chalk.fail(cloudUploadErr.message));
            } else {
               // waitForAllUploads("pizza", cloudUploadErr, cloudUploadResult);
               // console.log(chalk.console(JSON.stringify(cloudUploadResult)));
               return cloudUploadResult;
            };
         }
      );
      
      const secureUrl = cloudResponse.secure_url;

      console.log("secureUrl:", chalk.highlight(JSON.stringify(secureUrl)));

      return secureUrl;

   } catch (cloudUploadErr) {
     console.error(chalk.fail(`cloudUploadErr: ${cloudUploadErr.message}`));
   };
};



async function uploadPlotAdminPhotos(geoCluster) {

   const geoClusterId = geoCluster.properties.agc_id;
   const uploadFolder = `/nirsal/parcelized-agcs/farmer-photos/${geoClusterId}/`;
   let plotsAdmins = geoCluster.properties.farmers;

   if (plotsAdmins) {

      for (let idx = 0; idx < plotsAdmins.length; idx++) {
         const plotAdmin = plotsAdmins[idx];
         const plotAdminId = plotAdmin.farmer_id;
         const base64ImageStr = plotAdmin.farmer_photo;

         // UPLOAD BASE64 IMAGE URI TO RECURSIVELY CREATED FOLDER
         if (JSON.stringify(base64ImageStr) !== `[""]`) {

            plotAdmin.farmer_photo_url = await cloudinaryBase64Upload(plotAdminId, uploadFolder, base64ImageStr)

         } else {

            console.error(chalk.warning(`This plot admin. [ ${plotAdminId} ] does not have a base64ImageStr..`))
            plotAdmin.farmer_photo_url = null;

         };
      };
   };

   geoCluster.properties.farmers = plotsAdmins;

   return geoCluster; 
};



// PARCELIZE THE NEW AGC GEO-FILE AND INSERT INTO DB.
exports.subdivideGeofile = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ parcelizeAGCGeofile ] CONTROLLER FN. `))

   try {

      let clusterGJPayload = res.locals.appendedGeofileGeoJSON;

      console.log((clusterGJPayload.properties));

      // SAVE THE PLOT ADMIN PHOTOS
      clusterGJPayload = await uploadPlotAdminPhotos(clusterGJPayload);
      
      // AUTO-PARCELIZE THE CLUSTER
      const parcelizedGeofile = autoSubdivideGJ(clusterGJPayload);

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
   clusterGJPayload = await uploadPlotAdminPhotos(clusterGJPayload);

   try {
      
      // AUTO-PARCELIZE THE CLUSTER
      const parcelizedGeoCluster = autoSubdivideGJ(clusterGJPayload);

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