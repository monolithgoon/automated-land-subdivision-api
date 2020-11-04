'use strict'

import { GET_MAPBOX_POLYGON_LAYER, GET_LABEL_LAYER, CLEAR_LAYERS, RENDER_LAYER, POLYGON_FILL_BEHAVIOR } from "./mapbox-render.js"
import { RENDER_SHAPEFILE } from './irregular-polygon.js'


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
      style: 'mapbox://styles/mapbox/outdoors-v11',
      style: 'mapbox://styles/mapbox/cjcunv5ae262f2sm9tfwg8i0w', // Lè Shine
      center: [5.963833, 5.243506],
      pitch: 50,
      bearing: 10, // bearing in degrees
      zoom: 15,
      zoom: 7,
      zoom: 15.5,
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
   const RENDERED_LAYERS = [];


   // CLEAR PREVIOUS RENDERED LAYERS
   function clearPreviousLayers() {
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



   // RENDER PARCELIZED AGC DATA ON DOM
   function renderDataOnDOM({parcelizedAgcGeojson, farmPlotsGeojson}) {      


      // GET DOM ELEMENTS
      const chunksListing_Div = document.getElementById('chunks_coords_listing_container');
      const mapLocation_Div = document.getElementById('map_location_overlay')


      // VARIABLES
      const agcLocation = parcelizedAgcGeojson.properties.agc_location;
      const agcCenterCoords = [6.18, 6.53] // FIXME < update the parcelized AGC properties to include agc_center_coords 
      const allocationTotal = parcelizedAgcGeojson.properties.agc_area;
      const unallocatedLandArea = parcelizedAgcGeojson.properties.unused_land_area;

      
      
      // CLEAR THE LISTINGS EACH TIME THIS FN. IS CALLED
      // totalAllocation_Div.innerText = "";
      chunksListing_Div.innerText = "";
      mapLocation_Div.innerText = "";
      
      
      // POPULALTE THE DOM ELEMENTS
      // numFarmers_Div.innerText = farmPlotsGeojson.length;
      // totalAllocation_Div.innerText = `${allocationTotal.toFixed(1)} ha.`;
      // unusedLand_Div.innerText = `${(unallocatedLandArea).toFixed(1)} ha.`
      mapLocation_Div.innerText = agcLocation
      mapLocation_Div.innerText = `${agcLocation || 'Nigeria'} ${agcCenterCoords[0].toFixed(5)}°E ${agcCenterCoords[1].toFixed(5)}°N`


      const listingHeader_div = document.createElement('div')
      listingHeader_div.innerHTML = `Parcelized Plots' Coordinates <br><br>`
      listingHeader_div.className = "coords-listing-container-header"
      chunksListing_Div.appendChild(listingHeader_div);


      // APPLY STYLING
      chunksListing_Div.style.display = "block";
      chunksListing_Div.style.background = "#f5f6fa";
      chunksListing_Div.style.border = "grey 1px solid";

         
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
                                    Plot #${index + 1} <br> 
                                    ${chunk.properties.owner_name} - ${chunk.properties.owner_id} <br> 
                                    VAsT_ID ${chunk.properties.chunk_id} <br>`

         chunkDivBody.setAttribute("data-longstring", JSON.stringify(chunk.geometry.coordinates))
         chunkDivBody.innerHTML = `<br><br>`
         // chunkDivBody.innerHTML = `${JSON.stringify(chunk.geometry.coordinates)}<br><br>`
         // chunkDivBody.innerHTML = `<pre class='embedded-code-snippet'><code class='javascript'>"geometry": { "type": "Polygon", "coordinates": ${JSON.stringify(chunk.geometry.coordinates)} }</code></pre><br><br>`
         
         chunk_Div.appendChild(chunkDivHeader)
         chunk_Div.appendChild(chunkDivBody)

         chunksListing_Div.appendChild(chunk_Div);
      });
   }



   // RENDERS THE DETAILS OF A SINGLE PARCELIZED AGC ON THE PAGE
   map.on('load', function () {


      clearPreviousLayers();
      
      
      // JUMP TO TOP OF THE PAGE
      window.scrollTo(0, document.body.scrollTop, {behavior: "smooth"});


      // GET DATA FROM BACKEND
      const parcelizedAgcGeojson = JSON.parse(GET_PARCELIZED_AGC_API_DATA());
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
      renderDataOnDOM({parcelizedAgcGeojson, farmPlotsGeojson});
   });


// PREVENT THE MAIN SCRIPT FROM RENDERING RIGHT AWAY SO THAT THE LANDING PAGE DOESN'T FREEZE
// setTimeout(delayExecution, 5000);
