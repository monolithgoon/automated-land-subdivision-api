// POLYGON CHUNKING v2.0 > VORONOI TESSELATION

import { map } from "./main.js"
import { RENDERED_FEAT_COLL_LAYER, GET_MAPBOX_POLYGON_LAYER, RENDERED_FEAT_COLL_LAYER_CLICK, RENDER_LAYER } from "./mapbox-render.js"
import { RENDER_GEOJSON } from "./mapbox-render.js"



let shapefile = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","name":"Unnamed Layer","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[6.684295,6.429004],[6.673013,6.428172],[6.672777,6.426061],[6.675823,6.425741],[6.679533,6.424398],[6.683952,6.42508],[6.68511,6.426424],[6.684896,6.427682],[6.684295,6.429004]]]},"id":"9ccae810-6003-480e-8b47-422e76388655"}]}
// let shapefile = {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[7.48921296334886,9.08277219127278,0],[7.49108465413514,9.08159835440109,0],[7.49247058985427,9.08067157684884,0],[7.49320865808078,9.0801210872913,0],[7.49396448663083,9.07951389296328,0],[7.49442718974763,9.07908956868106,0],[7.49475619305385,9.07878633099541,0],[7.49509514586061,9.07855556674878,0],[7.49544426104557,9.07831433425095,0],[7.49618729985357,9.07805127804159,0],[7.49672829660517,9.07792518628334,0],[7.49681170189798,9.07801620409844,0],[7.49682133124292,9.07833698355251,0],[7.49666811065197,9.07915090312985,0],[7.4963640798454,9.07995320843212,0],[7.49603081423505,9.08069875688159,0],[7.49518731383073,9.08170551011299,0],[7.49431496797793,9.08243365338293,0],[7.49313682907698,9.08325763827436,0],[7.4922678657024,9.08376650681758,0],[7.49190309337054,9.08390280686152,0],[7.49164023167279,9.08397017012055,0],[7.49078638785512,9.08390201925576,0],[7.49019009488614,9.08364926475705,0],[7.48969744795393,9.08331525095148,0],[7.48921296334886,9.08277219127278,0]]]},"properties":{"name":"NIRSAL Office Complex Shapefile","tessellate":true}}]};

// let farmAllocations = [6, 5, 8, 7, 4, 11, 9];
// let farmAllocations = [11, 9, 8, 7, 6, 5, 4];
// let farmAllocations = [4, 5, 6, 7, 8, 9, 11];
// let farmAllocations = [2, 4, 6, 8, 9, 10, 11];
// let farmAllocations = [11, 10, 9, 8, 6, 4, 2];
// let farmAllocations = [6, 5, 4, 3, 2, 1];
let farmAllocations = [12, 10, 8, 5, 4, 3, 2, 1];

const totalAllocation = farmAllocations.reduce((sum, allocation) => sum += allocation)


function getShapefileProps(shapefile) {

   let shapefileBounds, shapefileGeometry, shapefileArea

   if (turf.getType(shapefile) === "FeatureCollection") {

      // UPDATE THE SHAPEFILE PROPERTIES TO HAVE AN "id" PROPERTY
      if (shapefile.features[0].id) {
         shapefile.features[0].properties["id"] = shapefile.features[0].id 
      }

      shapefileGeometry = shapefile.features[0].geometry;
      
   } else if (turf.getType(shapefile) === "Polygon") {
      
      shapefile.properties["id"] = "voronoiTesselation1985"
      shapefileGeometry = shapefile.geometry;
      
   } else {
      // are you sure that shapefile is valid??
   }
   
   shapefileBounds = turf.bbox(shapefile)
   shapefileArea = turf.area(shapefileGeometry)/10000;
   
   return {
      shapefileBounds,
      shapefileGeometry,
      shapefileArea
   }
}


// TOTAL ALLOCATIONS SIZE CHECK
const offset = totalAllocation - getShapefileProps(shapefile).shapefileArea;



map.on('load', ()=> {


   map.flyTo({
      center: turf.coordAll(turf.centroid(shapefile))[0],
      zoom: 14.5
   })

   
   // UTILITY FUNCTIONS

   function getVoronoiMatch(allocation, featureArray) {
      const match = featureArray.features.find(feature => feature.properties.area_rough === allocation);
      return match
   }


   function getUnmatchedVoronois(match, featureArray) {
      // remove the matching voronoi polygon from the voronoi collection
      const unmatchedVoronois = featureArray.features.filter(feature => feature !== match)
      return unmatchedVoronois;
   };


   function checkForVoronoiSplinters(collection) {return null};


   // FIXME > 
   function checkForDisconnectedPolygon(collection) {

      try {
         
         const featureCollection = turf.featureCollection(collection);
         // console.log(featureCollection.features.map(feature => feature.properties.area_rough));
         
         const unitedCoords = [];
         featureCollection.features.forEach(feature => {
            let polygonCoords = turf.polygon([feature.geometry.coordinates[0]]);
            // if (polygonCoords) {
               unitedCoords.push(turf.polygon([feature.geometry.coordinates[0]]));
               // unitedCoords.push(polygonCoords);
            // } else {
            //    return
            // }
         });

         const reunitedVoronois = turf.union(...unitedCoords);

         // check if union is valid..
         if (turf.getType(reunitedVoronois) === 'MultiPolygon') {
            return null

         } else {

            return reunitedVoronois;
         }

      } catch(err) {
         // console.error(err);
         // recursiveFunction();
         return;
      }
   };


   function checkForGapingHole(match, rebuiltPolygon) {return null};



   // SANDBOX 2 > 
   // SANDBOX > WORKING PROTOTYPE V3 >

   // STORE ALL THE VORONOI SLICES
   const matchingPairs = [];
   const matchedVoronois = [];

   function recursiveFunction() {

      let numPts;

      // VORONOI TESSELATION FUNCTIONS
      
      // 1.
      // get random points inSIDE the geojson shapefile
      function getRandomPts(farmAllocations) {
         
         let numAlloc = farmAllocations.length;
         // let numPts;

         if (numAlloc === 0) {

            alert('the parcelization recursion is complete. all allocations assigned')
            return

         } else {

            if (offset < 0) {
               numPts = farmAllocations.length + 1
            } else if (offset === 0) {
               numPts === farmAllocations.length
            } else if (offset > 0) {
               alert('The total allocated hectares exceed the area of the shapefile.')
               return
            }
      
            return turf.randomPoint(numPts, {bbox: getShapefileProps(shapefile).shapefileBounds})
         }
         
      }

      let randPts = getRandomPts(farmAllocations);


      // 2.
      // draw voronoi polygons from the random points
      function createVoronoi(randPts) {
         // return turf.voronoi(randPts, {bbox: shapefileBounds})
         return turf.voronoi(randPts, {bbox: getShapefileProps(shapefile).shapefileBounds})
      }

      let voronoiCollection = createVoronoi(randPts);


      // 3. 
      // CLIP THE VORONOI POLYGONS TO THE ORIGINAL POLYGON
      function maskVoronai(polygons) {
         polygons.features.forEach(polygon => {
            // let intersection = turf.intersect(shapefileGeometry, polygon.geometry)
            let intersection = turf.intersect(getShapefileProps(shapefile).shapefileGeometry, polygon.geometry)
            if (intersection) {
               polygon.geometry = intersection.geometry;
               polygon.properties["area"] = (turf.area(polygon)/10000).toFixed(3) // create a new property for the voronai polygon
               polygon.properties["area_rough"] = Math.floor((turf.area(polygon)/10000).toFixed(1)) // create a new property for the voronai polygon
            }
         });

         return polygons;
      };

      voronoiCollection = maskVoronai(voronoiCollection);


      for (let idx = 0; idx < farmAllocations.length; idx++) {

         const allocation = farmAllocations[idx];

         // check for matches 
         const voronoiMatch = getVoronoiMatch(allocation, voronoiCollection);

         if (!voronoiMatch) {
            
            console.log('failed match', allocation); // HACK
            // recursiveFunction();
            //  if (idx < farmAllocations.length) {
            //    continue
            // } else {
            //    break
            // }
            continue

         } else if (voronoiMatch) {

            // get array of unmatched voronois
            const unmatchedVoronois = getUnmatchedVoronois(voronoiMatch, voronoiCollection);

            // check for splinters
            const voronoiSplinter = checkForVoronoiSplinters(unmatchedVoronois);

            if (voronoiSplinter) {
               console.log('failed splinter');   // HACK
               
               continue
               
            } else if (!voronoiSplinter) {

               // check for unbounded holes
               const newShapefile = checkForDisconnectedPolygon(unmatchedVoronois);

               if (!newShapefile) {
                  
                  console.log('failed attempt to create a new shapefile'); // HACK
                  // console.log(idx);
                  // recursiveFunction();
                  // console.log('is this the 2nd dead zone??');
                  // if (idx < farmAllocations.length) {
                  //    continue
                  // } else {
                  //    break
                  // }
                  continue
      
               } else if (newShapefile) {

                  // check for bounded holes
                  const matchIsHole = checkForGapingHole(voronoiMatch, newShapefile)

                  if (matchIsHole) {
                     console.log('failed gaping hole'); // HACK

                     continue

                  } else if (!matchIsHole) {

                     // You're looking good..

                     // update the allocations array..
                     // FIXME > TURN THE ALLOCATIONS ARRAY IN TO AN OBJ. ARRAY SO YOU CAN FIND THE EXACT ALLOCATION WITHOUT DUPLICATION
                     // remove that perfectly matching allocation from the allocations array
                     // farmAllocations = farmAllocations.filter((element, index) => index !== idx)
                     farmAllocations = farmAllocations.filter((element, index) => element !== allocation)
                     
                     // save values
                     matchingPairs.push([allocation, voronoiMatch])
                     matchedVoronois.push(voronoiMatch);
                     
                     // update the original shapefile
                     shapefile = newShapefile;

                     // IMPORTANT
                     // QUIT LOOPING THRU THE ALLOCATIONS ARRAY
                     break

                  } else {

                     // there is no allocation that does not result in a completely surrounded hole
                     break
                  }

               } else {

                  // there is no allocation that does not result in an unbounded hole (invalid turf.union polygon)
                  break
               }
            } else {

               // there is no allocation that does not result in splintering
               break
            }
         } else {

            // there are no matches
            alert('None of the voronoi tesselations match the allocations..')
            break
         }
      }
  
      // WOOO HOO!!
      if (farmAllocations.length > 0) {
         recursiveFunction();
      }
   }
   
   recursiveFunction();
   // console.log(matchingPairs);
   console.log(farmAllocations);
   RENDER_GEOJSON(shapefile)
   RENDER_GEOJSON(turf.featureCollection(matchedVoronois));
   // turf.featureCollection(matchedVoronois).features.forEach(feature => {
   //    console.log(feature)
   // });



   
   // REMOVE > 
   // STORE ALL THE VORONOI SLICES
   const matches = [];
   const matchingVoronois = [];
   // 4. CPU..
   function checkAreas(allocations, featCollection) {

      // SANDBOX > 
      function checkForIdealMatch(allocations) {
         for (let idx = 0; idx < allocations.length; idx++) {

            const allocation = allocations[idx];
            let voronoiMatch2 = featCollection.features.find(feature => feature.properties.area_rough === allocation);

            if (!voronoiMatch2) {
               // skip idx
               console.log(`no voronoi matched this allocation idx-${idx}: ${allocation}..`)
               continue

            } else if (voronoiMatch2) {
               // continue with chunking
               console.log(`This allocation idx-${idx}: ${allocation} found a match..`)

               // cpu core code
               // katanaSlice();
               
               // check if removing the matched voronoi would leave a collection consisting of tiny regions..
               // if (!checkForSplinters) {
               let willSplinter = null;
               if (willSplinter) {
                  // skip idx
                  continue
                  
               } else if (!willSplinter) {
                  console.log('there are no splinter fragments..');
                  let mutatedShapefile = 'MUTATED SHAPEFILE'
                  return mutatedShapefile

               } else {
                  // all allocations will cause spllintering
                  break
               }

            } else {
               // none of the allocations match
               break
            }
         };
      };
      // let returnedMutatedShapefile = checkForIdealMatch(allocations);
      // console.log(returnedMutatedShapefile);


      for (let j = 0; j < allocations.length; j++) {

         const allocation = allocations[j];
         
         // search thru the voronois to find a mathch with that allocation
         let voronoiMatch = featCollection.features.find(feature => feature.properties.area_rough === allocation);
         matchingVoronois.push(voronoiMatch)

         
         if (voronoiMatch) { 
            console.log(`you have a match.. ${voronoiMatch.properties.area}`);
            console.log(voronoiMatch);
            
            // check if removing the matched voronoi would leave a collection consisting of tiny regions..
            let tinyFragments = null;
            if (!tinyFragments) {
               // console.log('there are no fragments..');

               // check if removing the matched voronoi would create a hole..
               let hole = null;
               if (!hole) {
                  // console.log('there are no holes..');
                  
                  // store the match
                  matches.push([allocation, voronoiMatch])
         
                  // remove that perfectly matching allocation from the allocations array
                  farmAllocations = allocations.filter((element, index) => index !== j)
         
                  // remove that matching voronoi polygon from the voronoi collection
                  // find the first match, and hack it from the collection
                  let unmatchedVoronois = featCollection.features.filter(feature => feature !== voronoiMatch)

                  
                  // mutate original shapefile
                  let unmatchedVoronoiCollection = turf.featureCollection(unmatchedVoronois);
                  console.log(unmatchedVoronoiCollection.features.map(feature => feature.properties.area_rough));
                  let unionCoords = [];
                  unmatchedVoronoiCollection.features.forEach(feature => {
                     unionCoords.push(turf.polygon([feature.geometry.coordinates[0]]));
                  });
                  shapefile = turf.union(...unionCoords);
                  console.log(shapefile);
                  RENDER_GEOJSON(shapefile)
                  return unmatchedVoronoiCollection
                  // IMPORTANT > USE return BELOW FOR RECURSION..
                  // REMOVE ?> WRONG!
                  return shapefile = turf.union(...unionCoords);

                  
                  // break the loop and save the values when you find a match      
                  break;
                  // repeat

               } else {
                  break;
               }
            } else {
               break
            }
         } else {
            break
         }
      }
   }

   // let maimedCollection = checkAreas(farmAllocations, voronoiCollection)
   // let slices = turf.featureCollection(matchingVoronois);
   
   // console.log(maimedCollection);
   // // RENDER_GEOJSON(maimedCollection)
   // RENDER_GEOJSON(slices);

});