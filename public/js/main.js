'use strict'

import { GET_MAPBOX_POLYGON_LAYER, GET_LABEL_LAYER, CLEAR_LAYERS, RENDER_LAYER, POLYGON_FILL_BEHAVIOR } from "./mapbox-render.js"
import { RENDER_SHAPEFILE } from './irregular-polygon.js'
import { ACTIVATE_CUSTOM_CONTROLS } from './_leaflet-map-custom-controls.js'


// MAIN MAP
mapboxgl.accessToken = 'pk.eyJ1IjoiYnBhY2h1Y2EiLCJhIjoiY2lxbGNwaXdmMDAweGZxbmg5OGx2YWo5aSJ9.zda7KLJF3TH84UU6OhW16w';
export const map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/mapbox/satellite-streets-v11',
   style: 'mapbox://styles/mapbox/cjerxnqt3cgvp2rmyuxbeqme7', // cali terrain
   style: 'mapbox://styles/mapbox/navigation-preview-day-v4',
   style: 'mapbox://styles/mapbox/cj3kbeqzo00022smj7akz3o1e', // moonlight
   style: 'mapbox://styles/mapbox/cjku6bhmo15oz2rs8p2n9s2hm', // minimo
   style: 'mapbox://styles/mapbox/streets-v11',
   style: 'mapbox://styles/mapbox/cjcunv5ae262f2sm9tfwg8i0w', // Lè Shine
   style: 'mapbox://styles/mapbox/outdoors-v11',
   center: [5.963833, 5.243506],
   pitch: 50,
   bearing: 10, // bearing in degrees
   zoom: 15,
   zoom: 7,
   zoom: 16,
   attribution: 'Nduka Okpue'
});



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
export const leaflet_map = L.map("leaflet_map", { 
   minZoom: 0,
   maxZoom: 19,
   zoomSnap: 0.01,
   zoomDelta: 0.10 
});

// LEAFLET MAP ON LOAD EVT. HANDLER >> PUT B4 .setView
leaflet_map.on('load', () => {

   // INIT. THE CUSTOM CONTROLS ON THE LEAFLET MINI MAP
   ACTIVATE_CUSTOM_CONTROLS();
})

// DEFAULT LEAFLET MAP VIEW
leaflet_map
   .addLayer(bing_maps_tile)
   .setView([5.49709, 5.340072], 10);
   // .setView([6.514869, 6.146273], 14);
   // .setView([6.476225, 6.191201], 15);
   // .setView([5.49709, 5.340072], 7);



   // KEEP TRACK OF RENDERED LAYERS ON MAPBOX MAP
   const RENDERED_LAYERS = [];


   // CLEAR PREVIOUS RENDERED LAYERS ON LEAFLET MAP
   function ClearRenderedMapboxLayer() {
      const lastRenderedLayers = RENDERED_LAYERS;
      if (lastRenderedLayers.length > 0) {
         CLEAR_LAYERS(map, lastRenderedLayers)
      }
   }



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
      // let chunkIndex = presentationPolygon.properties.chunk_index;   
      let chunkIndex = layerID + 1;   
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



   // GET DATA FROM BACKEND VIA HTML DATASET ATTRIBUTE
   function GET_PARCELIZED_AGC_API_DATA() {
      const dataStream = document.getElementById('api_data_stream').dataset.parcelizedagc
      return dataStream
   }
   


   // COPY TEXT FROM DIV
   function CopyToClipboard(node) {
      var r = document.createRange();
      r.selectNode(node);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(r);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
      console.log(`${node.innerText}`)
   }




   // RENDER PARCELIZED AGC DATA ON DOM
   function renderDataOnDOM({parcelizedAgcGeojson, farmPlotsGeojson}) {      


      // GET DOM ELEMENTS
      const coordsListingHeaderWrapper_div = document.getElementById('coords_listing_header_wrapper')
      const coordsListingChunksDataWrapper_div = document.getElementById('coords_listing_chunks_data_wrapper')
      const leafletMapOverlay_div = document.getElementById('leaflet_map_overlay');
      // TURN-BY-TURN OVERLAY
      const leafletMapExtOverlay_div = document.getElementById("leaflet_map_overlay_extended");


      // VARIABLES
      const agcLocation = parcelizedAgcGeojson.properties.agc_location;
      const agcCenterCoords = [6.18, 6.53];
      const allocationTotal = parcelizedAgcGeojson.properties.agc_area;
      const unallocatedLandArea = parcelizedAgcGeojson.properties.unused_land_area;

      
      
      // CLEAR THE LISTINGS EACH TIME THIS FN. IS CALLED
      // totalAllocation_Div.innerText = "";
      // leafletMapOverlay_div.innerText = "";
      
      
      // POPULALTE THE DOM ELEMENTS
      // numFarmers_Div.innerText = farmPlotsGeojson.length;
      // totalAllocation_Div.innerText = `${allocationTotal.toFixed(1)} ha.`;
      // unusedLand_Div.innerText = `${(unallocatedLandArea).toFixed(1)} ha.`
      leafletMapOverlay_div.innerText = agcLocation;
      leafletMapOverlay_div.innerText = `${agcLocation || 'Nigeria'} ${agcCenterCoords[0].toFixed(5)}°E ${agcCenterCoords[1].toFixed(5)}°N`
      leafletMapOverlay_div.appendChild(leafletMapExtOverlay_div);


      const listingHeader_div = document.createElement('div')
      // listingHeader_div.innerHTML = `Parcelized Plots' Coordinates <span><i class="fas fa-link"></i></span> <br><br>`
      listingHeader_div.innerHTML = `
                                    <div>Parcelized Plots' Coordinates</div>
                                    <div class="user-action-wrapper">
                                       <button class="btn-copy-coords" href="#" role="buton" title="Copy coordinates" aria-label="Copy coordinates"><span><i id="btn_copy_coords" class="far fa-copy"></i></span></button>
                                       <button><span><i class="fas fa-file-pdf"></i></span></button>
                                       <button><span><i class="fas fa-envelope-open"></i></span></button>
                                       <button><span><i class="fab fa-superpowers"></i></span></button>
                                       </div>`
                                       // <button><span><i class="fas fa-download"></i></span></button>
                                       // <button><span><i class="fas fa-share"></i></span></button>
                                       listingHeader_div.className = "coords-listing-header"
      coordsListingHeaderWrapper_div.appendChild(listingHeader_div);


      // USER ACTION BUTTON EVENT HANDLERS
      // document.getElementById("btn_copy_coords").addEventListener('click', CopyToClipboard(coordsListingChunksDataWrapper_div));
      document.getElementById("btn_copy_coords").addEventListener('click', ()=> {
         CopyToClipboard(coordsListingChunksDataWrapper_div);
      });
      if (document.getElementById("btn_copy_coords")) {

      }

         
      // COORDINATES LISTING
      farmPlotsGeojson.forEach((chunk, index) => {

         chunk = turf.truncate(chunk, {precision: 5, coordinates: 2})

         const chunk_Div = document.createElement('div');
         chunk_Div.className = 'chunk'

         const chunkDivHeader = document.createElement('div');
         chunkDivHeader.className = 'chunk-coords-header'
         const chunkDivBody = document.createElement('div');
         chunkDivBody.className = 'chunk-coords-body'

         chunkDivHeader.innerHTML = `
                                    Plot-${index + 1} <br> 
                                    ${chunk.properties.owner_name} <br> 
                                    Farmer ID • ${chunk.properties.owner_id} • VAsT ID • ${chunk.properties.chunk_id} <br>`

         chunkDivBody.setAttribute("data-longstring", JSON.stringify(chunk.geometry.coordinates))
         chunkDivBody.innerHTML = `<br><br>`
         // chunkDivBody.innerHTML = `${JSON.stringify(chunk.geometry.coordinates)}<br><br>`
         // chunkDivBody.innerHTML = `<pre class='embedded-code-snippet'><code class='javascript'>"geometry": { "type": "Polygon", "coordinates": ${JSON.stringify(chunk.geometry.coordinates)} }</code></pre><br><br>`
         
         chunk_Div.appendChild(chunkDivHeader)
         chunk_Div.appendChild(chunkDivBody)

         coordsListingChunksDataWrapper_div.appendChild(chunk_Div);
      });
   }



   // // USER ACTION BUTTON EVENT HANDLERS
   // if (document.getElementById("btn_copy_coords")) {

   //    document.getElementById("btn_copy_coords").addEventListener('click', CopyToClipboard);
   // }



   // RENDERS THE DETAILS OF A SINGLE PARCELIZED AGC ON THE PAGE
   map.on('load', function () {


      ClearRenderedMapboxLayer();
      
      
      // JUMP TO TOP OF THE PAGE
      window.scrollTo(0, document.body.scrollTop, {behavior: "smooth"});


      // GET DATA FROM BACKEND TO USE TO RENDER THE PLOTS
      const parcelizedAgcGeojson = JSON.parse(GET_PARCELIZED_AGC_API_DATA());
      console.log(parcelizedAgcGeojson);


      // RENDER THE AGC SHAPEFILE
      RENDER_SHAPEFILE(map, leaflet_map, parcelizedAgcGeojson);
      
      
      // RENDER THE PLOTS ON THE MAP
      parcelizedAgcGeojson.features.forEach((farmPlot,idx)=>{
         drawChunk(farmPlot, idx, -0.005)
         console.log(farmPlot)
      });


      // RENDER THE PLOTS' COORDINATES IN THE DOM
      const farmPlotsGeojson = parcelizedAgcGeojson.features;
      renderDataOnDOM({parcelizedAgcGeojson, farmPlotsGeojson});
   });


// PREVENT THE MAIN SCRIPT FROM RENDERING RIGHT AWAY SO THAT THE LANDING PAGE DOESN'T FREEZE
// setTimeout(delayExecution, 5000);