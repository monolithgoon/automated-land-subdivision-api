import { map } from "./main.js"
import { getAnimatedPersonMarker } from "./_animated-svg-marker.js";



const colors = [
   "#088", // green
   "#f39c12", // ORANGE
   "#8e44ad", // wisteria purple
   "#eb4d4b", // red
   "#44bd32", // skittles green
   "#130f40", // indigo
   "#00a8ff", // blue
   "#535c68", // wizard grey
   "#EAB543", // honey glow
   "#a29bfe", // light indigo
   "#686de0", // purple
   "#f9ca24", // yellow
   "#2d3436", // dracula
   "#be2edd", // FUCHSIA
   "#FD7272", // geogia peach
   "#78e08f", // aurora green
   "#b71540", // jalepeno red
   "#f0932b", // orange
   "#EAB543", // turquoise 
   "#1B9CFC", // sea blue
   "#57606f", // grisaillee (dark grey)
   "#3742fa", // bright greek (dark blue)
   "#2d3436", // dracula
   "#be2edd", // FUCHSIA
   "#FD7272", // geogia peach
   "#78e08f", // aurora green
   "#b71540", // jalepeno red
   "#f0932b", // orange
   "#EAB543", // turquoise 
   "#1B9CFC", // sea blue
   "#b2bec3", // soothing breeze (grey)
   "#a4b0be", // peace (grey)
   "#fd79a8", // pico-8 pink
   "#00b894", // mint leaf (green)

   // DUTCH PALETTE
   "#ED4C67", // bara red
   "#B53471", // very berry
   "#833471", // hollyhock
   "#6F1E51", // magenta purple
   
   "#088", // green
   "#f39c12", // ORANGE
   "#8e44ad", // wisteria purple
   "#eb4d4b", // red
   "#44bd32", // skittles green
   "#130f40", // indigo
   "#00a8ff", // blue
   "#535c68", // wizard grey
   "#EAB543", // honey glow
   "#a29bfe", // light indigo
   "#686de0", // purple
   "#f9ca24", // yellow
   "#2d3436", // dracula
   "#be2edd", // FUCHSIA
   "#FD7272", // geogia peach
   "#78e08f", // aurora green
   "#b71540", // jalepeno red
   "#f0932b", // orange
   "#EAB543", // turquoise 
   "#1B9CFC", // sea blue
   "#57606f", // grisaillee (dark grey)
   "#3742fa", // bright greek (dark blue)
   "#2d3436", // dracula
   "#be2edd", // FUCHSIA
   "#FD7272", // geogia peach
   "#78e08f", // aurora green
   "#b71540", // jalepeno red
   "#f0932b", // orange
   "#EAB543", // turquoise 
   "#1B9CFC", // sea blue
   "#b2bec3", // soothing breeze (grey)
   "#a4b0be", // peace (grey)
   "#fd79a8", // pico-8 pink
   "#00b894", // mint leaf (green)

   // DUTCH PALETTE
   "#ED4C67", // bara red
   "#B53471", // very berry
   "#833471", // hollyhock
   "#6F1E51", // magenta purple
]

const getLayerColor = (index) => {
   return colors[index] ? colors[index] : 'white'
}



// THIS CREATES A FILL LAYER FROM A GEOJSON featureCollection
export function RENDERED_FEAT_COLL_LAYER(geojson, featureIdx) {

   const fillLayer = {
      id: `featCollFill_${featureIdx}`,
      type: "fill",
      source: {
         type: "geojson",
         data: geojson,
      },
      paint: {
         "fill-color": `${getLayerColor(featureIdx)}`,
         // "fill-opacity": 0.3,
         "fill-opacity": 0.01,
      },
   }

   const outlineLayer = {
      id: `featCollOutline_${featureIdx}`,
      type: "line",
      source: {
         type: "geojson",
         data: geojson,
      },
      paint: {
			"line-color": `${getLayerColor(featureIdx)}`,
			"line-opacity": 1,
			// "line-width": 3,
			"line-width": 1,
      },
   }
   
   return {
      fillLayer,
      outlineLayer
   }
}



// THIS CREATES A FILL LAYER FROM A GEOJSON POLYGON.
export function GET_MAPBOX_POLYGON_LAYER(geojson, {layerID, color, thickness, fillOpacity} = {}) {
    
   let layerColor = getLayerColor(layerID)
   
   const fillLayer = {
      id: `geojsonPolygon_${layerID}`,
      type: "fill",
      source: {
         type: "geojson",
         data: geojson,
      },
      paint: {
         "fill-color": `${color || layerColor}`,
         "fill-opacity": fillOpacity || 0.2,
      },
   }
   
   const outlineLayer = {
   
      id: `polygonOutline_${layerID}`,
      type: "line",
      source: {
         type: "geojson",
         data: geojson,
      },
      paint: {
			"line-color": `${color || layerColor}`,
			"line-opacity": 1,
			"line-width": thickness || 1,
      },
   }
   
   return {
      fillLayer,
      outlineLayer
   }
}



export function RENDERED_FEAT_COLL_LAYER_CLICK(map, geojsonFillLayer) {
   
   // CHANGE POINTER APPEARANCE OVER THIS LAYER
   map.on('mouseenter', `${geojsonFillLayer}`, function() {
      map.getCanvas().style.cursor = 'pointer';
   })
   
   // ADD CLICK BEHAVIOUR TO THIS LAYER
   map.on('click', `${geojsonFillLayer}`, function(e) {
      const layer = e.features[0].layer;
      const props = e.features[0].properties;
      const geom = e.features[0].geometry;
      const coords = geom.coordinates[0];
      const center = e.lngLat;

      // OPEN A MAPBOX POPUP
      new mapboxgl.Popup()
         .setLngLat(e.lngLat)
         .setHTML(`
         Polygon #${layer.id} <br> 
         Area: ${props.area.toFixed(1)} ha.`)
         .setHTML('fuck you chioma you cunt')
         .addTo(map);
   })
};



// CLEAR THE OLD LAYERS & RENDER THE NEW LAYER
export function CLEAR_LAYERS ({map, renderedLayers=null, layerIDs=null}) {

   if (renderedLayers) {
      renderedLayers.forEach(layer => {
         if(map.getSource(layer.id)) {
            map.removeLayer(layer.id);
            map.removeSource(layer.id)
         }
      });
   }

   if (layerIDs) {
      layerIDs.forEach(layerID => {
         if(map.getSource(layerID)) {
            map.removeLayer(layerID)
            map.removeSource(layerID)
         }
      });
   }
}



export function RENDER_LAYER (map, layer) {
   
   if (map.getSource(layer.id)) {
      map.removeLayer(layer.id);
      map.removeSource(layer.id)
      map.addLayer(layer)

   } else {
      
      // INITIAL STATE > THERE WERE NO LAYERS ON MAP
      map.addLayer(layer)
   }

   // console.log(map.getStyle().sources);
};      



// OPEN A POPUP OVER A RANDOMLY SELECTED FARM ON MAP LOAD & DISPLAY GRID CELL SIZE
export function OPEN_RANDOM_POPUP(map, pixelGrid) {
   const features = pixelGrid.features
   const numPixels = pixelGrid.features.length
   const randomPixel = features[Math.floor(Math.random()*numPixels)]
   const pixelProps = randomPixel.properties

   // CLEAR ALL POPUPS FROM MAP
   map.fire('closeAllPopups')
   
   const gridCellPopup = new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat([pixelProps.center_lat, pixelProps.center_lng])
      .setHTML(`(${pixelProps.area.toFixed(3)} ha.)`)
      // .addTo(map);

   if (gridCellPopup.isOpen()) {
      console.log('fuck chioma iloanusi');
      gridCellPopup.remove();
   } else {
      // gridCellPopup.trackPointer();
      gridCellPopup.addTo(map)
   }
};



// SETUP MAPBOX LAYER EVENT LISTENERS
// When a click event occurs on a feature in the grid fill layer, open a popup at the
// location of the click, with description HTML from its properties.

function toggleMetadataPopup(map, layerProps, layerCenter) {


   // LAYER PROPERTIES
   const layerArea = layerProps.chunk_size;
   const centerLat = layerProps.center_lat ? layerProps.center_lat : "...";
   const centerLng = layerProps.center_lng ? layerProps.center_lng : "...";
   const plotOwnerPhotoURL = layerProps.owner_photo_url === `undefined` ? `/assets/icons/person-default.png` : layerProps.owner_photo_url

   
   // const popup = new mapboxgl.Popup({ className: "mapbox-metadata-popup" })
   const popup = new mapboxgl.Popup( {closeOnClick: false} )
      .setLngLat(layerCenter)
      .setHTML(`<div class="mapbox-metadata-popup">

                  <div class="popup-text-wrapper">
                     <div class="popup-farmer-name">${layerProps.owner_name} </div>
                     BVN <span>hidden</span> <br>
                     FarmerID • ${layerProps.owner_id.toUpperCase()} <br> 
                     VAsTID • ${layerProps.chunk_id} <br>
                     Lat ${centerLat.toFixed(5)}°N Lng ${centerLng.toFixed(5)}°E <br>
                  </div>

                  <div class="popup-media-wrapper">
                     <img class="object-fit-test" src="${plotOwnerPhotoURL}" alt="Plot Owner Photo" style="max-width:100%; opacity: 1;">
                  </div>
                  
               </div>`)
      .addTo(map);


      // CREATE A CUSTOM EVENT LISTENER >> TRIGGERED BY: map.fire('closeAllPopups')
   map.on('closeAllPopups', () => {
      popup.remove();
   });
}



// MATH FORMULA TO CALC. BEARING
function CalculateBearing (fromCoords, toCoords) {

   const lat1 = fromCoords[0];
   const long1 = fromCoords[1];
   const lat2 = toCoords[0];
   const long2 = toCoords[1];
   
   // CONVERT COORDS. TO RADIANS > φ is latitude, λ is longitude in radians
   const φ1 = lat1 * Math.PI/180; 
   const φ2 = lat2 * Math.PI/180;
   const λ1 = long1 * Math.PI/180;
   const λ2 = long2 * Math.PI/180;

   const y = Math.sin(λ2-λ1) * Math.cos(φ2);
   const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
   const θ = Math.atan2(y, x);
   const bearing = (θ*180/Math.PI + 360) % 360; // in degrees
   
   return bearing
}



// CONVERT DEGREES TO DEG. MIN. SEC. (DMS) FORMAT
function toDegreesMinutesAndSeconds (deg) {
   var absolute = Math.abs(deg);

   var degrees = Math.floor(absolute);
   var minutesNotTruncated = (absolute - degrees) * 60;
   var minutes = Math.floor(minutesNotTruncated);
   var seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

   return `${degrees}° ${minutes}' ${seconds}"`
}



export function POLYGON_FILL_BEHAVIOR(map, leaflet_map, polygonFillLayer) {

   try {

      const activeLayersIDs = [];


      // Create group for your layers and add it to the map
      var leafletLayerGroup = L.layerGroup().addTo(leaflet_map);


      map.on('click', `${polygonFillLayer.id}`, function(e) {

         // JUMP TO THE SATTELITE MAP @ BOTTOM OF THE PAGE
         window.scrollTo(0, document.body.scrollHeight, {behavior: "smooth"});

         // CLEAR THE PREVIOUS LEAFLET LAYERS
         console.log(leafletLayerGroup);
         leafletLayerGroup.clearLayers();

         // GET THE GEOJSON PROPERTIES
         const layer = e.features[0].layer;
         const props = e.features[0].properties;
         const geom = e.features[0].geometry;
         const coords = geom.coordinates[0];
         const center = e.lngLat;
         const turfCenter = turf.centerOfMass(geom).geometry.coordinates; // LNG. LAT. FORMAT
         const leafletCenter = [turfCenter[1], turfCenter[0]] // CONVERT TO LAT. LNG FORMAT
         console.log(props);

         // MAPBOX LAYER ID
         const layerIndex = props.chunk_index;
         const layerID = `${layerIndex}_${Math.random() * 99999998}`;

         // KEEP TRACK OF THE CLICKED LAYERS
         const clickedLayerID = `clickedPolyon_${layerID}`
         activeLayersIDs.push(clickedLayerID)


         // OPEN A MAPBOX POPUP
         toggleMetadataPopup(map, props, center);

         // COLOR THE GRID CELL THAT WAS CLICKED
         map.addLayer ({
            'id': `clickedPolyon_${layerID}`,
            'type': 'fill',
            'source': {
            'type': 'geojson',
            'data': geom
            },
            'paint': {
               //   'fill-color': '#686de0', // INDIGO
               // 'fill-color': '#F19066', // SALMON
               'fill-color': colors[layerIndex-1],
               'fill-opacity': 0.3,
            }
         })



         // RENDER THE FARM PLOT IN THE LEAFLET MINI MAP       
         // leaflet_map.setView(center, 17.5);
         const bufferedPlot = turf.buffer(geom, 0.09, {unit: 'kilometers'})
         const plotBounds = L.geoJson(geom).getBounds();
         leaflet_map.fitBounds(plotBounds, {padding: [150, 50]}); // PADDING: [L-R, T-D]
         
         

         // // ADD A MARKER TO PLOT CENTER
         // // L.marker(center).addTo(leaflet_map);
         // L.marker(leafletCenter).addTo(leafletLayerGroup);
         


         // RENDER A LEAFLET POLYGON TO REPRESENT THE FARM PLOT
         L.geoJSON(geom, {
            "color": "white", 
            "weight": 4,
            "opacity": 1
         // }).addTo(leaflet_map);
         }).addTo(leafletLayerGroup);



         // FILL THE POLYGON
         // FIXME > THE COORD. SYSTEM HERE IS OFF..
         L.polygon([...coords], {
            style: {
               fillColor: "green",
               fillOpacity: 0.5,
               color: "white",
               weight: 3,
               dashArray: '3',
               opacity: 3,
            }
         // }).addTo(leaflet_map);  
         }).addTo(leafletLayerGroup);  



         // DISPLAY PLOT METADATA AT CENTER OF PLOT
         L.marker(leafletCenter, {
            draggable: true,
            icon: L.divIcon({
               className: 'plot-metadata-label',
               html: `
                     <div class= "plot-metadata-label--chunk-size"> 
                        <span> ${props.chunk_size} hectares </span>
                        <span> ${(props.chunk_size * 2.47105).toFixed(1)} acres </span> 
                     </div>
                     <div class="metadata-label--owner-info"> 
                        <span> Plot-${props.chunk_index} </span>
                        <span> ${props.owner_name} </span>
                     </div>
                     <div class="metadata-label--turn-by-turn" id="metadata_label_turn_by_turn">
                        <a href="#" role="button" title="Plot boundary turn-by-turn directions" aria-label="Plot boundary turn-by-turn directions"></a>
                           <span >
                              <i id="" class="fas fa-route"></i>
                           </span>
                     </div>`,
            }),
            zIndexOffset: 100
         }).addTo(leafletLayerGroup);


         
         // ADD EVT. LIST. TO TURN-BY-TURN ICON
         document.querySelectorAll(".metadata-label--turn-by-turn i").forEach( icon => {
            icon.addEventListener('click', ()=> {
               document.getElementById('leaflet_map_overlay_extended').classList.toggle('show-element');
            });
         });



         // BUILD A GLOBAL DATA OBJ. WITH THE NAV. INFO. FOR EACH PLOT
         const FARM_PLOT_NAV_DATA_MAP = {
            farm_plot : {
               plot_index: 0,
               start_coords: 0,
               vertex_pairs: [],
               vertex_bearings: [],
               vertex_deltas: []
            }
         };


         // SHOW THE DISTANCE & BEARING BTW. FARM PLOT CORNERS
         for (let idx = 0; idx < coords.length; idx++) {

            // REFERENCE THE INDEX OF THIS PLOT
            FARM_PLOT_NAV_DATA_MAP.farm_plot.plot_index = props.chunk_index;

            const plotCorner = coords[idx];

            const fromPlotCorner = coords[idx];
            const toPlotCorner = coords[idx + 1] === undefined ? coords[0] : coords[idx + 1]; // RETURN BACK TO STARTING CORNER

            // SAVE THE CURRENT PLOT CORNERS > REMOVE THE REDUNDANT PAIR @ START POINT..
            // if (fromPlotCorner[0] !== toPlotCorner[0] && fromPlotCorner[1] !== toPlotCorner[1]) {
               FARM_PLOT_NAV_DATA_MAP.farm_plot.vertex_pairs.push([fromPlotCorner, toPlotCorner]);
            // }

            const midpoint = turf.midpoint(fromPlotCorner, toPlotCorner)
            const midpointCoords = midpoint.geometry.coordinates; // TO PLACE THE DIST. LABELS
            const distance = turf.distance(fromPlotCorner, toPlotCorner, {units: 'kilometers'}) * 1000;
            const turfBearing = turf.distance(fromPlotCorner, toPlotCorner, {units: 'degrees'});
            const mathBearing = CalculateBearing(fromPlotCorner, toPlotCorner);
            const degMinSec = toDegreesMinutesAndSeconds(mathBearing); // CONVERT bearing to 0° 0' 4.31129" FORMAT    


            // YOU ARE AT STARTING POINT WHEN BEARING === 0
            // DON'T SHOW A MIDPOINT DIST. MARKER HERE
            // ONLY SHOW LABELS IF DIST. BTW. VERTICES > 5.0 meters
            if (turfBearing !== 0 && distance > 5) {

               // SHOW THE PLOT VERTICES AS LEAFLET ICONS
               // IMPORTANT 
               // NOTE: COORDS. IN LEAFLET ARE "latLng" 
               // NOTE: COORDS. IN MAPBOX ARE "lngLat"
               L.marker([plotCorner[1], plotCorner[0]], {
                  icon: L.divIcon({
                     className: 'plot-polygon-vertex-coords-label',
                     html: `<span>${idx}</span> ${plotCorner[0].toFixed(6)}°N, ${plotCorner[1].toFixed(6)}°E`,
                     iconSize: [70, 15]
                  }),
                  zIndexOffset: 98
                  
               }).addTo(leafletLayerGroup);   
               

               // SHOW DIST. BTW. CORNERS ONLY (FOR SMALL SCREENS)
               L.marker([midpointCoords[1], midpointCoords[0]], {
                  draggable: true,
                  icon: L.divIcon({
                     className: 'plot-polygon-vertex-dist-label',
                     html: `${distance.toFixed(0)} m`,
                     iconSize: [30, 15]
                  }),
                  zIndexOffset: 99
   
               // }).addTo(leaflet_map);
               }).addTo(leafletLayerGroup);

               
               // SHOW DIST. & BEARING (FOR DESKTOP)
               L.marker([midpointCoords[1], midpointCoords[0]], {
                  draggable: true,
                  icon: L.divIcon({
                     className: 'plot-polygon-vertex-dist-bearing-label',
                     html: `${distance.toFixed(0)} m, ${degMinSec}`,
                     iconSize: [30, 15]
                  }),
                  zIndexOffset: 99
   
               // }).addTo(leaflet_map);
               }).addTo(leafletLayerGroup);
               
               
               // SAVE THE BEARING BTW. THE VERTICES
               FARM_PLOT_NAV_DATA_MAP.farm_plot.vertex_bearings.push(mathBearing);
               FARM_PLOT_NAV_DATA_MAP.farm_plot.vertex_deltas.push(distance);
               

            } else if (turfBearing === 0) {

               // THE BEARING == 0 => THAT CORNER IS THE PLOT "STARTING" POINT

               // SAVE THE BEARING & COORDS. @ 0
               FARM_PLOT_NAV_DATA_MAP.farm_plot.start_coords = plotCorner;
               // FARM_PLOT_NAV_DATA_MAP.farm_plot.vertex_bearings.unshift(mathBearing);
               
               // ADD AN ANIMATED MARKER
               leafletLayerGroup.addLayer(getAnimatedPersonMarker([plotCorner[1], plotCorner[0]]));
               // L.marker([plotCorner[1], plotCorner[0]]).addTo(leafletLayerGroup);               
            }
         }

         // DATA OBJ. WITH THE NAV. INFO. FOR EACH PLOT
         console.log({...FARM_PLOT_NAV_DATA_MAP});
      });


    
      // Change the cursor to a pointer when the mouse is over the grid fill layer.
      map.on('mouseenter', `${polygonFillLayer.id}`, function(e) {

         map.getCanvas().style.cursor = 'pointer';

         // GEOJSON PROPS.
         const props = e.features[0].properties;
         const center = e.lngLat

         // MAPBOX LAYER ID
         const layerIndex = props.chunk_index;
         const layerID = `${layerIndex}_${Math.random() * 99999998}`;

         // KEEP TRACK OF THE MOUSED OVER LAYERS
         const mouseoverLayerID = `mousedOverPolygon_${layerID}`
         activeLayersIDs.push(mouseoverLayerID);
         
         // CREATE POPUP
         toggleMetadataPopup(map, props, center);
      });

   
   
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', `${polygonFillLayer.id}`, function() {
         
         map.getCanvas().style.cursor = '';

         // CLOSE ALL OPEN POPUPS
         map.fire('closeAllPopups')
         
      });



   } catch (err) {
      console.log(err.message)
   }

}



// SANDBOX >
// GENERIC FUNCTION TO RENDER GEOJSON OBJECTS
export function RENDER_GEOJSON(geojson, {layerID, color, thickness, fillOpacity} = {}) {
   
   if (turf.getType(geojson) === "FeatureCollection") {

      geojson.features.forEach((polygon, idx) => {

         polygon.properties["id"] = idx; // FIXME < ALL POLYGONS SHOULD ALREADY HAVE AN ID PROPERTY 
         RENDER_LAYER(map, RENDERED_FEAT_COLL_LAYER(polygon, idx).fillLayer);
         RENDER_LAYER(map, RENDERED_FEAT_COLL_LAYER(polygon, idx).outlineLayer);
   
         // RENDERED_FEAT_COLL_LAYER_CLICK(map, RENDERED_FEAT_COLL_LAYER(polygon));
   
         // CHANGE POINTER APPEARANCE OVER THIS LAYER
         map.on('mouseenter', `${RENDERED_FEAT_COLL_LAYER(polygon, idx).fillLayer}`, function() {
            map.getCanvas().style.cursor = 'pointer';
         })
      })

   } else if (turf.getType(geojson) === "Polygon") {

      RENDER_LAYER(map, GET_MAPBOX_POLYGON_LAYER(geojson, {layerID, color, thickness, fillOpacity}).fillLayer)
      RENDER_LAYER(map, GET_MAPBOX_POLYGON_LAYER(geojson, {layerID, color, thickness, fillOpacity}).outlineLayer)

   } else {

      console.log(turf.getType(geojson));
      alert(`Your geojson is a (${turf.getType(geojson)}), and probably has unbounded holes..`)
   }
};



// SANDBOX > 
export function RENDER_SIMPLE_SHAPEFILE(shapefile, {layerID, color, thickness, fillOpacity} = {}) {

   if (layerID) {

      if (turf.getType(shapefile) === "FeatureCollection") {
   
         if(shapefile.features.length > 1) {
   
            alert('Your shapefile cannot have separate polygons..')
   
         } else {
            
            RENDER_LAYER(map, RENDERED_FEAT_COLL_LAYER(shapefile, layerID).fillLayer);
            RENDER_LAYER(map, RENDERED_FEAT_COLL_LAYER(shapefile, layerID).outlineLayer);
      
            // RENDERED_FEAT_COLL_LAYER_CLICK(map, RENDERED_FEAT_COLL_LAYER(shapefile));
      
            // CHANGE POINTER APPEARANCE OVER THIS LAYER
            console.log(RENDERED_FEAT_COLL_LAYER(shapefile, layerID).fillLayer);
            map.on('mouseenter', `${RENDERED_FEAT_COLL_LAYER(shapefile, layerID).fillLayer}`, function() {
               map.getCanvas().style.cursor = 'pointer';
            })
         }
      
      } else if (turf.getType(shapefile) === "Polygon") {
   
         RENDER_LAYER(map, GET_MAPBOX_POLYGON_LAYER(shapefile, {layerID, color, thickness, fillOpacity}).fillLayer)
         RENDER_LAYER(map, GET_MAPBOX_POLYGON_LAYER(shapefile, {layerID, color, thickness, fillOpacity}).outlineLayer)
   
      } else {
   
         console.log(turf.getType(shapefile));
         alert(`Your shapefile is a (${turf.getType(shapefile)}), and probably has unbounded holes..`)
      }

   } else {

      alert(`This shapefile does not seem to have a layerID..`)
   }
      

}



// CREATE MAPBOX LAYER FOR LABELS
export function GET_LABEL_LAYER(polygon, id, magnitude) {

   let polygonCenter = turf.centerOfMass(polygon);

   const polygonLabel = {
      'id': `polygonLabel_${id}`,
      "type": "symbol",
      'source': {
         'type': 'geojson',    
         data: polygonCenter
      },
      "layout": {
         // "symbol-placement": "line",
         "text-font": ["Open Sans Regular"],
         // "text-field": `Chunk #${id} ${magnitude} ha.`,
         "text-field": `Plot #${id} (${magnitude} ha.)`,
         // "text-field": `${magnitude} ha.`,
         // "text-size": 10
         "text-size": 10
      },
      "paint": {
         "text-color": "black"
      }
   }

   return polygonLabel

}