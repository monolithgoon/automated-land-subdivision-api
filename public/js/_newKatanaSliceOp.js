import { _getKatanaSlice } from './_getKatanaSlice.js';
import { RENDER_SIMPLE_SHAPEFILE } from "./mapbox-render.js"


export function _newKatanaSliceOperation(percentIngress, kSliceDir, reunitedSf) {

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
      // RENDER_SIMPLE_SHAPEFILE(mutatedSf, {layerID: Math.random()*5574, color: "green", thickness: 5, fillOpacity: 0.2});
      // RENDER_SIMPLE_SHAPEFILE(mutatedSf, {layerID: 1002, color: "black", thickness: 4, fillOpacity: 0.002});
      // newKatanaSlice = katanaData.annexedPolygon; // TODO <


      // SANDBOX > 
      // mutatedSf = turf.intersect(getProps(startingKatanaSlice)._geometry, movingBboxPolygon)   
      // chunkSlicePolygon = turf.difference(getProps(startingKatanaSlice)._geometry, getProps(mutatedSf)._geometry)
      // intersectSliceArea = startShapefileArea - calcArea(mutatedSf);


      // KEEP TRACK OF THE LEFTOVER SHAPEFILE FROM THE NEW SLICE OPERATION
      unslicedSf = katanaData.leftoverPolygon
      // RENDER_SIMPLE_SHAPEFILE(unslicedSf, {layerID: 1000, color: "grey", thickness: 5, fillOpacity: 0.05});
   }

   return {
      mutatedSf,
      unslicedSf,
      newPercentIngress,
   }
   
}