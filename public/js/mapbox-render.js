import { map } from "./main.js"



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
   
   "#2d3436", // dracula
   "#be2edd", // FUCHSIA
   "#FD7272", // geogia peach
   "#78e08f", // aurora green
   "#b71540", // jalepeno red
   "#f0932b", // orange
   "#EAB543", // turquoise 
   "#1B9CFC", // sea blue
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
   // const plotOwnerPhotoURL = layerProps.owner_photo_url === `undefined` ? `/images/person-default.png` : layerProps.owner_photo_url
   const plotOwnerPhotoURL =`/images/person-default.png`

   
   // const popup = new mapboxgl.Popup({ className: "mapbox-metadata-popup" })
   const popup = new mapboxgl.Popup( {closeOnClick: false} )
      .setLngLat(layerCenter)
      .setHTML(`<div class="mapbox-metadata-popup">

                  <div class="popup-text-wrapper">
                     <div class="popup-farmer-name">${layerProps.owner_name} </div>
                     BVN <span>hidden</span> <br>
                     Farmer_ID ${layerProps.owner_id.toUpperCase()} <br> 
                     VAsT_ID ${layerProps.chunk_id} <br>
                     Lat ${centerLat.toFixed(5)}°N Lng ${centerLng.toFixed(5)}°E <br>
                  </div>

                  <div class="popup-media-wrapper">
                     <img src="${plotOwnerPhotoURL}" alt="Plot Owner Photo" style="max-width:100%; opacity: 1;">
                  </div>
                  
               </div>`)
      .addTo(map);


      // CREATE A CUSTOM EVENT LISTENER >> TRIGGERED BY: map.fire('closeAllPopups')
   map.on('closeAllPopups', () => {
      popup.remove();
   });
}



export function POLYGON_FILL_BEHAVIOR(map, leaflet_map, polygonFillLayer) {

   const activeLayersIDs = [];

   map.on('click', `${polygonFillLayer.id}`, function(e) {

      // JUMP TO THE SATTELITE MAP @ BOTTOM OF THE PAGE
      window.scrollTo(0, document.body.scrollHeight, {behavior: "smooth"});

      // GEOJSON PROPERTIES
      const layer = e.features[0].layer;
      const props = e.features[0].properties;
      const geom = e.features[0].geometry;
      const coords = geom.coordinates[0];
      const center = e.lngLat;

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

         leaflet_map.setView(center, 16.5)
         
         
         // ADD A MARKER
         L.marker(center).addTo(leaflet_map);

         
         // RENDER A LEAFLET POLYGON TO REPRESENT THE FARM PLOT
         L.geoJSON(geom, {
            "color": "white", 
            "weight": 4,
            "opacity": 1
         }).addTo(leaflet_map);

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
         }).addTo(leaflet_map);  


         // SHOW THE FARM BOUNDARY COORDS. AS A LEAFLET ICON
         coords.forEach(coordinate => {
            L.marker(coordinate, {
               icon: L.divIcon({
                  className: 'chunk-polygon-label',
                  html: `${coordinate[0].toFixed(2)}, ${coordinate[1].toFixed(2)}`,
                  iconSize: [100,20]
               }),
               zIndexOffset: 1
            })
            .addTo(leaflet_map)
         });
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



   // REMOVE  
//    // // When a click event occurs on a feature in the states layer, open a popup at the
//    // // location of the click, with description HTML from its properties.
//    // map.on('click', 'regularPolyGrid', function(e) {
//    //    props = e.features[0].properties
//    //    new mapboxgl.Popup()
//    //       .setLngLat(e.lngLat)
//    //       .setHTML(`${props.id} <br> 
//    //                Area ~ ${props.area} ha. <br> 
//    //                Lat ${(props.latitude).toFixed(4)}, Lng ${(props.longitude).toFixed(4)}`)
//    //       .addTo(map);
//    // });
    
//    // // Change the cursor to a pointer when the mouse is over the states layer.
//    // map.on('mouseenter', 'regularPolyGrid', function() {
//    //    map.getCanvas().style.cursor = 'pointer';
//    // });
    
//    // // Change it back to a pointer when it leaves.
//    // map.on('mouseleave', 'regularPolyGrid', function() {
//    //    map.getCanvas().style.cursor = '';
//    // });

//    // When a click event occurs on a feature in the states layer, open a popup at the
//    // location of the click, with description HTML from its properties.
//    map.on('click', 'farmCellGrid_2', function(e) {
//       props = e.features[0].properties
//       new mapboxgl.Popup()
//          .setLngLat(e.lngLat)
//          .setHTML(`Farm #${props.id} <br> 
//                   Area ~ ${props.area} ha. <br> 
//                   Lat ${(props.latitude).toFixed(4)}, Lng ${(props.longitude).toFixed(4)}`)
//          .addTo(map);
//    });
    
//    // Change the cursor to a pointer when the mouse is over the states layer.
//    map.on('mouseenter', 'farmCellGrid_2', function() {
//       map.getCanvas().style.cursor = 'pointer';
//    });
    
//    // Change it back to a pointer when it leaves.
//    map.on('mouseleave', 'farmCellGrid_2', function() {
//       map.getCanvas().style.cursor = '';
//    });

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