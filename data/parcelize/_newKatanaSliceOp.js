const { _getKatanaSlice } = require('./_getKatanaSlice.js');


function _newKatanaSliceOperation(percentIngress, kSliceDir, reunitedSf) {

   let mutatedSf, unslicedSf, newPercentIngress

   // IF THE REMAINING SHAPEFILE IS LAST 25% OF ORIGINAL, DON'T SLICE..
   if (percentIngress < 0.25) {
            
      console.log("The remaining shapefile is too small to slice..");

      mutatedSf = reunitedSf

   } else {
      
      newPercentIngress = percentIngress - 0.10
      // percentIngress = percentIngress + 0.05
      console.log(`percent ingress: ${newPercentIngress}`);


      let katanaData = _getKatanaSlice(kSliceDir, newPercentIngress, reunitedSf);
      

      // THIS IS THE NEW SLICE
      mutatedSf = katanaData.annexedPolygon;
      // newKatanaSlice = katanaData.annexedPolygon; // TODO <


      // SANDBOX > 
      // mutatedSf = turf.intersect(getProps(startingKatanaSlice)._geometry, movingBboxPolygon)   
      // chunkSlicePolygon = turf.difference(getProps(startingKatanaSlice)._geometry, getProps(mutatedSf)._geometry)
      // intersectSliceArea = startShapefileArea - calcArea(mutatedSf);


      // KEEP TRACK OF THE LEFTOVER SHAPEFILE FROM THE NEW SLICE OPERATION
      unslicedSf = katanaData.leftoverPolygon
   }

   return {
      mutatedSf,
      unslicedSf,
      newPercentIngress,
   }  
}


module.exports = _newKatanaSliceOperation;