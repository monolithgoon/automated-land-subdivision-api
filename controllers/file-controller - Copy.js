const chalk = require('../utils/chalk-messages');
const catchAsyncError = require('../utils/catch-async.js')
const fs = require('fs');
const multerFileUpload = require("../middleware/multer-file-upload.js");
// const { _geofileConverter } = require('../middleware/geo-file-converter.js');
const { _geofileConverter } = require('../utils/geo-file-converter.js');



const convertFile = async (req, res) => {
	console.log(chalk.fail(req.file))
	await kmlToGeojson(req.file)
}
const uploadFile = async (req, res) => {
	
	console.log(chalk.success(`YOU SUCCESSFULLY CALLED THE uploadFile CONTROLLER FN. `))

	const geofileUploadPath = `/resources/uploads/raw-geo-files/`
	const convertedGeofilePath = `/resources/converted-geo-files/`
	
	try {

		// use Multer middleware function for file upload
		// THIS SEEMS TO UPDATE THE req OBJECT..
		await multerFileUpload(req, res);

      // catch Multer error (in middleware function)
		if (req.file === undefined) {
			return res.status(400).send({ message: "Please upload a file!" });
      }
				
		
		// GET THE FILE DETAILS FROM THE MULTER MWRE. (INCLUDES THE EXTENSION)
		const completeFileName = req.file.originalname;

		// SPLIT completeFileName TO fileName & fileExtension
		const [fileName, fileExtension] = completeFileName.split(/\.(?=[^\.]+$)/);
		

		// CONVERT THE GEO FILE TO GeoJSON && SAVE TO DISK
		try {
			_geofileConverter({completeFileName, geofileUploadPath, convertedGeofilePath});
		} catch (_err) {
			console.error(chalk.fail(_err.message))
		}


		// CHECK IF THE FILE WAS SUCCESSFULLY CONVERTED
		fs.readFile(`${__approotdir}/resources/converted-geo-files/${fileName}.geojson`, "utf8", (_err, data)=>{
			if (_err) {
				console.error(chalk.fail(_err.message));
				return
			} else {
				console.log(chalk.success(`Yep, the converted file is there.. `))
			}
		})
		
		
      // return response with message
		res.status(200).send({
         message: `Uploaded the file successfully: ${completeFileName}`,
      });
      
	} catch (_err) {

      // Handle Multer file size limit error
      if (_err.code == "LIMIT_FILE_SIZE") {
         return res.status(500).send({
           message: "File size cannot be larger than 1MB!",
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
	uploadFile,
	convertFile,
};
