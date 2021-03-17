const chalk = require('../utils/chalk-messages.js')
const path = require('path');
const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024; // Restrict file size with Multer



// CONFIGURE multer TO USE Disk Storage ENGINE
let storageConfig = multer.diskStorage({
   // determines folder to store the uploaded files.
	destination: (req, file, cb) => {
		cb(null, __approotdir + "/resources/uploads/raw-geo-files");
   },
   //  determines the name of the file inside the destination folder.
	filename: (req, file, cb) => {
		console.log(chalk.result(JSON.stringify(file)));
		cb(null, file.originalname);
	},
});



// FILE EXTENSION VALIDATOR : MTD. 1
let fileFilter = (req, file, cb) => {
   if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
   } else {
      cb(null, false);
      return cb(new Error(`Only .png, .jpg and .jpeg format allowed!`));
   }
}



// FILE EXTENSION VALIDATOR : MTD. 2
// CHECK for both the extension and the MIME type of the uploaded parameter
// MIME > Multipurpose Internet Mail Extensions
let checkFileType = (req, file, cb) => {

   if (/ /.test(file.originalname)) {
      cb(null, false);
      cb(`Spaces are not allowed in the geofile's name.`)
   } else {
      
      console.log(chalk.warning((file.originalname)))
      // console.log(chalk.warning(path.extname(file.originalname)))
   
      // ALLOWED EXTENSIONS REGEX
      // const fileTypes = /jpeg|jpg|png|gif/;
      const geoFileTypes = /gpx|kml|kmz|shp/;
      // Check ext
      const extensionNameTest = geoFileTypes.test(path.extname(file.originalname).toLowerCase());
      // // Check mime
      const mimeTypeTest = geoFileTypes.test(file.mimetype);
   
      if (extensionNameTest) {
         return cb(null, true);
      }
      if (mimeTypeTest && extensionNameTest) {
         // return cb(null, true);
         return cb(null, true);
      } else {
         cb(null, false);
         // return cb(new Error(`Error: Upload .GPX, .KML, .KMZ or .SHP files only!`))
         cb(`Only .GPX, .KML, .KMZ or .SHP files are allowed!`);
      }
   }
}



// INIT. MULTER
let multerFileUpload = multer({
	storage: storageConfig,
   limits: { fileSize: maxSize },
   // fileFilter: fileFilter,
   fileFilter: checkFileType,
}).single("file");



// util.promisify() makes the exported middleware object usable with async-await
let uploadFileMiddleware = util.promisify(multerFileUpload);
module.exports = uploadFileMiddleware;