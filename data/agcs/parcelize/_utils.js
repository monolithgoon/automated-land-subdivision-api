const chalk = require('../../../utils/chalk-messages.js')
const turf = require('@turf/turf')
const fs = require('fs')



// GET DEFINING PROPERTIES OF THE SHAPEFILE
function _getProps(geojson) {

   if(geojson) {

      let _bbox, _geometry, _area, _bboxPolygon, _center

      if (turf.getType(geojson) === "FeatureCollection") {

         // UPDATE THE SHAPEFILE PROPERTIES TO HAVE AN "id" PROPERTY
         if (geojson.features[0].id) {
            geojson.features[0].properties["id"] = geojson.features[0].id 
         } else {
            // FIXME > 
         }
         
         _geometry = geojson.features[0].geometry;
         
      // } else if (turf.getType(geojson) === "Polygon") {
      } else if (turf.getType(geojson) === "Polygon" || turf.getType(geojson) === "MultiPolygon") {
         
         geojson.properties["id"] = "customPolygon1985" // FIXME < 

         _geometry = turf.cleanCoords(geojson.geometry);
         
      } else {
         // are you sure that geojson is valid??
      }
      
      _bbox = turf.bbox(geojson)
      _area = turf.area(_geometry)/10000;
      _bboxPolygon = turf.bboxPolygon(_bbox)
      _center = turf.coordAll(turf.centroid(geojson))[0]

      
      return {
         _bbox,
         _bboxPolygon,
         _geometry,
         _area,
         _center
      }
   }
}



// CALC. THE AREA OF A SHAPEFILE POLYGON
function _calcArea(polygon) {
   return turf.area(polygon)/10000
}



// MOVE THE BBOX POLYGON
function _moveBboxPolygon(dist, bboxPolygon, bearing) {

   let bearings = {north: 0, south: 180, east: 90, west: -90}

   let movedBboxPolygon = turf.transformTranslate(bboxPolygon, dist, bearings[bearing], {units: 'kilometers'});
   
   return movedBboxPolygon
}



// CANGE THE DIR. OF CHUNKIFICATION AFTER EACH KATANA SLICE OF THE ORG. SHAPEFILE
function _toggleChunkifyDir(direction) {
   if (direction === "east") {
      return direction = "west"
   } 
   else if (direction === "west") {
      return direction = "east"
   }
}



// CHECK WHETHER FEAT. OR FEAT. COLL.
function _analyzeGeojson(shapefile) {
   
   let sfID, sfLocation, sfName;
   const randomSfID = `unique-agc-id-${(Math.random()*999999999).toFixed(0)}`
   const genericName = `AGC`
   const baseLocation = `Nigeria`

   if (shapefile.type === 'FeatureCollection' && shapefile.properties) {
      sfID = shapefile.properties.agc_id || randomSfID
      sfName = shapefile.properties.extended_name || genericName
      sfLocation = shapefile.properties.location || baseLocation
   }
   else if (shapefile.type === "FeatureCollection" && shapefile.features[0].properties) {
      sfID = shapefile.features[0].properties.agc_id || randomSfID
      sfName = shapefile.features[0].properties.extended_name || genericName
      sfLocation = shapefile.features[0].properties.location || baseLocation
   }
   else if (shapefile.type === "Feature") {
      sfID = shapefile.properties.agc_id || randomSfID
      sfName = shapefile.properties.extended_name || genericName
      sfLocation = shapefile.properties.location || baseLocation
   } 

   return {
      sfID,
      sfName,
      sfLocation,
   }
}



function _generateRandomString(length, chars) {
   var mask = '';
   if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
   if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   if (chars.indexOf('#') > -1) mask += '0123456789';
   if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
   var result = '';
   for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
   return result;
}




// ...
function _getAllocationsMetadata(shapefileID, farmersData, farmerIndex) {

   // VARIABLE TO HOLD URL TO DECODED PHOTO
   let ownerPhotoUrl;

   
   // DECODE THE BASE64 IMAGES AN SAVE TO FILE
   const farmer = farmersData[farmerIndex];


   // TODO > STRIP OFF THE META HEADERS FROM THE Base64 STRING 
   // const base64String = apiResponse.data.agcData.properties.farmers[4].farmer_photo
   // const base64Image = base64String.replace(/^data:image\/\w+;base64,/, '');
   const base64ImageStr = farmer.farmer_photo;
   

   // DECODE & SAVE LOT OWNER'S Base64 PHOTOGRAPH TO FILE
   if (JSON.stringify(base64ImageStr) !== `[""]`) {

      // CREATE THE FARMER (LOT OWNER) PHOTO URL
      ownerPhotoURL = `/assets/farmer-photos/${farmer.farmer_id}.jpg`
      console.log(chalk.highlight(ownerPhotoURL))
   
      // WRITE TO FILE
      fs.writeFile(`../../../public/assets/farmer-photos/${farmer.farmer_id}.jpg`, base64ImageStr, {encoding: 'base64'}, (err, data) => {
         
         if(err) {
            console.log(chalk.fail(err.message));
            process.exit();
         } else {
            // console.log(chalk.success(`THE LOT OWNER PHOTOS FROM THIS SHAPEFILE ${shapefileID} WERE SAVED TO FILE  `));
            // process.exit();
         }
      });

   } else {

      ownerPhotoURL = undefined;
      
      console.error(chalk.warning(`This PLOT OWNER ${farmer.first_name} ${farmer.last_name} does not have a photograph..`))
   }

   const allocationsMetadata = {
      agcID: shapefileID,
      farmerID: farmersData[farmerIndex].farmer_id,
      allocSize: farmersData[farmerIndex].allocation,
      firstName: farmersData[farmerIndex].first_name,
      lastName: farmersData[farmerIndex].last_name,
      ownerPhotoURL
   }
   
   return allocationsMetadata
}




module.exports = {
   _getProps,
   _calcArea,
   _moveBboxPolygon,
   _toggleChunkifyDir,
   _analyzeGeojson,
   _generateRandomString,
   _getAllocationsMetadata,
}
