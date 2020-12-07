const { _getKatanaSlice } = require('./_getKatanaSlice.js');


exports._newKatanaSliceOperation = function (percentIngress, kSliceDir, reunitedSf) {

   let mutatedSf, unslicedSf, newPercentIngress

      // DON'T SLICE THE REMAINING SHAPEFILE IF THE % INGRESS HAS BECOME LESS THAN 25% > USE SF. AS IS..
      if (percentIngress < 0.40) {
            
      console.log("The remaining shapefile is too small to slice..");

      mutatedSf = reunitedSf

   } else {
      
      newPercentIngress = percentIngress - 0.15
      // percentIngress = percentIngress + 0.05
      console.log(`percent ingress: ${newPercentIngress}`);


      let katanaData = _getKatanaSlice(kSliceDir, newPercentIngress, reunitedSf);
      

      // THIS IS THE NEW SLICE
      mutatedSf = katanaData.annexedPolygon;
      // newKatanaSlice = katanaData.annexedPolygon; // TODO <


      // KEEP TRACK OF THE LEFTOVER SHAPEFILE FROM THE NEW SLICE OPERATION
      unslicedSf = katanaData.leftoverPolygon
   }

   return {
      mutatedSf,
      unslicedSf,
      newPercentIngress,
   }  
}