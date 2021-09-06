const fs = require('fs')
const path = require('path')
const turf = require('@turf/turf')
const chalk = require('../chalk-messages.js')
const { EROFS, SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')



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

   const sfArea = _calcArea(shapefile);

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
      sfArea,
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



// CREATE A FOLDER WITH THE geofileID && SAVE THE PLOT OWNER PHOTOS INSIDE
function savePlotOwnerPhoto({photosDirectory, geofileID, farmer, base64ImageStr}) {

   // CREATE A PHOTOS FOLDER WITH THE geofileID
   if (!fs.existsSync(photosDirectory)) {
      try {
         fs.mkdirSync(photosDirectory, {recursive: true})
         console.log(chalk.success(`The plot owners' photos folder for ${geofileID} was created `));
      } catch (_err) {
         console.error(chalk.fail(`An error occured when trying to create a photos directory with geofileID ${geofileID}: ${_err.message}`))
         throw new Error(_err)
      }

      // CREATE DIRECTORY > METHOD 2
      // var mkdirp = require('mkdirp');
      // mkdirp(photosDirectory, function (err) {
      //     if (err) console.error(err)
      //     else console.log('dir created')
      // });
   }

   
   // REMOVE > DEPRECATED > WILL NOT WORK WHEN CALLED IN AN EXPRESS APP 
   // fs.writeFile(`../../../../public/assets/farmer-photos/${farmer.farmer_id}.jpg`, base64ImageStr, {encoding: 'base64'}, (_err, data) => {
      // When the entry point is app.js (Express), "../../../public/assets..." goes up by 3 directories, and resolves incorrectly
      // When the entry point is parcelize-local-agc.js (from the command line), "../../../public/assets..." resolves correctly
      

   // CHECK IF THE DIR. WITH THAT geofileID EXISTS BEFORE ATTEMPTING TO WRITE THE PHOTO TO FILE   
   if (fs.existsSync(photosDirectory)) {   

      // fs.writeFile(path.resolve(`${__approotdir}/public/assets/farmer-photos/${farmer.farmer_id}.jpg`), base64ImageStr, {encoding: 'base64'}, (_err, data) => {
      fs.writeFile(path.resolve(`${photosDirectory}/${farmer.farmer_id}.jpg`), base64ImageStr, {encoding: 'base64'}, (_err, data) => {
         if(_err) {
            console.error(chalk.fail(_err.message));
            throw new Error(`Could not create a URL to this PLOT OWNER'S ${farmer.first_name} ${farmer.last_name} photo. The Base64 image string might be invalid. ${_err.message}`)
            process.exit();
         } else {
            // console.log(chalk.success(`THE LOT OWNER PHOTOS FROM THIS SHAPEFILE ${geofileID} WERE SAVED TO FILE  `));
            // process.exit();
         }
      });
   } 
};



// CHECK THAT THE C-M-F.js ALGO. RAN PROPERLY
function _checkParity(landArea, totalAllocations, unparcelizedLandArea) {
   const tolerance = 0.15
   const unallocatedLandArea = landArea - totalAllocations
   const error = unallocatedLandArea - unparcelizedLandArea
   console.log(landArea)
   console.log(unallocatedLandArea)
   console.log(unparcelizedLandArea)
   if (error < 0) throw new Error(`Your parcelization is way off. There is too much un-parcelized land.`)
   // if (error < 0) return false
   if (error/unallocatedLandArea <= tolerance) return true
   else throw new Error(`Parcelization algo. is using up too much land.`)
}



// ...
function _getAllocationsMetadata(geofileID, plotOwnersData, plotOwnerIndex) {

   // VARIABLE TO HOLD URL TO DECODED PHOTO
   let ownerPhotoUrl;

   
   // DECODE THE BASE64 IMAGES AN SAVE TO FILE
   const farmer = plotOwnersData[plotOwnerIndex];


   // TODO > STRIP OFF THE META HEADERS FROM THE Base64 STRING 
   // const base64String = apiResponse.data.agcData.properties.farmers[4].farmer_photo
   // const base64Image = base64String.replace(/^data:image\/\w+;base64,/, '');
   const base64ImageStr = farmer.farmer_photo;
   

   // DECODE & SAVE LOT OWNER'S Base64 PHOTOGRAPH TO FILE
   if (JSON.stringify(base64ImageStr) !== `[""]`) {

      // RELATIVE PATH TO PHOTOS DIRECTORY WITH geofileID
      const relPhotosPath = `assets/images/farmer-photos/${geofileID}`

      // ABSOLUTE PATH TO PHOTOS DIRECTORY WITH geofileID
      const photosDirectory = path.resolve(`${__approotdir}/public/${relPhotosPath}`);

      // CREATE A FOLDER WITH THE geofileID && SAVE THE PLOT OWNER PHOTOS INSIDE
      savePlotOwnerPhoto({photosDirectory, geofileID, farmer, base64ImageStr});

      // URL FROM WHICH FRONTEND CODE RENDERS THE PLOT OWNER'S PHOTO
      // ownerPhotoURL = `/assets/farmer-photos/${farmer.farmer_id}.jpg` // REMOVE < DEPRECATED 
      ownerPhotoURL = `/${relPhotosPath}/${farmer.farmer_id}.jpg`
      console.log(chalk.highlight(ownerPhotoURL));    

   } else {

      ownerPhotoURL = undefined;
      
      console.error(chalk.warning(`This PLOT OWNER ${farmer.first_name} ${farmer.last_name} does not have a base64ImageStr..`))
   }


   const allocationsMetadata = {
      agcID: geofileID,
      farmerID: plotOwnersData[plotOwnerIndex].farmer_id,
      allocSize: plotOwnersData[plotOwnerIndex].allocation,
      firstName: plotOwnersData[plotOwnerIndex].first_name,
      lastName: plotOwnersData[plotOwnerIndex].last_name,
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
   _checkParity,
   _getAllocationsMetadata,
}
