// require("dotenv").config({ path: "../default.env" }); // IMPORTANT > CONFIGURE ENV. VARIABLES BEFORE U CALL THE APP > read the data from the config file. and use them as env. variables in NODE
const dotenv = require('dotenv');
dotenv.config({path: '../default.env'}); // loads the cloudinary credentials stored in default.env
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const multer = require("../middleware/multer-file-upload.js");
const chalk = require("./chalk-messages.js");
// const streamifier = require('streamifier')



// READ BASE64 STRING FROM FILE TO A VARIABLE
// fs.readFile('./base64ImageStr.txt', (err, data) => {
//    if (err) { console.log(chalk.fail(err.message)); } 
//    else {
//       var base64Data = new Buffer.from(data).toString('base64'); // "data" FROM readFile COMES IN BINARAY; IT IS LOADED INTO THE BUFFER OBJECT AND RE-ENCODED INTO A BASE64 STRING
//       console.log(base64Data);
//    }
// });
let base64ImageStr;
try {
   const stringBinary = fs.readFileSync('./base64String.txt');
   base64ImageStr = Buffer.from(stringBinary).toString('ascii');
   // console.log(base64ImageStr);
   
} catch (_err) {
	console.log(chalk.fail(_err.message))  
}



fs.writeFile('./decodedImage.jpg', base64ImageStr, {encoding: 'base64'}, (_err, data) => {
   if(_err) {
      console.error(chalk.fail(_err.message));
      console.log(chalk.fail(`Could not decode base64ImageStr into an image file. The Base64 string might be invalid.`))
      process.exit();
   } else {
      // console.log(chalk.success(`THE LOT OWNER PHOTOS FROM THIS SHAPEFILE ${geofileID} WERE SAVED TO FILE  `));
      // process.exit();
   }
});



// CLOOUDINARY DIRECT UPLUAD WITH MULTER & REQ. OBJECT
// app.post('/upload', fileUpload.single('image'), function (req, res, next) {
//    let streamUpload = (req) => {
//        return new Promise((resolve, reject) => {
//            let stream = cloudinary.uploader.upload_stream(
//              (error, result) => {
//                if (result) {
//                  resolve(result);
//                } else {
//                  reject(error);
//                }
//              }
//            );

//           streamifier.createReadStream(req.file.buffer).pipe(stream);
//        });
//    };

//    async function upload(req) {
//        let result = await streamUpload(req);
//        console.log(result);
//    }

//    upload(req);
//    });

var uploads = {};

// // CREATE FOLDER
// cloudinary.api.create_folder(
// 	"nirsal/agcs/farmer-photos",
// 	function (error, result) {
// 		console.log(chalk.interaction(JSON.stringify(result)));
// 	}
// );

// File upload FROM BASE64 IMAGE STRING TO EXISTING OR RECURSIVELY CREATED FOLDER
cloudinary.uploader.upload(
	// `$../public/assets/farmer-photos/AGCPLA001039.jpg`,
   `data:image/jpg;base64,${base64ImageStr}`,
	{
		tags: "farmer",
		use_filename: true,
      unique_filename: false,
		folder: "nirsal/parcelized-agcs/farmer-photos/",
	},
	function (err, image) {
		if (err) {
			console.warn(chalk.fail(err.message));
		} else {
			console.log(chalk.highlight(image.secure_url));
			waitForAllUploads("pizza", err, image);
		}
	}
);

// // Stream upload
// var upload_stream = cloudinary.uploader.upload_stream({ tags: 'basic_sample' }, function (err, image) {
//   console.log();
//   console.log("** Stream Upload");
//   if (err) { console.warn(err); }
//   console.log("* Same image, uploaded via stream");
//   console.log("* " + image.public_id);
//   console.log("* " + image.url);
//   waitForAllUploads("pizza3", err, image);
// });
// fs.createReadStream('pizza.jpg').pipe(upload_stream);

// // Custom Public Id
// cloudinary.uploader.upload('pizza.jpg', { tags: 'basic_sample', public_id: 'my_favorite_pizza' }, function (err, image) {
//   console.log();
//   console.log("** Public Id");
//   if (err) { console.warn(err); }
//   console.log("* Same image, uploaded with a custom public_id");
//   console.log("* " + image.public_id);
//   console.log("* " + image.url);
//   waitForAllUploads("pizza2", err, image);
// });

function waitForAllUploads(id, err, image) {
	uploads[id] = image;
	var ids = Object.keys(uploads);
	if (ids.length === 6) {
		console.log();
		console.log(
			"**  uploaded all files (" + ids.join(",") + ") to cloudinary"
		);
		performTransformations();
	}
};