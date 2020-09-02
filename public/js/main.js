'use strict'

import { RENDERED_FEAT_COLL_LAYER_CLICK, OPEN_RANDOM_POPUP } from './mapbox-render.js'
import { GET_MAPBOX_POLYGON_LAYER, GET_LABEL_LAYER, CLEAR_LAYERS, RENDER_LAYER, RENDER_SIMPLE_SHAPEFILE, POLYGON_FILL_BEHAVIOR } from "./mapbox-render.js"
import { RENDER_SHAPEFILE, GET_SHAPEFILE_GRID_DATA, GET_SHAPEFILE_AREA } from './irregular-polygon.js'
import { ASSIGN_KATANAS } from './katana-assignment.js'
import { CHUNKIFY } from './plot-allocation.js'
import { GET_API_DATA, READ_DOM, RENDER_DOM_DATA, REFRESH_DOM } from './dom-render.js'
import { RENDER_MOVING_FRAMES_CHUNKS, GET_RENDERED_LAYERS } from "./chunkify-moving-frames.js";



// MAIN MAP
mapboxgl.accessToken = 'pk.eyJ1IjoiYnBhY2h1Y2EiLCJhIjoiY2lxbGNwaXdmMDAweGZxbmg5OGx2YWo5aSJ9.zda7KLJF3TH84UU6OhW16w';
export const map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/mapbox/satellite-streets-v11',
   style: 'mapbox://styles/mapbox/cjerxnqt3cgvp2rmyuxbeqme7', // cali terrain
   style: 'mapbox://styles/mapbox/navigation-preview-day-v4',
   style: 'mapbox://styles/mapbox/cj3kbeqzo00022smj7akz3o1e', // moonlight
   style: 'mapbox://styles/mapbox/cjku6bhmo15oz2rs8p2n9s2hm', // minimo
   style: 'mapbox://styles/mapbox/cjcunv5ae262f2sm9tfwg8i0w', // Lè Shine
   style: 'mapbox://styles/mapbox/streets-v11',
   style: 'mapbox://styles/mapbox/outdoors-v10',
   center: [5.963833, 5.243506],
   // pitch: 50,
   // bearing: -60, // bearing in degrees
   zoom: 15.5,
   zoom: 15,
   zoom: 7,
   attribution: 'Nduka Okpue'
});

{
   // MAPBOX INIT. MAP CODE SNIPPET
   // var map = new mapboxgl.Map({
   //    container: 'map', // container id
   //    style: {
   //          'version': 8,
   //          'sources': {
   //             'raster-tiles': {
   //                'type': 'raster',
   //                         "tiles": [
   //                            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", 
   //                            "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
   //                         ],
   //                'tileSize': 256,
   //                'attribution':
   //                      'Map tiles by <a target="_top" rel="noopener" href="http://stamen.com">Stamen Design</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
   //             }
   //          },
   //          'layers': [
   //             {
   //                'id': 'simple-tiles',
   //                'type': 'raster',
   //                'source': 'raster-tiles',
   //                'minzoom': 0,
   //                'maxzoom': 22
   //             }
   //          ]
   //    },
   //    center: [6.514869, 6.146273], // OGWASH UKU
   //    zoom: 13 // starting zoom
   // });
}


// BING MAP TILE
const bing_maps_tile = L.bingLayer('ArOrASno0BM9N0a3FfAOKXbzNfZA8BdB5Y7OFqbDIcbhkTiDHwmiNGfNFXoL9CTY', {
   imagerySet: 'AerialWithLabels',
   maxZoom: 28,
   detectRetina: true,
   retinaDpi: 'd2',
   mapLayer: "TrafficFlow",
   attribution: '&copy; Nduka Okpue'
})


// FARM DETAIL MINI-MAP
export const leaflet_map = L.map("farm_detail_map", { zoomSnap: 0.01 })
   .addLayer(bing_maps_tile)
   // .setView([6.514869, 6.146273], 14);
   // .setView([6.476225, 6.191201], 15);
   .setView([5.49709, 5.340072], 10);
   // .setView([5.49709, 5.340072], 7);

{

// // Script for adding marker on map click
// function onMapClick(e) {

//    var marker = L.marker(e.latlng, {
//        draggable: true,
//        title: "Resource location",
//        alt: "Resource Location",
//        riseOnHover: true
//      }).addTo(leaflet_map)
//      .bindPopup(e.latlng.toString()).openPopup();

//    // Update marker on changing it's position
//    marker.on("dragend", function(ev) {

//      var changedPos = ev.target.getLatLng();
//      this.bindPopup(changedPos.toString()).openPopup();

//    });
//  }

// leaflet_map.on('click', onMapClick);

// // const mapOverlay = L.DivOverlay()
// // leaflet_map.addLayer(mapOverlay)
// leaflet_map.openPopup(popup, popupOptions)

}



// UTILITY FUNCTIONS & GLOBAL VARIABLES

let shapefileArea;
const RENDERED_LAYERS = [];


// CLEAR PREVIOUS RENDERED LAYERS
function clearPreviousLayers() {
   const lastRenderedLayers = RENDERED_LAYERS;
   if (lastRenderedLayers.length > 0) {
      CLEAR_LAYERS(map, lastRenderedLayers)
   }
}


function preRenderGrid(shapefile) {

   const shapefileGrid = GET_SHAPEFILE_GRID_DATA(shapefile)
   const gridArea = shapefileGrid.GRID_AREA;

   // MAIN POLYGON-SUBDIVIDING ('KATANA') GRID LINES
   // RENDER_LAYER(map, shapefileGrid.KATANA_GRIDLINES_LAYER)


   // ('KATANA') POLYGONS LABELS
   // shapefileGrid.KATANA_POLYGON_LABELS.forEach(laberlLayer => RENDER_LAYER(map, laberlLayer))  


   // IRREGULAR POLYGON GRID LINES
   RENDER_LAYER(map, shapefileGrid.GRIDLINES_LAYER)


   // IRREGULAR POLYGON GRID INTERPOLATED FILL
   RENDER_LAYER(map, shapefileGrid.GRID_FILL_LAYER)

   
   // OPEN A POPUP OVER A RANDOMLY SELECTED FARM ON MAP LOAD & DISPLAY GRID CELL SIZE
   OPEN_RANDOM_POPUP(map, shapefileGrid.TRIMMED_GRID)

   console.log(`Polygon Area: ${shapefileArea.toFixed(2)} ha., Polygon Grid Area: ${gridArea.toFixed(2)} ha.`);
   
}


// RETURN DATA FROM plot-allocation.js MODULE
function getV1ChunkifyData(grid, allocations) {
   
   const chunkifyData = CHUNKIFY(grid, allocations)
   const totalHectares = chunkifyData.TOTAL_HECTARES;
   const chunksGeojson = chunkifyData.chunksGeojson;
   const gridChunks = chunkifyData.GRID_CHUNKS;


   // RENDER DATA ON DOM
   RENDER_DOM_DATA ({shapefileArea, allocations, totalHectares, chunksGeojson, gridChunks})


   // ADD LAYERS TO MAPBOX > COLOR-FILLED CHUNKS
   // chunkifyData.FILLED_CHUNKS.forEach(chunk => RENDER_LAYER(map, chunk))


   // POLYGON OUTLINE OF EACH CHUNK
   // chunkifyData.CHUNKS_OUTLINES.forEach(chunk => RENDER_LAYER(map, chunk))


   // A BETTER POLYGON OUTLINE OF EACH CHUNK
   chunkifyData.CHUNKS_POLYGONS_LAYERS.forEach(chunk => RENDER_LAYER(map, chunk))


   // A BETTER FILL FOR EACH CHUNK POLYGON
   chunkifyData.CHUNKS_POLYGONS_FILL_LAYERS.forEach(chunk => RENDER_LAYER(map, chunk))
   chunkifyData.CHUNKS_POLYGONS_FILL_LAYERS.forEach(chunk => POLYGON_FILL_BEHAVIOR(map, leaflet_map, chunk))


   // LABEL FOR EACH CHUNK
   chunkifyData.CHUNKS_LABELS.forEach(chunk => RENDER_LAYER(map, chunk))  

}


// SANDBOX > 
function returnKatanaPolygons(grid, allocations) {

   
   // RETURN DATA FROM irregular-polygon.js MODULE
   const katanaPolygons = grid.KATANA_POLYGONS.features
   console.log([...katanaPolygons]);


   // REDISTRIBUTE THE ALLOCATIONS AMONGST THE KATANAS
   const katanaAssignments = ASSIGN_KATANAS(katanaPolygons, allocations);
   console.log(katanaAssignments);

   // DECIDE TO RUN THE CHUNKIFY ALGO. OR NOT
   katanaAssignments.forEach(assignment => {
      if ("assignment has a grid & an array of hectarage allocations") {
         // CHUNKIFY(assignment)
      } else {
         "paint the katana to represent an allocation"
      }
   });
}


// GET DOM ELEMENTS
const polygonSelectDD = READ_DOM().SHAPEFILE_DD;
const movingFramesDirOptionsDD = READ_DOM().MOVING_FRAMES_DIR_OPTIONS_DD
const chunkifyBtn = READ_DOM().CHUNKIFY_BTN;



// PRE-DEFINED SHAPEFILES
const shapefiles = {
   shfile_1 : {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Ogwashi-Uku, Delta State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[6.476612,6.188833],[6.476548,6.187681],[6.476569,6.186635],[6.485345,6.186657],[6.485281,6.189281],[6.477299,6.189259],[6.476612,6.188833]]]},"id":"9db0110a-c17c-456d-9df9-4cffc8731c94"}]},
   shfile_2 : {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Ubulu-Unor, Delta State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[6.476547,6.188875],[6.476569,6.186635],[6.481032,6.187147],[6.485302,6.185739],[6.485603,6.188961],[6.4782,6.189878],[6.476547,6.188875]]]},"id":"9db0110a-c17c-456d-9df9-4cffc8731c94"}]},
   shfile_3 : {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Ubulu-Unor, Delta State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[6.476547,6.188875],[6.476569,6.186635],[6.479166,6.186699],[6.483628,6.187403],[6.486075,6.185547],[6.486375,6.187147],[6.485603,6.188961],[6.481955,6.190283],[6.4782,6.189878],[6.476547,6.188875]]]},"id":"9db0110a-c17c-456d-9df9-4cffc8731c94"}]},
   shfile_4 : {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Illah, Delta State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[6.684295,6.429004],[6.673013,6.428172],[6.672777,6.426061],[6.675823,6.425741],[6.679533,6.424398],[6.683952,6.42508],[6.68511,6.426424],[6.684896,6.427682],[6.684295,6.429004]]]},"id":"9ccae810-6003-480e-8b47-422e76388655"}]},
   shfile_5 : {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Mashi, Kaduna","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[7.482655,10.544701],[7.482494,10.543973],[7.482397,10.543403],[7.484854,10.543614],[7.487504,10.543161],[7.488449,10.54604],[7.482934,10.54584],[7.482655,10.544701]]]},"id":"221379d5-d2b2-4c37-8c95-ba9264c0a742"}]},
   shfile_6 : {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Gora, Nasarawa State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[7.742817,8.885093],[7.742645,8.88416],[7.741798,8.884149],[7.742647,8.880429],[7.745308,8.879464],[7.74597,8.884658],[7.742817,8.885093]]]},"id":"14bbe039-2eaf-4aa6-a5e1-5b30a38676a3"}]},
   shfile_7 : {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Gora, Nasarawa State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[7.721847,8.877015],[7.720518,8.873581],[7.716829,8.872097],[7.716609,8.868111],[7.721977,8.868026],[7.731413,8.868069],[7.731413,8.868069],[7.731756,8.872606],[7.737161,8.874811],[7.736951,8.877948],[7.736518,8.881891],[7.73433,8.882103],[7.733259,8.883079],[7.731713,8.884308],[7.728067,8.884435],[7.724849,8.882273],[7.722147,8.87922],[7.721847,8.877015]]]},"id":"6f071731-4a30-466b-9b59-5865016ca386"}]},
   shfile_8 : {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[7.48921296334886,9.08277219127278,0],[7.49108465413514,9.08159835440109,0],[7.49247058985427,9.08067157684884,0],[7.49320865808078,9.0801210872913,0],[7.49396448663083,9.07951389296328,0],[7.49442718974763,9.07908956868106,0],[7.49475619305385,9.07878633099541,0],[7.49509514586061,9.07855556674878,0],[7.49544426104557,9.07831433425095,0],[7.49618729985357,9.07805127804159,0],[7.49672829660517,9.07792518628334,0],[7.49681170189798,9.07801620409844,0],[7.49682133124292,9.07833698355251,0],[7.49666811065197,9.07915090312985,0],[7.4963640798454,9.07995320843212,0],[7.49603081423505,9.08069875688159,0],[7.49518731383073,9.08170551011299,0],[7.49431496797793,9.08243365338293,0],[7.49313682907698,9.08325763827436,0],[7.4922678657024,9.08376650681758,0],[7.49190309337054,9.08390280686152,0],[7.49164023167279,9.08397017012055,0],[7.49078638785512,9.08390201925576,0],[7.49019009488614,9.08364926475705,0],[7.48969744795393,9.08331525095148,0],[7.48921296334886,9.08277219127278,0]]]},"properties":{"name":"NIRSAL Office Complex Shapefile", "location":"Maitama, Abuja", "tessellate":true}}]},
   shfile_9 : {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Ogwashi-Uku, Delta State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[6.477212,6.188769],[6.474982,6.165644],[6.47747,6.169356],[6.479745,6.168076],[6.481676,6.190731],[6.478244,6.190859],[6.477428,6.190902],[6.477212,6.188769]]]},"id":"9db0110a-c17c-456d-9df9-4cffc8731c94"}]},
   shfile_10: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"175 ha. Lafia, Nasarawa State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[8.552879,9.505127],[8.549012,9.505011],[8.54876,9.50482],[8.54869,9.504667],[8.542128,9.488842],[8.543173,9.489011],[8.543345,9.488651],[8.543388,9.487244],[8.54401,9.486789],[8.544975,9.486683],[8.544932,9.485593],[8.54756,9.485625],[8.547785,9.485477],[8.549018,9.485455],[8.5492,9.486196],[8.549662,9.486609],[8.549672,9.48699],[8.552075,9.486979],[8.552043,9.487762],[8.552899,9.487794],[8.552867,9.489064],[8.552815,9.491858],[8.552879,9.505127]]]},"id":"bc11926f-1a2a-4891-a2fe-10bd54b4059d"}]},
   shfile_11: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Illah, Delta State","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[6.671019,6.485165],[6.673411,6.471778],[6.67414,6.471778],[6.674226,6.471011],[6.675942,6.470201],[6.676843,6.471011],[6.677943,6.474697],[6.67893,6.474527],[6.67968,6.478065],[6.680002,6.477938],[6.679873,6.479707],[6.68026,6.481263],[6.679552,6.482585],[6.676742,6.484482],[6.676356,6.485228],[6.671019,6.485165]]]},"id":"3af9398a-43a7-4561-bdea-b646b7cd57ac"}]},
   shfile_12: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"extended_name":"uniqueId","location":"Rigachikum, Kaduna", "name":"Rigachickun AGC","agcname":"Rigachickun AGC","code":"NIRSALAGCAD0001","farmers":[{"code":"NIRSALAGCAD0001-001","firstname":"Mohammed","lastname":"Sadiq","coordinates":"","hectare":2.3},{"code":"NIRSALAGCAD0001-002","firstname":"Emmanuel","lastname":"James","coordinates":"","hectare":2.7}]},"geometry":{"type":"Polygon","coordinates":[[[7.475653141736985,10.627761368604803],[7.478830888867378,10.629113406009933],[7.480225302278996,10.628697217702442],[7.481489293277264,10.62825697355466],[7.481489293277264,10.626841004353153],[7.481274716556071,10.625009164779053],[7.481152340769768,10.623202028950532],[7.481164410710335,10.621990675170915],[7.4790434539318085,10.6220631719958],[7.477033138275147,10.621500003026645],[7.47676357626915,10.624850332335757],[7.475653141736985,10.627761368604803]]]}}]},
   shfile_13: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"shape":"Polygon","location":"Wasa, Kano","category":"default"},"geometry":{"type":"Polygon","coordinates":[[[8.68923,12.147375],[8.691376,12.147428],[8.692244,12.150511],[8.68786,12.151749],[8.685994,12.152378],[8.685715,12.152347],[8.683914,12.153091],[8.683292,12.152409],[8.683613,12.151497],[8.684096,12.151214],[8.683999,12.150658],[8.683495,12.150249],[8.682777,12.150133],[8.682594,12.149662],[8.68923,12.147375]]]},"id":"33d6a276-e123-4d26-8b05-b0079eef7aa9"}]},

}


const dirOptionsMap = {
   se: { katanaSliceDirection: "south", chunkifyDirection: "east" },
   sw: { katanaSliceDirection: "south", chunkifyDirection: "west" },
   ne: { katanaSliceDirection: "north", chunkifyDirection: "east" },
   nw: { katanaSliceDirection: "north", chunkifyDirection: "west" },
   es: { katanaSliceDirection: "east", chunkifyDirection: "south" },
   en: { katanaSliceDirection: "east", chunkifyDirection: "north" },
   ws: { katanaSliceDirection: "west", chunkifyDirection: "south" },
   wn: { katanaSliceDirection: "west", chunkifyDirection: "north" },
}


// SELECTED SHAPEFILE VARIABLE
let selectedShapefile;

// SELECTED DIRECTIONS COMBINATION CONFIG. OBJ.
let dirComboConfigObj;



// PLOT/CHUNK RENDER FUNCTION
function drawChunk(polygon, layerID, bufferAmt) {

   let presentationPolygon;

   
   if (bufferAmt) {
      
      // PREP. FOR PRESENTATION >> THIS REMOVES THE "TAILS"  FROM THE CHUNKS 
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
   
   
   // ADD CLICKABILITY TO THE FILL LAYER
   POLYGON_FILL_BEHAVIOR(map, leaflet_map, polygonFillLayer)
}



// RENDER CHUNKIFY DATA ON DOM (_V2)
function renderDataOnDOM({parcelizedAgcGeojson, farmPlotsGeojson}) {      

   const chunksListing_Div = document.getElementById('chunk_coords_listing');
   const mapLocation_Div = document.getElementById('map_location_overlay')

   
   // numFarmers_Div.innerText = farmPlotsGeojson.length;
   // unusedLand_Div.innerText = `${(unallocatedLandArea).toFixed(1)} ha.`
   
   // CLEAR THE LISTINGS EACH TIME THIS FN. IS CALLED
   // totalAllocation_Div.innerText = "";
   chunksListing_Div.innerText = "";
   mapLocation_Div.innerText = "";

   mapLocation_Div.innerText = `${parcelizedAgcGeojson.properties.location}`
   const agcLocation = parcelizedAgcGeojson.properties.location;
   const agcCenterCoords = [6.18, 6.53] // FIXME < update the parcelized AGC properties to include agc_center_coords 
   // const agcCenterCoords = turf.centerOfMass(parcelizedAgcGeojson)
   mapLocation_Div.innerText = `${agcLocation || 'Nigeria'} ${agcCenterCoords[0].toFixed(5)}°E ${agcCenterCoords[1].toFixed(5)}°N`


   const listingHeader_div = document.createElement('div')
   listingHeader_div.innerHTML = `Parcelized Plots' Coordinates <br><br>`
   listingHeader_div.className = "coords-listing-header"
   chunksListing_Div.appendChild(listingHeader_div);

   // APPLY STYLING
   chunksListing_Div.style.display = "block";
   chunksListing_Div.style.background = "#f5f6fa";
   chunksListing_Div.style.border = "grey 1px solid";

   
   // RENDER TOTAL NUM. OF ALLOCATIONS
   // totalAllocation_Div.innerText = `${allocationTotal.toFixed(1)} ha.`;
   
   // LIST COORDINATES
   farmPlotsGeojson.forEach((chunk, index) => {

      chunk = turf.truncate(chunk, {precision: 3, coordinates: 2})

      const chunk_Div = document.createElement('div');
      chunk_Div.className = 'chunk'

      // chunk_Div.innerHTML = `Plot #${index + 1} ${JSON.stringify(chunk.properties)} ${JSON.stringify(chunk.geometry.coordinates)} <br><br>`
      chunk_Div.innerHTML = `Plot #${index + 1} <br> ${chunk.properties.farmer_id.toUpperCase()} <br> ${JSON.stringify(chunk.geometry.coordinates)} <br><br>`

      chunksListing_Div.appendChild(chunk_Div);

   });
}



// EVENT HANDLERS
map.on('load', function () {


   clearPreviousLayers();
   
   
   // JUMP TO TOP OF THE PAGE
   window.scrollTo(0, document.body.scrollTop, {behavior: "smooth"});


   // GET DATA FROM BACKEND
   const parcelizedAgcGeojson = JSON.parse(GET_API_DATA())
   console.log(parcelizedAgcGeojson);


   // RENDER THE AGC SHAPEFILE
   RENDER_SHAPEFILE(map, leaflet_map, parcelizedAgcGeojson);
   
   
   // RENDER THE PLOTS ON THE MAP
   parcelizedAgcGeojson.features.forEach((farmPlot,idx)=>{
      drawChunk(farmPlot, idx, -0.005)
      console.log(farmPlot)
   })


   // RENDER THE PLOTS' COORDINATES IN THE DOM
   const farmPlotsGeojson = parcelizedAgcGeojson.features;
   const allocationTotal = parcelizedAgcGeojson.properties.agc_area;
   const unallocatedLandArea = parcelizedAgcGeojson.properties.unused_land_area;
   renderDataOnDOM({parcelizedAgcGeojson, farmPlotsGeojson})



   // REMOVE
   // ACTIVATE THE DROPDOWN ONLY AFTER THE MAP IS LOADED
   // polygonSelectDD.disabled = false;


   // // DROPDOWN MENU EVENT HANDLER
   // polygonSelectDD.addEventListener('change', (e) => {
      
   //    e.preventDefault();

   
   //    clearPreviousLayers();


   //    // ACTIVATE THE 2nd DD. ONLY AFTER A SHAPEFILE SELECTION IS MADE
   //    movingFramesDirOptionsDD.disabled = false;
      

   //    // SAVE THE SELECTED SHAPEFILE TO A VARIABLE
   //    const shapefile_selection = e.target.value


   //    // JUMP TO TOP OF THE PAGE
   //    window.scrollTo(0, document.body.scrollTop, {behavior: "smooth"});


   //    // SAVE THE SELECTED SHAPEFILE
   //    selectedShapefile = shapefiles[shapefile_selection]

      
   //    // RENDER THE SHAPEFILE < FROM irregular-polygon.js MODULE
   //    RENDER_SHAPEFILE(map, leaflet_map, selectedShapefile);

   //    // RETURN THE AREA VARIABLE FOR COMPARISON WITH TOTAL ALLOCATION ON CHUNKIFY BUTTON CLICK
   //    shapefileArea = GET_SHAPEFILE_AREA()


   //    // SHOW THE MASKING GRID
   //    // preRenderGrid(selectedShapefile);

   // });


   // // DIRECTION OPTIONS DROPDOWN MENU EVENT HANDLER
   // movingFramesDirOptionsDD.addEventListener('change', (e) => {

   //    e.preventDefault();

   //    clearPreviousLayers();

   //    // ACTIVATE THE CHUNKIFY BTN. ONLY AFTER A SELECTION IS MADE
   //    chunkifyBtn.disabled = false;

   //    // SAVE THE SELECTED DIR. OPTIONS TO A VARIABLE
   //    const dirComboSelection = e.target.value

   //    // GET THE OPTIONS CONFIG. FROM THE MAP
   //    dirComboConfigObj = dirOptionsMap[dirComboSelection]

   // })


   // // COMMENCE PARCELIZATION..
   // chunkifyBtn.addEventListener('click', (e) => {

   //    e.preventDefault();


   //    clearPreviousLayers();


   //    // GET USER INPUT
   //    const farmAllocations = READ_DOM().ALLOCATIONS
   //    const totalAllocation = READ_DOM().TOTAL_ALLOCATION         

      
   //    // PERFORM BASIC CHECK
   //    // if(totalAllocation <= gridArea) {
   //    if (totalAllocation <= shapefileArea) {


   //       chunkifyBtn.disabled = true;
   //       chunkifyBtn.innerText = "Chunking.."

         
   //       // CREATES A BUFFER BETWEEN BTN. CLICK AND CODE EXECUTION
   //       function delayExecution() {
            
   //          // TODO > CLEAR ALL RENDERED MAPBOX LAYER POLYGONS
   //          // TODO > CLEAR ANY RENDERED POLYGONS ON THE LEAFLET MAP
   
      
   
   //          // THIS SHOULD BE IN THE PLOT-ALLOCATION ('CHUNKIFY-V1') MODULE
   //          // GET THE COMPUTATIONAL GRID FROM irregular-polygon.js
   //          const shapefileGrid = GET_SHAPEFILE_GRID_DATA(selectedShapefile)
   //          const primodialGrid = shapefileGrid.TRIMMED_GRID;
   //          const gridArea = shapefileGrid.GRID_AREA;
                  
   
   //          // RETURN DATA FROM plot-allocation.js MODULE
   //          // getV1ChunkifyData(primodialGrid, farmAllocations);
   //          // RENDER_GRID_CHUNKS(primodialGrid, farmAllocations);
                        
            
   //          // RENDER LAYERS FROM THE MOVING FRAMES MODULE
   //          RENDER_MOVING_FRAMES_CHUNKS(selectedShapefile, farmAllocations, dirComboConfigObj)
                        
            
   //          // SANDBOX > 
   //          // returnKatanaPolygons(shapefileGrid, farmAllocations);

            
   //          // RESET THE BTN.
   //          chunkifyBtn.disabled = false;
   //          chunkifyBtn.innerText = "Get Parcels";
   //       }

         
   //       setTimeout(delayExecution, 2000);

         
   //    } else {
   //       alert(`Your allocations exceed the available land area. Reduce by ${(totalAllocation - shapefileArea).toFixed(2)} hectares.`)   
   //    };
   // });

});