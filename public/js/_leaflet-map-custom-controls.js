import { leaflet_map } from './main.js'


export function ACTIVATE_CUSTOM_CONTROLS() {
   
   // CUSTOM CONTROL > RESET MAP ZOOM CUSTOM CONTROL
   L.control
      .custom({
         position: "topleft",
         content: `
                  <div class="leaflet-custom-control-wrapper">
                     <div class= "leaflet-bar">
         					<button type="button" class="btn custom-control-btn" title="Resize map" aria-label="Resize map"><i class="fas fa-expand" style="font-size: 20px;"></i></button>
                     </div>
                     <label class="custom-control-btn-label map-resize-label" for="button">Resize Map</label>
                  </div>`,
         classes: "custom-control", // THIS WILL BE APPENDED TO THE DEFAULT CLASS: "leaflet-control"
         style: {
            // margin: "0 10px 0",
            // padding: "0"
         },
         datas: {
            foo: "bar"
         },
         events: {
            click: (evtObj) => {
   
               // EXPAND THE LEAFLET MAP
               toggleLeafletMapHeight()
            }
         }
      }).addTo(leaflet_map);


   // CUSTOM CONTROL > CLEAR ALL RENDERED LAYERS FROM MAP
   L.control
      .custom({
         position: "topleft",
         content: `
                  <div class="leaflet-custom-control-wrapper">
                     <div class= "leaflet-bar">
                        <button type="button" class="btn custom-control-btn" title="Resize map" aria-label="Resize map"><i class="fas fa-low-vision" style="font-size: 15px;"></i></button>
                     </div>
                     <label class="custom-control-btn-label map-clear-layers-label" for="button">Clear Map</label>
                  </div>`,
         classes: "custom-control", // THIS WILL BE APPENDED TO THE DEFAULT CLASS: "leaflet-control"
         style: {
            // margin: "0 10px 0",
            // padding: "0"
         },
         datas: {
            foo: "bar"
         },
         events: {
            click: (evtObj) => {
   
               // EXPAND THE LEAFLET MAP
               ClearRenderedLeafletLayers()
            }
         }
      }).addTo(leaflet_map);
      

   // REMOVE > 
   // // CUSTOM CONTROL > TURN-BY-TURN DIRECTIONS OVERLAY
   // L.control
   //    .custom({
   //       position: "topright",
   //       content: `<div>Walking turn-by-turn directions for selected farm plot..</div>`,
   //       classes: "turn-by-turn-directions-overlay",
   //       style: {
   //          position: "absolute",
   //          margin: "15px",
   //          top: "0",
   //          right: "0"
   //       }
   //    }).addTo(leaflet_map);
};

function toggleLeafletMapHeight() {

   const plotsDetailSection = document.getElementById(`plots_detail_section`);
   console.log({plotsDetailSection})

   const clusterSummaryEl = document.getElementById(`cluster_summary_container`);
   const clusterCoordsListingEl = document.getElementById(`cluster_coords_listing_container`);
   
   const leafletMap_div = document.getElementById('leaflet_map');
   const mapResizeIcon = document.querySelector('.custom-control-btn i');
   const mapResizeLabel = document.querySelector('.custom-control-btn-label.map-resize-label')   

   leafletMap_div.classList.toggle("expanded");

   if (leafletMap_div.classList.contains("expanded")) {
      if (plotsDetailSection) plotsDetailSection.style.gridTemplateRows = "1fr";
      if (clusterSummaryEl) clusterSummaryEl.style.display = "none";
      if (clusterCoordsListingEl) clusterCoordsListingEl.style.display = "none";
      if(leafletMap_div) leafletMap_div.style.height = "100%"; // INCREASE THE LEAFLET MAP HEIGHT
   } else {
      if (plotsDetailSection) plotsDetailSection.style.gridTemplateRows = "0.1fr auto 1fr";
      if (clusterSummaryEl) clusterSummaryEl.style.display = "grid";
      if (clusterCoordsListingEl) clusterCoordsListingEl.style.display = "block";
      if(leafletMap_div) leafletMap_div.style.height = "auto"; // INCREASE THE LEAFLET MAP HEIGHT
   };
   
   // TOGGLE THE FONT AWE. CLASSES
   if (mapResizeIcon){
      mapResizeIcon.classList.toggle("fa-expand"); // TOGGLE THE ICON TO EXPAND
      mapResizeIcon.classList.toggle("fa-compress"); // TOGGLE THE TO COMPRESS
   };
   
   // TOGGLE THE INNER TEXT OF THE CONTROL LABEL
   if (mapResizeLabel.innerText === "Expand Map") {
      mapResizeLabel.innerText = 'Compress Map'
   } else {
      mapResizeLabel.innerText = "Expand Map"
   }
}

// TODO > 
function ClearRenderedLeafletLayers() {
   console.log('coming soon..');
   leaflet_map.eachLayer( layer => {
      console.log(layer);
      if (!layer._zoom) {
         // leaflet_map.removeLayer(layer);
      }
   });
   // for (i in leaflet_map._layers) {
   //    // if (leaflet_map._layers[i].options.format === undefined) {
   //    if (m._layers[i]._path != undefined) {
   //       try {
   //          leaflet_map.removeLayer(leaflet_map._layers[i]);
   //       } catch (e) {
   //          console.log("problem with " + e + leaflet_map._layers[i]);
   //       }
   //    }
   // }
};