const turf = require('@turf/turf');
const { _getProps, _calcArea, _moveBboxPolygon, _toggleChunkifyDir } = require("./_utils.js")
const { _newKatanaSliceOperation } = require("./_newKatanaSliceOp.js")



exports._chunkify = function(allocationsMetadata, {
   initChunkifyDir, 
   newChunkifyDir, 
   katanaSliceDir, 
   percentIngress, 
   workingShapefile, 
   pendingShapefile, 
   startShapefileArea, 
   movingBboxPolygon, 
   idx 
}) {

   const allocationSize = allocationsMetadata.allocSize
   
   // INITIAL STATE
   // THE "mutatedShapefile" IS THE INTERSECT BTW. MOVING BBOX. & THE KATANA SHAPEFILE
   let mutatedShapefile = workingShapefile;
   
   // VAR. TO HOLD THE UNFINISHED CHUNK IN EACH WHILE LOOP
   let chunkSlicePolygon;
   
   // VAR. TO HOLD THE NEW KATANA SLICE THAT IS NEEDED AFTER OVERFLOWING THE INITIAL ONE..
   let newKatanaSlice
   
   // THE AREA EACH MOVEMENT OF THE BBOX POLY. CARVES OUT OF THE SHAPEFILE..
   let intersectSliceArea = startShapefileArea - _calcArea(mutatedShapefile) // 0.0 ha. initially

   // INIT. STARTING POS. OF MOVING BBOX. POLY.
   let moveIncrement = 0;

   // SAVE THE IDX. IF THE CHUNKIFY ATTEMPT FAILS
   let failedAllocIdx;

   // THESE CHUNKS CANNOT BE USED TO UNITE WITH "pendingShapefile" BCOS. THEY FORM MultiPolygon UNIONS
   let discardedKatanaChunk;
   let discardedKatanaChunkArea;

   
   // console.log(`Starting katana slice area: ${startShapefileArea}`); 

   
   while (intersectSliceArea.toFixed(1) <= allocationSize) {

      let reunitedShapefile;
      
      
      // MOVE THE BBOX POLY. BY A SMALL AMT.
      // CHECK ITS INTERSECT WITH THE SHAPEFILE
      // KEEP MOVING UNTIL THE INTERSECT IS == TO THE ALLOC.

      
      // GET AN INTERSECT POLY. THAT IS OFFSET FROM THE STARTING SHAPEFILE  BY SMALL INCREMENT..
      movingBboxPolygon = _moveBboxPolygon(moveIncrement, movingBboxPolygon, initChunkifyDir)


      // UPDATE THE MUTATED SHAPEFILE
      // THE "mutatedShapefile" IS THE INTERSECT BTW. MOVING BBOX. & THE KATANA SHAPEFILE
      mutatedShapefile = turf.intersect(_getProps(workingShapefile)._geometry, movingBboxPolygon)

      
      // SANDBOX > 
      // if (mutatedShapefile) {
      //    if (turf.getType(mutatedShapefile) === "GeometryCollection") {
            // console.log(mutatedShapefile);
      //    };
      // };
      
      
      // FOR THE CURRENT allocationSize, CHECK THAT THE BBOX POLY. STILL INTERSECTS WITH THE SHAPEFILE
      // AND CHECK THAT THE INTERSECT GIVES A VALID GEOMETRY (ie., A "POLYGON")
      if (mutatedShapefile && turf.getType(mutatedShapefile) === "Polygon") {


         // BECAUSE WE ARE IN A WHILE LOOP, THE VALUE OF chunkSlicePolygon KEEPS INCREASING
         // UNTIL THE if CONDITION ABOVE IS NOT LONGER MET..
         // WHEN THAT HAPPENS, THE "else if ()" BLOCK BELOW WILL RUN..
         // HOWEVER, IF THERE WASN'T MUTATION IN THE FIRST PLACE (ie., workingShapefile WAS TOO SMALL TO INTERSECT),
         // THIS if BLOCK WILL FAIL, AND chunkSlicePolygon WILL REMAIN undefined
         
         // console.log(turf.getType(mutatedShapefile));
         
         // console.log(mutatedShapefile);
         chunkSlicePolygon = turf.difference(_getProps(workingShapefile)._geometry, _getProps(mutatedShapefile)._geometry)
         intersectSliceArea = startShapefileArea - _calcArea(mutatedShapefile);

         
      } else if (chunkSlicePolygon) {


         // THE MOVING BBOX POLYGON HAS MOVED PAST THE SHAPEFILE & CAN NO LONGER MUTATE IT
         // console.log('CHUKIFY >> the moving bbox poly. has moved "out of bounds.."');


         // console.log(chunkSlicePolygon);
         // SLIGHTLY INCREASE THE SIZE OF THE TOO SMALL SLICE IN ORDER TO SUCCESSFULLY UNITE IT WITH ...
         // let tooSmallKatanaSlice = chunkSlicePolygon;
         let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.005, {unit: 'kilometers'}); // **
         // let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.001, {unit: 'kilometers'});
         // let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.0009, {unit: 'kilometers'});
         // let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.0005, {unit: 'kilometers'}); // ****
         // let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.00005, {unit: 'kilometers'});
         // let tooSmallKatanaSlice = turf.buffer(chunkSlicePolygon, 0.000005, {unit: 'kilometers'});


         // let reunitedShapefile;


         // SANDBOX > HANDLE WIERD CHUNK SLICES 
         // if (turf.getType(tooSmallKatanaSlice) !== "Polygon") {
         //    reunitedShapefile = pendingShapefile
         // }
         // } else {

         // // }


         // CHECK THAT THERE IS STILL pendingShapefile REMAINING > WE HAVE NOT REACHED END OF THE ORG. SF.
         if (pendingShapefile) {
            
            
               // SANDBOX > 
            // console.log(tooSmallKatanaSlice.geometry);
            // console.log(pendingShapefile.geometry);
            
            // GET A NEW KATANA SLICE TO CHUNKIFY FROM THE UNION OF THE LEFTFOVER SHAPEFILE & THE "TOO SMALL" SLICE
            // ANALYZE THE TURF UNION, IF THE RESULT WILL BE A MULTIPOLYGON, DISCARD THE tooSmallKatanaSlice 
            // OR SAVE IT TO ASSIGN TO AN ALLOC. LATER
            reunitedShapefile = turf.union(tooSmallKatanaSlice, pendingShapefile);
            

            // DISCARD THE tooSmallKatanaSlice IF THE UNION CANNOT FORM A POLYGON
            if (turf.getType(reunitedShapefile) !== "Polygon") {
               
               discardedKatanaChunk = tooSmallKatanaSlice;

               discardedKatanaChunkArea = _calcArea(tooSmallKatanaSlice)
               
               // ADD CUSTOM PROPERTIES
               discardedKatanaChunk.properties['chunk_size'] = _calcArea(discardedKatanaChunk);
               
               reunitedShapefile = pendingShapefile;
            }

            
            // SANDBOX > 
            // console.log(reunitedShapefile);                        

            // CONDUCT A NEW K. SLICE OPERATION..
            let newKSliceData = _newKatanaSliceOperation(percentIngress, katanaSliceDir, reunitedShapefile);
            
            
            // UPDATE THE CHUNKIFY VARABLES
            mutatedShapefile = newKSliceData.mutatedSf      
            pendingShapefile = newKSliceData.unslicedSf
            percentIngress = newKSliceData.newPercentIngress
            
            
            // CHUNKIFY FROM THE OPPOSITE DIRECTION
            // newChunkifyDir = initChunkifyDir;
            newChunkifyDir = _toggleChunkifyDir(initChunkifyDir)
            
            
            // TRACK THE FAILED ALLOC.
            // console.log(idx + 1);
            failedAllocIdx = idx;

                        // FIXME > ZERO OUT THE SLICE POLY.
            chunkSlicePolygon = null;
            
            
            break
            
         
         // this is the last piece of the original sf.
         } else if (!pendingShapefile) {
            
            // chunkify the tooSmallKatanaSlice
            mutatedShapefile = tooSmallKatanaSlice;

            // // REMOVE > 
            // percentIngress = 0

            break
         }

      } else {

         // THE MOVING BBOX POLYGON HAS NOT MOVED PAST THE K. SLICE, BUT THE REMAINING SLICE IS TOO SMALL TO BE MUTATED..
         // console.log(chunkSlicePolygon);
         // console.log(reunitedShapefile);
         // console.log(percentIngress);
         // console.log(pendingShapefile);
         // console.log('***The remaining katana slice is too tiny even for the moving frames..');
         // console.log(`***Try reducing this allocation [[ ${idx+1} ]] a little bit`);


         // CONDUCT A NEW K. SLICE OPERATION

         // SINCE THERE IS NO "tooSmallKatanaSlice", THERE IS NOTHING TO UNITE
         reunitedShapefile = pendingShapefile;

         // GET A NEW KATANA SLICE
         let newKSliceData = _newKatanaSliceOperation(percentIngress, katanaSliceDir, reunitedShapefile);
         
         // UPDATE THE CHUNKIFY VARABLES
         mutatedShapefile = newKSliceData.mutatedSf      
         pendingShapefile = newKSliceData.unslicedSf
         percentIngress = newKSliceData.newPercentIngress

         // TRACK THE FAILED ALLOC.
         failedAllocIdx = idx;
         
         break;
      }
      
      
      // UPDATE THE BBOX POLYGON'S POSITION
      // UNDESIREABLE GEOMETRY INTERSECTS ("GeometryCollection") WILL OCCUR WHEN THIS NUMBER IS TOO SMALL
      // IMPORTANT 
      // moveIncrement += 0.001; // USE FOR TINY SHAPEFILES (<10 ha.)
      // moveIncrement += 0.0009; // USE FOR SMALL SHAPEFILES (<25 ha.)
      // moveIncrement += 0.0005; // USE FOR MEDIUM SHAPEFILES (<50 ha.) **
      moveIncrement += 0.0003; // USE FOR MEDIUM SHAPEFILES (<50 ha.) ***
      // moveIncrement += 0.0002; // USE FOR ..
      // moveIncrement += 0.0001; // USE FOR LARGE SHAPEFILES (>100 ha.)
   }
   
   // @ END OF WHILE LOOP => THE AREA OF SLICE ~= AREA OF DESIRED CHUNK
   let chunkPolygon = chunkSlicePolygon;
   
   
   // ADD CUSTOM PROPERTIES
   if (chunkPolygon) {
      chunkPolygon.properties['chunk_index'] = idx + 1;
      chunkPolygon.properties['chunk_id'] = `${allocationsMetadata.agcID}-${(Math.random()*9999*(idx+1)).toFixed(0)}`;
      chunkPolygon.properties['chunk_size'] = allocationSize.toFixed(1);
      chunkPolygon.properties['owner_id'] = `${allocationsMetadata.farmerID}`
      chunkPolygon.properties['owner_name'] = `${allocationsMetadata.firstName} ${allocationsMetadata.lastName}` 
      chunkPolygon.properties['owner_photo_url'] = `${allocationsMetadata.ownerPhotoURL}` 
      chunkPolygon.properties['center_lng'] = turf.centerOfMass(chunkPolygon).geometry.coordinates[0];
      chunkPolygon.properties['center_lat'] = turf.centerOfMass(chunkPolygon).geometry.coordinates[1];
   }
   
   
   // "RECURSION"
   // THE ALLOCATIONS "FOR" LOOP WILL EVALUATE A SMALLER SHAPE WITH EACH ITERATION
   return {
      chunkPolygon,
      mutatedShapefile,
      newChunkifyDir,
      pendingShapefile,   
      percentIngress,
      failedAllocIdx,
      discardedKatanaChunk,      
      discardedKatanaChunkArea,      
   };
}