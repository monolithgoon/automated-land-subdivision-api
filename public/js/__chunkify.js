import { getProps, calcArea, moveBboxPolygon, toggleChunkifyDir } from "./chunkify-moving-frames.js";
import { _getKatanaSlice } from "./_getKatanaSlice.js";


import { map } from "./main.js"
import { GET_MAPBOX_POLYGON_LAYER, RENDER_LAYER } from "./mapbox-render.js";


let RENDERED_LAYERS = [];


export function __chunkify({
   allocArea,
   chunkifyDirection,
   newChunkifyDir,
   workingShapefile,
   katanaSliceDirection,
   percentIngress,
   unslicedShapefile,
   idx
}) {


   // INITIAL STATE
   // THE "mutatedShapefile" IS THE INTERSECT BTW. MOVING BBOX. & THE KATANA SHAPEFILE
   let mutatedShapefile = workingShapefile;

   // INIT. THE START POSITION OF THE MOVING BBOX. POLYGON
   let movingBboxPolygon = getProps(workingShapefile)._bboxPolygon;

   // INITIAL AREA OF THE BASE KATANA SLICE
   let workingShapefileArea = calcArea(workingShapefile)

   // VAR. TO HOLD THE UNFINISHED CHUNK IN EACH WHILE LOOP
   let chunkSlicePolygon;

   // THE AREA EACH MOVEMENT OF THE BBOX POLY. CARVES OUT OF THE SHAPEFILE..
   let chunkSlicePolyArea = workingShapefileArea - calcArea(mutatedShapefile); // 0.0 ha. initially

   // INIT. STARTING POS. OF MOVING BBOX. POLY.
   let moveIncrement = 0;

   // SAVE THE IDX. IF THE CHUNKIFY ATTEMPT FAILS
   let failedAllocIdx;

   // KEEP TRACK OF THE SLICE AFTER BBOX HAS MOVED
   let intersectModulusPoly;


   while (chunkSlicePolyArea.toFixed(1) <= allocArea) {
      // MOVE THE BBOX POLY. BY A SMALL AMT.
      // CHECK ITS INTERSECT WITH THE KATANA SHAPEFILE
      // KEEP MOVING UNTIL THE INTERSECT IS === TO THE ALLOC.

      // GET AN INTERSECT POLY. THAT IS OFFSET FROM THE STARTING SHAPEFILE  BY SMALL INCREMENT..
      movingBboxPolygon = moveBboxPolygon(moveIncrement, movingBboxPolygon, chunkifyDirection)


      // REMOVE > 
      let movingBboxPolygonOutline = GET_MAPBOX_POLYGON_LAYER(movingBboxPolygon, {layerID: 9090, color: "orange", thickness: 1, fillOpacity: .1}).outlineLayer;
      RENDERED_LAYERS.push(movingBboxPolygonOutline)
      RENDER_LAYER(map, movingBboxPolygonOutline);

      
      // ANALYZE THE MUTATION
      const mutationResult = getMutatedShapefile(workingShapefile, movingBboxPolygon, intersectModulusPoly)


      if (!mutationResult.failedChunkSlicePoly) {
         // THE MOVING BBOX. STILL INTERSECTS WITH THE WIP SHAPEFILE

         // SAVE THE SLICE so that when mutation fails, we remember the slice that faiiled, which then gets passed to getMutatedShapefile
         intersectModulusPoly = mutationResult.intersectModulusPoly;

         // UPDATE THE MUTATED SHAPEFILE
         mutatedShapefile = mutationResult.returnedMutatedSf;

         // GET THE "LEFTOVER" POLYGON AFTER MUTATION
         chunkSlicePolygon = getChunkSlicePoly(workingShapefile, mutatedShapefile);

         // chunkSlicePolyArea = calcArea(chunkSlicePolygon)
         chunkSlicePolyArea = workingShapefileArea - calcArea(mutatedShapefile);
      }
      
      else if (mutationResult.failedChunkSlicePoly) {
         // THE MOVING BBOX. WENT OUT OF BOUNDS OF THE SHAPEFILE TRYING TO FIT THIS ALLOC.
         // GROW THE WORKING SHAPEFILE & INCLUDE THE FAILED SHAPEFILE SLICE
         console.log('you are here');

         // 
         let leftoverShapefile = mutationResult.failedChunkSlicePoly;
         leftoverShapefile = turf.buffer(leftoverShapefile, 0.0005, {unit: 'kilometers'});

         // 
         const reunitedShapefile = turf.union(unslicedShapefile, leftoverShapefile);
         console.log(leftoverShapefile);
         console.log(reunitedShapefile);
         console.log(`reunitedShapefile Type: ${turf.getType(reunitedShapefile)}`);

         // DECIDE WHETHER TO DO KATANA SLICE OR NOT
         console.log(percentIngress);
         // if (percentIngress > 0.25) {
         if (percentIngress > 0.40) {

            percentIngress = percentIngress - 0.15;

            let katanaData = getKatanaSlice(katanaSliceDirection, percentIngress, reunitedShapefile);

            // GET A NEW KATANA SLICE TO CHUNKIFY FROM THE UNION OF THE LEFTFOVER SHAPEFILE & THE "TOO SMALL" SLICE
            mutatedShapefile = katanaData.annexedPolygon;

            // KEEP TRACK OF THE LEFTOVER SHAPEFILE FROM THE NEW SLICE OPERATION
            unslicedShapefile = katanaData.leftoverPolygon;
            
         } else {
            
            // THE REMAINING SHAPEFILE IS LAST 25% OF ORIGINAL, DON'T SLICE..

            // KEEP THE CHUNKING PROCESS GOING..
            mutatedShapefile = reunitedShapefile;
         }


         // CHUNKIFY FROM THE OPPOSITE DIRECTION
         newChunkifyDir = toggleChunkifyDir(chunkifyDirection);

         // KEEP TRACK OF THE ALLOC. THAT FAILED
         failedAllocIdx = idx;

         // ZERO OUT THE CHUNK SLICE POLYGON FOR THAT ALLOC.
         chunkSlicePolygon = null;


         // continue
         break
      }


      // UPDATE THE BBOX POLYGON'S POSITION
      moveIncrement += 0.0003; //
      // moveIncrement += 0.0005; //
      // moveIncrement += 0.001; // USE FOR MEDIUM SHAPEFILES (>50<100 ha.)
      // moveIncrement += 0.005; // USE FOR MEDIUM SHAPEFILES (>50<100 ha.)
   }


   // @ END OF WHILE LOOP > THE AREA OF SLICE ~= AREA OF DESIRED CHUNK
   const chunkPolygon = chunkSlicePolygon;


   // ADD CUSTOM PROPERTIES
   if (chunkPolygon) { addChunkProps(chunkPolygon, allocArea, idx); }


   // RECURSIVE BEHAVIOR > THE ALLOCATIONS "FOR" LOOP WILL EVALUATE A DIMINISHING SHAPEFILE WITH EACH ITERATION
   return {
      chunkPolygon,
      mutatedShapefile,
      newChunkifyDir,
      percentIngress,
      failedAllocIdx,
      unslicedShapefile,   
   }
}


function addChunkProps(processedChunk, area, index) {
   const presentationCoordinates = [];
   processedChunk.geometry.coordinates[0][0].forEach(coordinates => {
      presentationCoordinates.push(`lat ${coordinates[0]}, lng ${coordinates[1]}`);
   });
   processedChunk.properties['chunk_index'] = index + 1;
   processedChunk.properties['chunk_id'] = `nirsal-agc-code-xxx-unique-chunk-id-${(Math.random()*99999*index).toFixed(0)}`;
   processedChunk.properties['chunk_size'] = area.toFixed(1);    
   processedChunk.properties['farmer_id'] = `unique-farmer-id-${(Math.random()*99999*index).toFixed(0)}` 
   processedChunk.properties['coordinates'] = `${presentationCoordinates}`
}


function getMutatedShapefile(wipShapefile, movingBboxPoly, intersectModulusPoly) {

   let returnedMutatedSf;

   // 
   const intersectShapefile = turf.intersect(getProps(wipShapefile)._geometry, movingBboxPoly);

   // 
   let failedChunkSlicePoly;


   // CHECK IF THE INTERSECT IS VALID
   if (intersectShapefile) {
   
      // MUTATION SUCCESSFUL
      failedChunkSlicePoly = null;
   
      // SAVE THE SLICE
      intersectModulusPoly = getChunkSlicePoly(wipShapefile, intersectShapefile);
   
      if (turf.getType(intersectShapefile) === "Polygon") {
   
         returnedMutatedSf = intersectShapefile
         
      } else if (turf.getType(intersectShapefile) === "MultiPolygon") {
   
         // return ???
      }
   
   } else {
   
      // THE MUTATION/INTERSECT FAILED
      // THE MOVING BBOX POLYGON HAS MOVED PAST THE SHAPEFILE & CAN NO LONGER MUTATE IT
      console.log('CHUKIFY >> the moving bbox poly. has moved "out of bounds" of the working katana slice..');
   
      // KEEP TRACK OF THE SLICE EVEN IF THE MUTATION FAILS
      console.log(intersectModulusPoly);
      failedChunkSlicePoly = intersectModulusPoly;  
   }


   return {
      returnedMutatedSf,
      intersectModulusPoly,
      failedChunkSlicePoly
   }
}


function getChunkSlicePoly(originalShapefile, truncatedShapefile) {

   let chunkSlicePoly = turf.difference(getProps(originalShapefile)._geometry, getProps(truncatedShapefile)._geometry)

   if (chunkSlicePoly) {
      return chunkSlicePoly
   } else {
      // return ???
      console.log('where is this??');
   }
}