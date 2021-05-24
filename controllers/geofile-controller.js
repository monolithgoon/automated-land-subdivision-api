const chalk = require('../utils/chalk-messages');
const catchAsyncError = require('../utils/catch-async.js')
const fs = require('fs');
const multerFileUpload = require("../middleware/multer-file-upload.js");
const { _geofileConverter } = require('../utils/geofile-converter.js');
const { _validateAllocationsArea } = require('../utils/utils.js');
const GEO_CLUSTER_DETAILS_MODEL = require('../models/geo-cluster-details-model.js')




const uploadGeofile = async (req, res, next) => {
	
	console.log(chalk.success(`CALLED THE [ uploadGeofile ] CONTROLLER FN. `))

	// const geofileUploadPath = `/resources/uploads/raw-geo-files/`
	// const convertedGeofilePath = `/resources/converted-geo-files/`

	// UPDATE THE REQUEST OBJECT WITH FILE PATH VARIABLES
	req.__uploadpath = `/resources/uploads/raw-geo-files/`
	req.__convertedpath = `/resources/converted-geo-files/`
	
	try {

		// use Multer middleware function for file upload
		// THIS CREATES A req.file OBJ. TAHT GIVES US ACCESS TO THE FILE BUFFER THAT WAS UPLOADED FROM THE CLIENT..
		await multerFileUpload(req, res);

      // catch Multer error (in middleware function)
		if (req.file === undefined) {
			return res.status(400).send({ message: "Please seclect a file to upload."});
      }

		next();
		
	} catch (_err) {

      // Handle Multer file size limit error
      if (_err.code == "LIMIT_FILE_SIZE") {
         return res.status(500).send({
           message: `The geofile size cannot be larger than 2MB!`,
         });
      }

      // general error handling 
      if (req.file) {
			res.status(500).send({
            message: `Could not upload this file: ${req.file.originalname}. ${_err}`,
         });
      } else {
			res.status(500).send({
				message: `Could not upload that file. ${_err}`
			});
		}
	}
};




// CONVERT THE GEO FILE TO GeoJSON && SAVE
// const convertGeofile = (req, res, next) => {
const convertGeofile = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ convertGeofile ] CONTROLLER FN. `))
	
	// GET THE FILE DETAILS FROM THE MULTER MWRE. (INCLUDES THE EXTENSION)
	const completeFileName = req.file.originalname;
	
	// SPLIT completeFileName TO fileName & fileExtension
	const [fileName, fileExtension] = completeFileName.split(/\.(?=[^\.]+$)/);
	
	try {
		
		const geofileUploadPath = req.__uploadpath
		const convertedGeofilePath = req.__convertedpath

		// CONVERT THE GEO FILE TO GeoJSON && SAVE TO DISK
		try {
			// IMPORTANT > THE FN. CALL BELOW MUST BE AWAITED IN ORDER TO HANDLE THE ERROR THROWN BY THE PROMISE-BASED shapefileConverter FN. IN geofileConverter.js
			await _geofileConverter({completeFileName, geofileUploadPath, convertedGeofilePath});
		} catch (_err) {
			return next(new Error(`This file [ ${completeFileName} ] was successfully uploaded. ${_err.message}`))
		};
		
		// CHECK IF THE FILE WAS SUCCESSFULLY CONVERTED & SAVED
		fs.readFile(`${__approotdir}${req.__convertedpath}${fileName}.geojson`, "utf8", (_err, geojsonData) => {
			if (_err) {
				return next(new Error (`This file [ ${completeFileName} ] was successfully uploaded, and converted to a GeoJSON polygon, but there was a problem saving the file. ${_err.message}`))

				// REMOVE > DEPRECATED > YOU DON'T WANT TO CALL next() IF CONVERSION FAILS 
				// return next (new Error(`This file [ ${completeFileName} ] was successfully uploaded, but was NOT succesfully converted to GeoJSON. Check the geo-file-converter utility module. ${_err.message}`))
				// return
			} else {

				// REMOVE > DEPRECATED > SEND SUCCESS MESSAGE IN parcelizeController 
				// // return successful file conversion response with a message
				// res.status(200).send({
				// 	message: `This file [ ${completeFileName} ] was successfully uploaded, and converted to GeoJSON.`,
				// });
				
				// PASS GEOJSON FILE DATA to the next middleware using next()
				// Setting variables directly on the request object (ie. req.geojsonData) is not supported or documented. 
				// res.locals is guaranteed to hold state over the life of a request.
				res.locals.geojsonFileData = geojsonData;
				res.locals.geojsonFileName = fileName;
				
				next();
			}
		});
		
	} catch (_err) {

		// REMOVE > DEPRECATED > ALL POTENTIAL ERRS. HAVE BEEN ADEQUEATELY HANDLED ABOVE 
		// if (completeFileName) {
		// 	res.status(500).send({
		// 		message: `This file [ ${completeFileName} ] was successfully uploaded, but was NOT succesfully converted to GeoJSON. Check the convertGeofile fn. in the file-controller module.`,
		// 		error_msg: _err.message,
		// 	});
		// } else {
		// 	res.status(500).send({
		// 		message: `You seem to be trying to convert a geofile that doesn't exist on this server.`,
		// 	});
		// }

		if (!completeFileName) {
			res.status(500).send({
				message: `You seem to be trying to convert a geofile that has not been uploaded to this server.`
			});
		}
	}
};




// APPEND THE FARMER ALLOCATIONS JSON RECORD TO THE DELIN. LAND GEOJSON
const appendJSONProperties = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ appendJSONProperties ] CONTROLLER FN. `))

	const convertedGeojson = JSON.parse(res.locals.geojsonFileData);
	const geofileID = res.locals.geojsonFileName;
	
   try {
		
		console.log(chalk.working(`QUERYING PLOT ALLOCS. COLLECTION FOR ${geofileID}. WAITING FOR RESPONSE .. `))

		// search the plot allocations collection for alloc. with properties.geofile_id === geofileID
		// const queryObj = { "properties.geofile_id": geofileID };
		// TODO > CHANGE TO properties.geofile_id > 
		const queryObj = { "properties.geo_cluster_id": geofileID };
		
	// if (await AGC_MODEL.countDocuments(queryObj) !==0 ) {  // REMOVE < DEPRECATED 
		if (await GEO_CLUSTER_DETAILS_MODEL.countDocuments(queryObj) !==0 ) {
			
			// CONDUCT THE DB QUERY
         // let dbQuery = AGC_MODEL.find(queryObj); // REMOVE < DEPRECATED 
         let dbQuery = GEO_CLUSTER_DETAILS_MODEL.find(queryObj);

         // SAVE THE RESULTS OF THE QUERY
         const geoClusterDetailsJSON = await dbQuery;

			// REMOVE > DEPRECATED 
         // // SEND SUCCESS HEADER
         // res.status(200).json({
         //    status: 'success',
         //    data: {
         //       // The query using 'geo_cluster_id' returns an array with only one element; deal with it..
         //       agcData: geoClusterDetailsJSON[0]
         //    }
			// })

			// COMPARE THE LAND AREA TO THE SUM OF THE ALLOCATIONS
			// TODO > CHANGE "farmers" TO "plot_owners" > 
			_validateAllocationsArea(convertedGeojson, geoClusterDetailsJSON[0].properties.farmers, res.locals.geojsonFileName); 
			
			// COPY THE PROPS. FROM CLUSTER DETAILS JSON TO THE CONVERTED GEOJSON
			// TODO > CHANGE "farmers" TO "plot_owners" > 
			convertedGeojson.properties = geoClusterDetailsJSON[0].properties; 

			// PASS THE UPDATED/APPENDED GEOJSON TO THE NEXT M.WARE
			res.locals.appendedGeojson = convertedGeojson;

			next();
	
      } else {
			
			// NO FARMERS' ALLOCATIONS JSON WITH THAT ID EXISTS IN THE DB.
			throw new Error(`Our database DOES NOT have a JSON record of a geo-cluster document whose 'geofile_id' matches this file's name: [ ${geofileID} ]. The db. query in the appendJSONProperties fn. in the file-controller failed. `);

			// REMOVE > DEPRECATED 
         // res.status(404).json({
         //    message: `Your geofile [ ${res.locals.geojsonFileName} ] was uploaded & converted to GeoJSON. But a JSON record [ ${geofileID} ] of farmer allocations DOES NOT exist in the database. GET REQUEST FAILED.`
         // });
      };
		
   } catch (_err) {

      res.status(404).json({
         staus: 'fail',
         message: `[ ${req.file.originalname} ] was successfully uploaded to the server, and converted to a GeoJSON polygon.`,
         error_msg: _err.message,
      })
   }
};




//  read all files in raw-geo-files folder, return list of files’ informationn (name, url)
const getListFiles = (req, res) => {

	const directoryPath = `${__approotdir}/${geofileUploadPath}`

	fs.readdir(directoryPath, function (err, files) {
		if (err) {
			res.status(500).send({
				message: "Unable to scan files!",
			});
		}

		let fileInfos = [];

		files.forEach((file) => {
			fileInfos.push({
				name: file,
				url: __dirname + file,
			});
		});

		res.status(200).send(fileInfos);
	});
};




// receives file name as input parameter; 
// then uses Express res.download API to transfer the file at path (directory + file name) as an ‘attachment’.
const downloadFile = (req, res) => {
	const fileName = req.params.name;
	const directoryPath = `${__approotdir}/${geofileUploadPath}`

	res.download(directoryPath + fileName, fileName, (err) => {
		if (err) {
			res.status(500).send({
				message: "Could not download the file. " + err,
			});
		}
	});
};




module.exports = {
	getListFiles,
	downloadFile,
	uploadGeofile,
	convertGeofile,
	appendJSONProperties,
};