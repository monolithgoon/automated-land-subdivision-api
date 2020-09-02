// POLYGON CHUNKING v3.0 > BOUNDING BOX DECAY

import { map } from "./main.js"
import { GET_MAPBOX_POLYGON_LAYER, GET_LABEL_LAYER, CLEAR_LAYERS, RENDER_LAYER, RENDER_SIMPLE_SHAPEFILE } from "./mapbox-render.js"
import { RENDER_DATA } from "./dom-render.js";
import { _chunkify } from "./_chunkify.js";



const RENDERED_LAYERS = [];



export function getProps(geojson) {

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


export function calcArea(polygon) {
   return turf.area(polygon)/10000
}



function drawChunk(polygon, layerID, bufferAmt) {

   let presentationPolygon;
   
   if (bufferAmt) {
      
      // PREP. FOR PRESENTATION
      // THIS REMOVES THE "TAILS"  FROM THE CHUNKS 
      // FIXME > WHY IS THIS STEP EVEN NEEDED ?? 
      presentationPolygon = turf.buffer(polygon, bufferAmt, {unit: 'kilometers'}); 

      // SOMETIMES turf.buffer RETURNS "undefined" > DEAL WITH IT
      presentationPolygon = presentationPolygon ? presentationPolygon : polygon

      
   } else {

      presentationPolygon = polygon;

   }
   
   
   // GET THE CHUNK POLYGON LAYERS
   let polygonOutlineLayer = GET_MAPBOX_POLYGON_LAYER(presentationPolygon, {layerID, color: null, thickness: 2, fillOpacity: 0.1}).outlineLayer;
   let polygonFillLayer = GET_MAPBOX_POLYGON_LAYER(presentationPolygon, {layerID, color: null, thickness: 2, fillOpacity: 0.1}).fillLayer;


   // CREATE LABEL LAYER FOR POLYGON
   let chunkIndex = presentationPolygon.properties.chunk_index;   
   let chunkMagnitude = presentationPolygon.properties.chunk_size;
   let labelLayer = GET_LABEL_LAYER(presentationPolygon, chunkIndex, chunkMagnitude);
   
   
   // SAVE THE LAYERS
   RENDERED_LAYERS.push(polygonOutlineLayer)
   RENDERED_LAYERS.push(polygonFillLayer)
   RENDERED_LAYERS.push(labelLayer);

   
   // RENDER THE LAYERS
   RENDER_LAYER(map, polygonOutlineLayer)
   RENDER_LAYER(map, polygonFillLayer)
   RENDER_LAYER(map, labelLayer)            
}



export function GET_RENDERED_LAYERS() {
   return RENDERED_LAYERS;
}



// CANGE THE DIR. OF CHUNKIFICATION AFTER EACH KATANA SLICE OF THE ORG. SHAPEFILE
export function toggleChunkifyDir(direction) {
   if (direction === "east") {
      return direction = "west"
   } 
   else if (direction === "west") {
      return direction = "east"
   }
}



// MOVE THE BBOX POLYGON
export function moveBboxPolygon(dist, bboxPolygon, bearing) {

   let bearings = {north: 0, south: 180, east: 90, west: -90}

   let movedBboxPolygon = turf.transformTranslate(bboxPolygon, dist, bearings[bearing], {units: 'kilometers'}) // -> NORTH
   
   return movedBboxPolygon
}  


;
function chunkify(initDirection, newChunkifyDir, katanaSliceDirection, percentIngress, area, startingKatanaSlice, unslicedShapefile, startShapefileArea, movingBboxPolygon, idx ) {

               
   // INITIAL STATE
   let mutatedShapefile = startingKatanaSlice;

   // VAR. TO HOLD THE UNFINISHED CHUNK IN EACH WHILE LOOP
   let chunkSlicePolygon;

   // VAR. TO HOLD THE NEW KATANA SLICE THAT IS NEEDED AFTER OVERFLOWING THE INITIAL ONE..
   let newKatanaSlice
   
   // THE AREA EACH MOVEMENT OF THE BBOX POLY. CARVES OUT OF THE SHAPEFILE..
   let intersectSliceArea = startShapefileArea - calcArea(mutatedShapefile) // 0.0 ha. initially

   // INIT. STARTING POS. OF MOVING BBOX. POLY.
   let moveIncrement = 0;

   // SAVE THE IDX. IF THE CHUNKIFY ATTEMPT FAILS
   let failedAllocIdx;

   
   console.log(`Starting katana slice area: ${startShapefileArea}`); 

   
   while (intersectSliceArea.toFixed(1) <= area) {
      
      
      // MOVE THE BBOX POLY. BY A SMALL AMT.
      // CHECK ITS INTERSECT WITH THE SHAPEFILE
      // KEEP MOVING UNTIL THE INTERSECT IS == TO THE ALLOC.

      
      // GET AN INTERSECT POLY. THAT IS OFFSET FROM THE STARTING SHAPEFILE  BY SMALL INCREMENT..
      movingBboxPolygon = moveBboxPolygon(moveIncrement, movingBboxPolygon, initDirection)


      // SANDBOX > RENDER GUIDE LINES 
      // let layerID = `movingBboxPolygon${idx}`
      let layerID = 9000
      let movingBboxPolygonOutline = GET_MAPBOX_POLYGON_LAYER(movingBboxPolygon, {layerID, color: "orange", thickness: 1, fillOpacity: .1}).outlineLayer;
      RENDERED_LAYERS.push(movingBboxPolygonOutline)
      RENDER_LAYER(map, movingBboxPolygonOutline);


      // UPDATE THE MUTATED SHAPEFILE
      // THE "mutatedShapefile" IS THE INTERSECT BTW. MOVING BBOX. & THE KATANA SHAPEFILE
      mutatedShapefile = turf.intersect(getProps(startingKatanaSlice)._geometry, movingBboxPolygon)

      
      // SANDBOX > 
      // if (mutatedShapefile) {
      //    if (turf.getType(mutatedShapefile) === "GeometryCollection") {
      //       console.log(mutatedShapefile);
      //    };
      // };
      
      
      // FOR THE CURRENT allocArea, CHECK THAT THE BBOX POLY. STILL INTERSECTS WITH THE SHAPEFILE
      // AND CHECK THAT THE INTERSECT GIVES A VALID GEOMETRY (ie., A "POLYGON")
      if (mutatedShapefile && turf.getType(mutatedShapefile) === "Polygon") {


         // BECAUSE WE ARE IN A WHILE LOOP, THE VALUE OF chunkSlicePolygon KEEPS INCREASING
         // UNTIL THE if CONDITION ABOVE IS NOT LONGER MET..
         // WHEN THAT HAPPENS, THE "else if ()" BLOCK BELOW WILL RUN..
         // HOWEVER, IF THERE WASN'T MUTATION IN THE FIRST PLACE (ie., startingKatanaSlice WAS TOO SMALL TO INTERSECT),
         // THIS if BLOCK WILL FAIL, AND chunkSlicePolygon WILL REMAIN undefined
         
         console.log(turf.getType(mutatedShapefile));
         
         // console.log(mutatedShapefile);
         chunkSlicePolygon = turf.difference(getProps(startingKatanaSlice)._geometry, getProps(mutatedShapefile)._geometry)
         intersectSliceArea = startShapefileArea - calcArea(mutatedShapefile);

         
      } else if (chunkSlicePolygon) {


         // THE MOVING BBOX POLYGON HAS MOVED PAST THE SHAPEFILE & CAN NO LONGER MUTATE IT
         console.log('CHUKIFY >> the moving bbox poly. has moved "out of bounds.."');


         console.log(chunkSlicePolygon);
         // SLIGHTLY INCREASE THE SIZE OF THE TOO SMALL SLICE IN ORDER TO SUCCESSFULLY UNITE IT WITH ...
         // let tooSmallKatanaSlice = chunkSlicePolygon;
         // let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.001, {unit: 'kilometers'});
         let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.0005, {unit: 'kilometers'});
         // let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.00005, {unit: 'kilometers'});
         // let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.000005, {unit: 'kilometers'});


         let reunitedShapefile;


         // SANDBOX > HANDLE WIERD CHUNK SLICES 
         // if (turf.getType(tooSmallKatanaSlice) !==; "Polygon") {
         //    reunitedShapefile = unslicedShapefile;
         // } else {

         // // }

         

         // SANDBOX > 
         console.log(tooSmallKatanaSlice.geometry);
         console.log(unslicedShapefile.geometry);
         RENDER_SIMPLE_SHAPEFILE(turf.buffer(chunkSlicePolygon, 0.001, {unit: 'kilometers'}), {layerID: 9998, color: "cyan", thickness: 5, fillOpacity: 0.05});
         // RENDER_SIMPLE_SHAPEFILE(turf.buffer(tooSma;llKatanaSlice, 0.001, {unit: 'kilometers'}), {layerID: Math.random()*1998, color: "blue", thickness: 5, fillOpacity: 0.05});
         // RENDER_SIMPLE_SHAPEFILE(unslicedShapefile;, {layerID: 999, color: "purple", thickness: 5, fillOpacity: 0.09});


         // GET A NEW KATANA SLICE TO CHUNKIFY FROM THE UNION OF THE LEFTFOVER SHAPEFILE & THE "TOO SMALL" SLICE
         // ANALYZE THE TURF UNION, IF THE RESULT WILL BE A MULTIPOLYGON, DISCARD THE tooSmallKatanaSlice 
         // OR SAVE IT TO ASSIGN TO AN ALLOC. LATER;
         reunitedShapefile = turf.union(tooSmallKatanaSlice, unslicedShapefile);
         

         // DISCARD THE tooSmallKatanaSlice IF THE UNION IS NOT A POLYGON
         // FIXME > WHAT HAPPENS WITH THE DISCARDED SLICE??? 
         // if (turf.getType(reunitedShapefile) !== "Polygon") {
         //    RENDER_SIMPLE_SHAPEFILE(tooSmallKatana;Slice, {layerID: Math.random()*999, color: "yellow", thickness: 5, fillOpacity: 0.05});
         //    reunitedShapefile = unslicedShapefile;
         // }

         
         // SANDBOX > 
         console.log(reunitedShapefile);
         // RENDER_SIMPLE_SHAPEFILE(reunitedShapefile,; {layerID: 999, color: "yellow", thickness: 5, fillOpacity: 0.09});
         // RENDER_SIMPLE_SHAPEFILE(unslicedShapefile;, {layerID: 999, color: "grey", thickness: 5, fillOpacity: 0.09});

         // }
         

         // NEW SLICE OPERATION..
         // IF THE REMAINING SHAPEFILE IS LAST 25% OF ORIGINAL, DON'T SLICE..
         if (percentIngress < 0.25) {
            
            console.log("The remaining shapefile is too small to slice..");

            mutatedShapefile = reunitedShapefile

         } else {

            percentIngress = percentIngress - 0.15
            // percentIngress = percentIngress + 0.05
            console.log(`percent ingress: ${percentIngress}`);
            let katanaData = getKatanaSlice(katanaSliceDirection, percentIngress, reunitedShapefile);
            
   
            // THIS IS THE NEW SLICE
            mutatedShapefile = katanaData.annexedPolygon;
            // RENDER_SIMPLE_SHAPEFILE(mutatedShapefile, {layerID: Math.random()*5574, color: "green", thickness: 5, fillOpacity: 0.2});
            RENDER_SIMPLE_SHAPEFILE(mutatedShapefile, {layerID: 1002, color: "black", thickness: 4, fillOpacity: 0.002});
            // newKatanaSlice = katanaData.annexedPolygon; // TODO <
   
   
            // SANDBOX > 
            // mutatedShapefile = turf.intersect(getProps(startingKatanaSlice)._geometry, movingBboxPolygon)   
            // chunkSlicePolygon = turf.difference(getProps(startingKatanaSlice)._geometry, getProps(mutatedShapefile)._geometry)
            // intersectSliceArea = startShapefileArea - calcArea(mutatedShapefile);
      
   
            // KEEP TRACK OF T;HE LEFTOVER SHAPEFILE FROM THE NEW SLICE OPERATION
            unslicedShapefile = katanaData.leftoverPolyg;on
            // RENDER_SIMPLE_SHAPEFILE(unslicedShapefile;, {layerID: 1000, color: "pink", thickness: 5, fillOpacity: 0.05});
         }


         // CHUNKIFY FROM THE OPPOSITE DIRECTION
         // newChunkifyDir = initDirection;
         newChunkifyDir = toggleChunkifyDir(initDirection)
         
         
         // FIXME > 
         // ZERO OUT THE SLICE POLY.
         // chunkSlicePolygon = {};
         console.log(idx + 1);
         failedAllocIdx = idx;
         chunkSlicePolygon = null;


         // FIXME > 
         break

      } else {

         console.log(`***Try reducing this allocation [[ ${idx} ]] a little bit`);
         break;
      }
      
      
      // UPDATE THE BBOX POLYGON'S POSITION
      // UNDESIREABLE GEOMETRY INTERSECTS ("GeometryCollection") WILL OCCUR WHEN THIS NUMBER IS TOO SMALL
      // IMPORTANT 
      // moveIncrement += 0.0009; // USE FOR SMALL SHAPEFILES (<25 ha.)
      // moveIncrement += 0.0005; // USE FOR MEDIUM SHAPEFILES (<50 ha.) ***
      moveIncrement += 0.0003; // USE FOR MEDIUM SHAPEFILES (<50 ha.)
      // moveIncrement += 0.0002; // USE FOR 
      // moveIncrement += 0.0001; // USE FOR LARGE SHAPEFILES (>100 ha.)
   }
   
   // @ END OF WHILE LOOP => THE AREA OF SLICE ~= AREA OF DESIRED CHUNK
   let chunkPolygon = chunkSlicePolygon;
   
   
   // ADD CUSTOM PROPERTIES
   if (chunkPolygon) {
      chunkPolygon.properties['chunk_idx'] = idx + 1;
      chunkPolygon.properties['chunk_id'] = `nirsal-agc-code-xxx-unique-chunk-id-${(Math.random()*99999*idx).toFixed(0)}`;
      chunkPolygon.properties['chunk_size'] = area.toFixed(1);    
      chunkPolygon.properties['farmer_id'] = `unique-farmer-id-${(Math.random()*99999*idx).toFixed(0)}` 
   }


   // DRAW THE CHUNK ON THE MAP
   // drawChunk(chunkPolygon, idx);
   
   
   // "RECURSION"
   // THE ALLOCATIONS "FOR" LOOP WILL EVALUATE A SMALLER SHAPE WITH EACH ITERATION
   return {
      chunkPolygon,
      mutatedShapefile,
      newChunkifyDir,
      unslicedShapefile,   
      percentIngress,
      failedAllocIdx,
   };
}



export function getKatanaSlice(direction, percentage, shapefile) {
   // RENDER_LAYER(map, GET_MAPBOX_POLYGON_LAYER(shapefile, {layerid: "fuckIloanusi", color: "black", thickness: 4, fillOpacity: 0.1}).outlineLayer)

   const shapefileArea = calcArea(shapefile);
   let areaToAnnex = shapefileArea * percentage
            
   // INITIAL STATE
   // let annexedPolygon = shapefile
   let annexedPolygon = {};

   let movingBboxPolygon = getProps(shapefile)._bboxPolygon

   // VAR. TO HOLD THE UNFINISHED CHUNK IN EACH WHILE LOOP
   let shapefileSlicePolygon;
   
   // THE AREA EACH MOVEMENT OF THE BBOX POLY. CARVES OUT OF THE SHAPEFILE..
   // let intersectSliceArea = shapefileArea - calcArea(annexedPolygon) // 0.0 ha. initially
   let intersectSliceArea = 0 // 0.0 ha. initially

   // INIT. STARTING POS. OF MOVING BBOX. POLY.
   let moveIncrement = 0;
   
   
   while (intersectSliceArea.toFixed(1) <= areaToAnnex) {
      
      // MOVE THE BBOX POLY. BY A SMALL AMT.
      // CHECK ITS INTERSECT WITH THE SHAPEFILE
      // KEEP MOVING UNTIL THE INTERSECT IS === TO THE DESIRED AREA

      
      // GET AN INTERSECT POLY. THAT IS OFFSET FROM THE STARTING SHAPEFILE BY SMALL INCREMENT..
      movingBboxPolygon = moveBboxPolygon(moveIncrement, movingBboxPolygon, direction)


      // THE annexedPolygon IS THE INTERSECT BTW. MOVING BBOX. & THE SHAPEFILE
      annexedPolygon = turf.intersect(getProps(shapefile)._geometry, movingBboxPolygon)


      // FOR THE CURRENT areaToAnnex, ENSURE THE BBOX POLY. STILL INTERSECTS WITH THE SHAPEFILE, ie., annexedPolygon IS VALID
      // AND CHECK THAT THE MOVING BBOX. DIDN'T NOT CREATE AN ANNEXED POLY. WITH SPLIT GEOMETRY (i.e., a "MultyPolygon")
      // if (annexedPolygon) {

      //    // RENDER_LAYER(map, GET_MAPBOX_POLYGON_LAYER(annexedPolygon, {layerID: "fuckIloanusi", color: "green", thickness: 1, fillOpacity: 0.3}).outlineLayer)
      //       console.log(annexedPolygon);
      // }         
      if (annexedPolygon && turf.getType(annexedPolygon) === "Polygon") { 
      // if (annexedPolygon) {

         // GET THE AREA OF THE NEW SLICE
         intersectSliceArea = shapefileArea - calcArea(annexedPolygon);

         shapefileSlicePolygon = turf.difference(getProps(shapefile)._geometry, getProps(annexedPolygon)._geometry)


      } else if (annexedPolygon && turf.getType(annexedPolygon) !== "Polygon") {


         // THE MOVING BBOX POLYGON INTERSECT WITH SHAPEFILE IS CREATING A MULTIPOLYGON
         // PROBABLY CAUSED BY INTERSECTING A CONCAVE GEOMETRY
         console.log(`Your K. SLICE bbox. polygon is creating a wierd MultiPolygon intersect with the shapefile..`);
         
         
         // REDUCE THE % INGRESS BY 5f%..
         // RE-START THE KATANA SLICING PROCESS FROM THE TOP..
         percentage = percentage - 0.05
         getKatanaSlice(direction, percentage, shapefile)
         // console.log(intersectSliceArea.toFixed(1));
         // console.log(areaToAnnex.toFixed(1));

         
      } else {
         
         // THE MOVING BBOX POLYGON HAS MOVED PAST THE SHAPEFILE & CAN NO LONGER MUTATE IT
         console.log('K. SLICE >> the moving bbox poly. has moved "out of bounds.."');
         console.log('Check that your "reunitedShapefile" is not a MultiPolygon');

         // FIXME > 
         // ZERO OUT THE SLICE POLY.
         // shapefileSlicePolygon = {};
         shapefileSlicePolygon = null;
         
         break
      }
      
      
      // UPDATE POSITION OF THE SLICING MOVING BBOX.
      // moveIncrement += 0.02;
      // moveIncrement += 0.01; // ***
      // moveIncrement += 0.001;
      // moveIncrement += 0.0005;
      moveIncrement += 0.00001; // *****
   }
   
   // @ END OF WHILE LOOP => THE AREA OF SLICE ~= AREA OF DESIRED CHUNK
   // let leftoverPolygon = shapefileSlicePolygon;
   let leftoverPolygon = turf.buffer(shapefileSlicePolygon, -0.00005, {unit: 'kilometers'});
   
   
   // ADD CUSTOM PROPERTIES
   // leftoverPolygon.properties['chunk_idx'] = idx + 1;
   // leftoverPolygon.properties['chunk_size'] = area.toFixed(1);


   // SANDBOX > RENDER GUIDE LINES 
   // let layerID = `katanaMovingBboxPolygon_${Math.random()*1985}`
   let layerID = `katanaMovingBboxPolygon1985`
   let movingBboxPolygonOutline = GET_MAPBOX_POLYGON_LAYER(movingBboxPolygon, {layerID, color: "red", thickness: 0.5, fillOpacity: .1}).outlineLayer;
   RENDERED_LAYERS.push(movingBboxPolygonOutline);
   RENDER_LAYER(map, movingBboxPolygonOutline);


   // DRAW THE CHUNK ON THE MAP
   // drawChunk(leftoverPolygon, idx);
   
   
   return {
      annexedPolygon,
      leftoverPolygon
   };
}



export function RENDER_MOVING_FRAMES_CHUNKS (SELECTED_SHAPEFILE, FARM_ALLOCATIONS) {


   // SAVE THE PROCESSED GEOJSON CHUNKS FROM "CHUNKIFY"
   let PROCESSED_CHUNKS = [];


   // IMPORTANT 
   let workingShapefile = SELECTED_SHAPEFILE;


   // CLEAR PREVIOUS RENDERED LAYERS
   if (RENDERED_LAYERS.length > 0) {
      CLEAR_LAYERS(map, RENDERED_LAYERS)
   }


   try {
      
      // SLICE THE MAIN SHAPEFILE INTO "LARGE" SECTIONS >>
      // ANNEX A 15% SECTION OF THE ORIGINAL SHAPEFILE && USE THAT FOR CHUNKING
      let percentIngress = 0.85;
      // let percentIngress = 0.5;

      let katanaSliceDirection = "south"

      let katanaData = getKatanaSlice(katanaSliceDirection, percentIngress, SELECTED_SHAPEFILE)

      workingShapefile = katanaData.annexedPolygon; // IMPORTANT
      // workingShapefile = SELECTED_SHAPEFILE;
      let unslicedShapefile = katanaData.leftoverPolygon


      // IMPORTANT
      let newChunkifyDir;


      for (let idx = 0; idx < FARM_ALLOCATIONS.length; idx++) {


         // CHUNKING BASELINE VARIABLES
         const orgBboxPolygon = getProps(workingShapefile)._bboxPolygon
         const startShapefileArea = calcArea(workingShapefile);
         const allocArea = FARM_ALLOCATIONS[idx];
         
            
         // INIT. THE START POSITION OF THE MOVING BBOX. POLYGON
         let movedBboxPolygon = orgBboxPolygon;


         // SET THE DIRECTION TO CHUNKIFY
         let chunkifyDirection = newChunkifyDir ? newChunkifyDir : "west"
        

         // let chunkifyData = chunkify(chunkifyDirection, newChunkifyDir, katanaSliceDirection, percentIngress, allocArea, workingShapefile, unslicedShapefile, startShapefileArea, movedBboxPolygon, idx);
         let chunkifyData = _chunkify({allocArea, chunkifyDirection, newChunkifyDir, workingShapefile, katanaSliceDirection, percentIngress, unslicedShapefile, idx})


         // SANDBOX > 
         // DID THIS LOOP ELEMENT FAIL TO BE ALLOCATED?? PUSH IT BACK INTO THE ARRAY..
         let failedAlloc = FARM_ALLOCATIONS[chunkifyData.failedAllocIdx];
         
         // if (chunkifyData.failedAllocIdx) { // THIS CHECK WON'T WORK IF THE idx === 0
         if (chunkifyData.failedAllocIdx !== null) {

            if( chunkifyData.failedAllocIdx !== undefined) {

               FARM_ALLOCATIONS.push(failedAlloc)
               console.log(failedAlloc);
            }
         } 

         
         // SAVE && RENDER THE CHUNK
         let processedChunk = chunkifyData.chunkPolygon;
         
         if (processedChunk) {

            // DRAW THE CHUNK ON THE MAP
            drawChunk(processedChunk, idx, -0.005)
            // drawChunk(processedChunk, idx)

            // SAVE FOR RENDERING ON DOM
            PROCESSED_CHUNKS.push(processedChunk)
         }

         
         // RESET THE WORKING SHAPEFILE FOR THE NEXT for LOOP ITERATION..
         workingShapefile = chunkifyData.mutatedShapefile;
         unslicedShapefile = chunkifyData.unslicedShapefile;
         
         
         // CHANGE THE CHUNKIFY DIRECTION WITH EACH NEW KATANA SLICE
         // THIS COND. ONLY OCCURS WHEN THE "ELSE" BLOCK IN CHUNKIFY IS REACHED
         newChunkifyDir = chunkifyData.newChunkifyDir
         console.log(newChunkifyDir);


         // TODO > UNDERSTAND WHAT'S HAPPENING HERE ..
         percentIngress = chunkifyData.percentIngress;

      }
      
      
      // DEAL WITH ANY LEFTOVER LAND
      let unusedKatanaSlice = workingShapefile
      let unusedShapefile = unslicedShapefile
      let unallocatedLand;
      let unallocatedLandArea;

     if (unusedKatanaSlice && !unusedShapefile) {
         
         unallocatedLand = unusedKatanaSlice;
         unallocatedLandArea = turf.area(unallocatedLand) / 10000
         console.log(unallocatedLandArea.toFixed(1));

      } else if (!unusedKatanaSlice && unusedShapefile) {

         unallocatedLand = unusedShapefile;
         unallocatedLandArea = turf.area(unallocatedLand) / 10000
         console.log(unallocatedLandArea.toFixed(1));

      } else if (unusedKatanaSlice && unusedShapefile) {
      // FIXME > "unusedShapefile" / "unslicedShapefile" IS NOT ACCURATE  

         // unallocatedLand = turf.union(unusedKatanaSlice, unusedShapefile) 
         unallocatedLand = unusedKatanaSlice; // REMOVE < 

         // CHECK IF turf.union RETURNS VALID VALUE
         if (unallocatedLand) {
   
            // RENDER_SIMPLE_SHAPEFILE(unusedKatanaSlice, {layerID: "fuckChioma1985", color: "black", thickness: 5, fillOpacity: .5})
            // RENDER_SIMPLE_SHAPEFILE(unusedShapefile, {layerID: Math.random()*9998, color: "pink", thickness: 5, fillOpacity: 0.05});
            // RENDER_SIMPLE_SHAPEFILE(unallocatedLand, {layerID: 9998, color: "pink", thickness: 5, fillOpacity: 0.05});
            // RENDER_SIMPLE_SHAPEFILE(unallocatedLand, {layerID: Math.random()*64450, color: "white", thickness: 5, fillOpacity: 0.05});
            
            unallocatedLandArea = turf.area(unallocatedLand) / 10000
   
            console.log(unallocatedLandArea.toFixed(1));
         }
         
      } 

      
      
      // DRAW THE CHUNKS ON THE MAP
      {      
         // chunks.forEach((chunkPolygon, index) => {
         //             console.log('fuck chioma iloanusi!');

         //       setTimeout(drawChunk(chunkPolygon, index), 2000 * (index + 1));
         //       // (function delayedDraw(chunkPolygon) {
         //       //    setTimeout( ()=> {
                     
         //             // drawChunk(chunkPolygon, index);
         //       //    }, 2000)
         //       // }(index));
         //    });
      }


      // RENDER THE CHUNKS DATA IN THE DOM
      let CHUNKS_COLLECTION = turf.featureCollection(PROCESSED_CHUNKS)
      console.log(CHUNKS_COLLECTION);
      RENDER_DATA({unallocatedLandArea, PROCESSED_CHUNKS})

   
   } catch(err) {
      // console.error(err.name, err.pt);
      console.error(err);
   }
}