import { _getProps, _calcArea, _moveBboxPolygon } from "./_utils.js";
import { _newKatanaSliceOperation } from "./_newKatanaSliceOp.js";


import { map } from "./main.js"
import { GET_MAPBOX_POLYGON_LAYER, RENDER_LAYER } from "./mapbox-render.js";


const RENDERED_LAYERS = [];


export function _getKatanaSlice(direction, percentage, shapefile) {

   const shapefileArea = _calcArea(shapefile);
   let areaToAnnex = shapefileArea * percentage
            
   // INITIAL STATE
   // let annexedPolygon = shapefile
   let annexedPolygon;

   let movingBboxPolygon = _getProps(shapefile)._bboxPolygon

   // VAR. TO HOLD THE UNFINISHED CHUNK IN EACH WHILE LOOP
   let intersectModulusPoly;
   
   // THE AREA EACH MOVEMENT OF THE BBOX POLY. CARVES OUT OF THE SHAPEFILE..
   // let intersectSliceArea = shapefileArea - _calcArea(annexedPolygon) // 0.0 ha. initially
   let intersectSliceArea = 0 // 0.0 ha. initially

   // INIT. STARTING POS. OF MOVING BBOX. POLY.
   let moveIncrement = 0;
   
   
   while (intersectSliceArea.toFixed(1) <= areaToAnnex) {
      
      // MOVE THE BBOX POLY. BY A SMALL AMT.
      // CHECK ITS INTERSECT WITH THE SHAPEFILE
      // KEEP MOVING UNTIL THE INTERSECT IS === TO THE DESIRED AREA

      
      // GET AN INTERSECT POLY. THAT IS OFFSET FROM THE STARTING SHAPEFILE BY SMALL INCREMENT..
      movingBboxPolygon = _moveBboxPolygon(moveIncrement, movingBboxPolygon, direction)


      // THE annexedPolygon IS THE INTERSECT BTW. MOVING BBOX. & THE SHAPEFILE
      annexedPolygon = turf.intersect(_getProps(shapefile)._geometry, movingBboxPolygon)


      // FOR THE CURRENT areaToAnnex, ENSURE THE BBOX POLY. STILL INTERSECTS WITH THE SHAPEFILE, ie., annexedPolygon IS VALID
      // AND CHECK THAT THE MOVING BBOX. DIDN'T NOT CREATE AN ANNEXED POLY. WITH SPLIT GEOMETRY (i.e., a "MultyPolygon")
      // if (annexedPolygon) {

      //    // RENDER_LAYER(map, GET_MAPBOX_POLYGON_LAYER(annexedPolygon, {layerID: "fuckIloanusi", color: "green", thickness: 1, fillOpacity: 0.3}).outlineLayer)
      //       console.log(annexedPolygon);
      // }         
      if (annexedPolygon && turf.getType(annexedPolygon) === "Polygon") { 
      // if (annexedPolygon) {

         // GET THE AREA OF THE NEW SLICE
         intersectSliceArea = shapefileArea - _calcArea(annexedPolygon);

         intersectModulusPoly = turf.difference(_getProps(shapefile)._geometry, _getProps(annexedPolygon)._geometry)


      } else if (annexedPolygon && turf.getType(annexedPolygon) !== "Polygon") {


         // THE MOVING BBOX POLYGON INTERSECT WITH SHAPEFILE IS CREATING A MULTIPOLYGON
         // PROBABLY CAUSED BY INTERSECTING A CONCAVE GEOMETRY
         console.log(`Your K. SLICE bbox. polygon is creating a wierd MultiPolygon intersect with the shapefile..`);
         
         
         // REDUCE THE % INGRESS BY 5f%..
         // RE-START THE KATANA SLICING PROCESS FROM THE TOP..
         percentage = percentage - 0.05
         _getKatanaSlice(direction, percentage, shapefile)
         // console.log(intersectSliceArea.toFixed(1));
         // console.log(areaToAnnex.toFixed(1));

         
      } else {
         console.log(annexedPolygon);
         
         // THE MOVING BBOX POLYGON HAS MOVED PAST THE SHAPEFILE & CAN NO LONGER MUTATE IT
         console.log('K. SLICE >> the moving bbox poly. has moved "out of bounds.."');

         // FIXME > 
         // ZERO OUT THE SLICE POLY.
         // intersectModulusPoly = {};
         intersectModulusPoly = null;
         
         break
      }
      
      
      // UPDATE POSITION OF MOVING BBOX.
      // moveIncrement += 0.02;
      // moveIncrement += 0.01; // **
      moveIncrement += 0.001; // ****
      // moveIncrement += 0.0005;
      // moveIncrement += 0.00001;
   }
   
   // @ END OF WHILE LOOP => THE AREA OF SLICE ~= AREA OF DESIRED CHUNK
   // let leftoverPolygon = intersectModulusPoly;
   let leftoverPolygon = turf.buffer(intersectModulusPoly, -0.00005, {unit: 'kilometers'});
   
   
   // ADD CUSTOM PROPERTIES
   // leftoverPolygon.properties['chunk_index'] = idx + 1;
   // leftoverPolygon.properties['chunk_size'] = area.toFixed(1);


   // SANDBOX > RENDER GUIDE LINES 
   let layerID = `katanaMovingBboxPolygon_${Math.random()*1985}`
   let movingBboxPolygonOutline = GET_MAPBOX_POLYGON_LAYER(movingBboxPolygon, {layerID, color: "red", thickness: 0.5, fillOpacity: .1}).outlineLayer;
   RENDERED_LAYERS.push(movingBboxPolygonOutline);
   // RENDER_LAYER(map, movingBboxPolygonOutline);


   // DRAW THE CHUNK ON THE MAP
   // _drawChunk(leftoverPolygon, idx);
   
   
   return {
      annexedPolygon,
      leftoverPolygon
   };
}