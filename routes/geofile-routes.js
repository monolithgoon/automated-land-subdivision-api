const express = require("express");
const ROUTER = express.Router();
const geofileController = require("../controllers/geofile-controller.js");
const geoClusterController = require('../controllers/geo-cluster-controller.js');
const subdivideController = require('../controllers/auto-subdivide-controller.js')
const parcelizedAgcController = require('../controllers/parcelized-agc-controller.js');


// METHOD #1
// let routes = (app) => {
//   ROUTER.post("/upload", controller.upload);
//   ROUTER.get("/files", controller.getListFiles);
//   ROUTER.get("/files/:name", controller.download);

//   app.use(router);
// };

// module.exports = routes;


// METHOD #2
ROUTER.route('/')
   .get(geofileController.getListFiles);


ROUTER.route('/:file-name')
   .get(geofileController.downloadFile)


ROUTER.route('/geofile/upload/')
   .post(
      geofileController.uploadGeofile, 
      geofileController.convertGeofileToGeoJSON, 
      geofileController.appendClusterDetails,
      geoClusterController.insertGeofileGeoJSON,
      subdivideController.subdivideGeofile,
      parcelizedAgcController.insertParcelizedGeofile,
   );


module.exports = ROUTER;