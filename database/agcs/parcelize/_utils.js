const turf = require('@turf/turf')



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



function _calcArea(polygon) {
   return turf.area(polygon)/10000
}



// MOVE THE BBOX POLYGON
function _moveBboxPolygon(dist, bboxPolygon, bearing) {

   let bearings = {north: 0, south: 180, east: 90, west: -90}

   let movedBboxPolygon = turf.transformTranslate(bboxPolygon, dist, bearings[bearing], {units: 'kilometers'}) // -> NORTH
   
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
function _analyzeShapefile(shapefile) {
   
   let sfID, sfLocation;
   const randomSfID = `unique-agc-id-${(Math.random()*999999999).toFixed(0)}`
   const baseLocation = `Nigeria`

   if (shapefile.type === 'FeatureCollection' && shapefile.properties) {
      sfID = shapefile.properties.agc_id || randomSfID
      sfLocation = shapefile.properties.location || baseLocation
   }
   else if (shapefile.type === "FeatureCollection" && shapefile.features[0].properties) {
      sfID = shapefile.features[0].properties.agc_id || randomSfID
      sfLocation = shapefile.features[0].properties.location || baseLocation
   }
   else if (shapefile.type === "Feature") {
      sfID = shapefile.properties.agc_id || randomSfID
      sfLocation = shapefile.properties.location || baseLocation
   } 

   return {
      sfID,
      sfLocation
   }
}



module.exports = {
   _getProps,
   _calcArea,
   _moveBboxPolygon,
   _toggleChunkifyDir,
   _analyzeShapefile
}
