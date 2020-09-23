// POLYGON CHUNKING v3.0 > BOUNDING BOX DECAY ALGORITHM
const chalk = require('../../../utils/chalk-messages');
const turf = require('@turf/turf')
const { _getProps, _calcArea } = require('./_utils.js');
const { _getKatanaSlice } = require('./_getKatanaSlice.js');
const { _chunkify } = require('./_chunkify.js')



// DEAL WITH ANY LEFTOVER LAND
function calcUnallocatedLandArea(unusedKatanaSlice, unusedShapefile, discardedChunksAreas) {

   // console.log(discardedChunksAreas);
   let totalDiscardedArea = discardedChunksAreas.reduce((sum, discardedArea) => sum + discardedArea, 0)

   totalDiscardedArea = totalDiscardedArea === 0 ? 0 : totalDiscardedArea;

   let unallocatedLandArea;
   
   if (unusedKatanaSlice && !unusedShapefile) {
   
      unallocatedLandArea = _calcArea(unusedKatanaSlice) + totalDiscardedArea
      // console.log(unallocatedLandArea.toFixed(1));

   } else if (!unusedKatanaSlice && unusedShapefile) {

      unallocatedLandArea = _calcArea(unusedShapefile) + totalDiscardedArea
      // console.log(unallocatedLandArea.toFixed(1));

   } else if (unusedKatanaSlice && unusedShapefile) {

      unallocatedLandArea = _calcArea(unusedKatanaSlice) + _calcArea(unusedShapefile) + totalDiscardedArea

      // console.log(unallocatedLandArea.toFixed(1));
   };

   return unallocatedLandArea;
}



// ALGORITHM STARTING POINT
exports.PARCELIZE_SHAPEFILE = function RENDER_MOVING_FRAMES_CHUNKS (SELECTED_SHAPEFILE, FARM_ALLOCATIONS, shapefileID, shapefileLocation, {katanaSliceDirection, chunkifyDirection}) {
   
   try {

      // SAVE THE PROCESSED GEOJSON CHUNKS FROM "CHUNKIFY"
      const PROCESSED_CHUNKS = [];


      // GET THE TOTAL ALLOC. HECTARES
      const allocationTotal = FARM_ALLOCATIONS.reduce((allocation, sum) => sum + allocation);


      // VAR. TO KEEP TRACK OF DISCARDED CHUNKIFY POLYGONS
      const DISCARDED_KATANA_CHUNKS = [];
      const DISCARDED_KATANA_CHUNKS_AREAS = [];


      // SLICE THE MAIN SHAPEFILE INTO "LARGE" SECTIONS >>
      // ANNEX A 20% SECTION OF THE ORIGINAL SHAPEFILE && USE THAT FOR CHUNKING
      let percentIngress = 0.80;
      // let percentIngress = 0.5;


      // SET THE DIR. TO CUT WORKING SHAPEFILES
      const katanaSliceDir = katanaSliceDirection


      // GET THE WORKING SHAPEFILE
      let katanaData = _getKatanaSlice(katanaSliceDir, percentIngress, SELECTED_SHAPEFILE)
      let pendingShapefile = katanaData.leftoverPolygon
      let workingShapefile = katanaData.annexedPolygon; // IMPORTANT
      // let workingShapefile = SELECTED_SHAPEFILE;


      // IMPORTANT
      let newChunkifyDir;


      for (let idx = 0; idx < FARM_ALLOCATIONS.length; idx++) {


         // CHUNKING BASELINE VARIABLES
         const orgBboxPolygon = _getProps(workingShapefile)._bboxPolygon
         const startShapefileArea = _calcArea(workingShapefile);
         const allocArea = FARM_ALLOCATIONS[idx];
         
            
         // INIT. THE START POSITION OF THE MOVING BBOX. POLYGON
         let movingBboxPolygon = orgBboxPolygon;


         // SET THE DIRECTION TO CHUNKIFY
         // let initChunkifyDir = newChunkifyDir ? newChunkifyDir : movingFrameOptions.chunkifyDirection;
         let initChunkifyDir = newChunkifyDir ? newChunkifyDir : chunkifyDirection;
        

         let chunkifyData = _chunkify({initChunkifyDir, newChunkifyDir, katanaSliceDir, percentIngress, allocArea, workingShapefile, pendingShapefile, startShapefileArea, movingBboxPolygon, idx});


         // RETURN THE DISCARDED KATANA CHUNKS
         if (chunkifyData.discardedKatanaChunk) {
            DISCARDED_KATANA_CHUNKS.push(chunkifyData.discardedKatanaChunk);
            DISCARDED_KATANA_CHUNKS_AREAS.push(chunkifyData.discardedKatanaChunkArea);
         }


         // DID THIS LOOP ELEMENT FAIL TO BE ALLOCATED?? PUSH IT BACK INTO THE ARRAY..
         let failedAlloc = FARM_ALLOCATIONS[chunkifyData.failedAllocIdx];
         
         // if (chunkifyData.failedAllocIdx) { // THIS CHECK WON'T WORK IF THE idx === 0
         if (chunkifyData.failedAllocIdx !== null) {

            if( chunkifyData.failedAllocIdx !== undefined) {

               FARM_ALLOCATIONS.push(failedAlloc)
               // console.log(failedAlloc);
            }
         } 

         
         // GET THE CHUNK
         let processedChunk = chunkifyData.chunkPolygon;
         

         // SAVE THE CHUNK
         if (processedChunk) {

            PROCESSED_CHUNKS.push(processedChunk)
         }

         
         // RESET THE WORKING SHAPEFILE FOR THE NEXT for LOOP ITERATION..
         workingShapefile = chunkifyData.mutatedShapefile
         pendingShapefile = chunkifyData.pendingShapefile
         
         
         // CHANGE THE CHUNKIFY DIRECTION WITH EACH NEW KATANA SLICE
         // THIS COND. ONLY OCCURS WHEN THE "else if()" BLOCK IN _chunkify.js IS REACHED
         newChunkifyDir = chunkifyData.newChunkifyDir
         // console.log(newChunkifyDir);


         // KEEP TRACK OF THE INGRESS B.COS _chunkify ALSO CALLS _getKatanaSlice
         percentIngress = chunkifyData.percentIngress;

      }
      
      
      // DEAL WITH ANY LEFTOVER LAND
      let unallocatedLandArea = calcUnallocatedLandArea(workingShapefile, pendingShapefile, DISCARDED_KATANA_CHUNKS_AREAS);


      // CREATE A FEATURE COLLECTION OF ALL THE CHUNKS
      const CHUNKS_COLLECTION = turf.featureCollection(PROCESSED_CHUNKS);

      
      // CREATE & APPEND CUSTOM PROPERTIES
      CHUNKS_COLLECTION['properties'] = {
         'agc_id': shapefileID, 
         'agc_center_coords': turf.centerOfMass(SELECTED_SHAPEFILE),
         'location': shapefileLocation,
         'num_farmers': CHUNKS_COLLECTION.features.length,
         'agc_area' : _calcArea(SELECTED_SHAPEFILE),
         'total_allocation' : allocationTotal,
         'unused_land_area' : unallocatedLandArea,
      }
      console.log(CHUNKS_COLLECTION);


      // RETURN THE PARCELIZATION RESULT
      return CHUNKS_COLLECTION
   
   } catch(err) {
      console.error(chalk.fail(err.message));
   }
}