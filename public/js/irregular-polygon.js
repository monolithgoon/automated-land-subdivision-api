import { map } from './main.js'
import { POLYGON_SUBDIVIDE } from './polygon-subdivide.js'
import { REFRESH_DOM } from "./dom-render.js";
import { RENDER_LAYER, GET_MAPBOX_POLYGON_LAYER, CLEAR_LAYERS } from "./mapbox-render.js";




export function GET_SHAPEFILE_GRID_DATA(polygonSelection) {


   // IRREGULAR POLYGON GRID CONFIG. PARAMS.
      const polygonMask = polygonSelection.features[0].geometry

      // const gridCellSide = 0.447 // ~20 ha. per cell
      // const gridCellSide = 0.3 // 9 ha. per cell
      // const gridCellSide = 0.2234 // 5.0 ha. per cell
      // const gridCellSide = 0.2 // 4.0 ha. per cell
      // const gridCellSide = 0.14128 // 2.0 ha. per cell
      // const gridCellSide = 0.1 // 1.0 ha. per cell
      // const gridCellSide = 0.0706 // 0.5 ha. per cell / 0.25 triangle grid
      // const gridCellSide = 0.0316 // 0.1 ha. per cell / 0.05 triangle grid
      // const gridCellSide = 0.0224 // 0.05 ha. per cell
      // const gridCellSide = 0.0158 // 0.025 ha. per cell
      const gridCellSide = 0.01413 // 0.02 ha. per cell => TURF LIMIT / 0.01 triangle grid
      // const gridCellSide = 0.01205 // 0.015 ha. per cell
      // const gridCellSide = 0.01105 // 0.012 ha. per cell
      
      const gridOptions = { units: 'kilometers', mask: polygonMask}

      // CONSTRUCT THE "PIXEL" GRID INSIDE THE IRR. POLY.
      // const primodialGrid = turf.squareGrid(turf.bbox(polygonSelection), gridCellSide, gridOptions)
      const primodialGrid = turf.triangleGrid(turf.bbox(polygonSelection), gridCellSide, gridOptions)
      // const primodialGrid = turf.hexGrid(turf.bbox(polygonSelection), gridCellSide, gridOptions)




   // SANDBOX >
   // SUBDIVIDE THE MAIN POLYGON
   const KATANA_POLYGONS = POLYGON_SUBDIVIDE(polygonSelection, polygonMask)

   


   // FILTER OUT GRID CELLS WHERE IT INTERSECTS THE MASKING POLYGON
   let polygonIntersectCells = [];
   let maskIntersectPolygons = [];
   let nonInteractingGridCells = [];

   primodialGrid.features.forEach(gridCell => {

      var borderCheck = turf.booleanOverlap(polygonMask, gridCell.geometry);
      
      if (borderCheck) {

         // these cells touch the masking polygon
         polygonIntersectCells.push(gridCell)

         // resulting polygon from clipping
         let intersectPolygon = turf.intersect(polygonMask, gridCell.geometry)
         if (intersectPolygon) {
            maskIntersectPolygons.push(turf.intersect(polygonMask, gridCell.geometry))
         }

      } else {

         // these cells aren't touching the masking polygon

         // remove cells that might be touching from the outside of the mask (turf.js bug)
         if (turf.booleanContains(polygonMask, gridCell)) {
            nonInteractingGridCells.push(gridCell)
         }
      }

   });



   
   // IMPORTANT > 
   // create a new feature collection to represent the grid cells not touching the mask
	const TRIMMED_GRID = turf.featureCollection(nonInteractingGridCells);
	
	const GRID_AREA = turf.area(TRIMMED_GRID)/10000;




   // GRID CELL PROPERTIES FUNCTION
   // IMPORTANT > TURF COORD. SYSTEM IS REP. AS [ lng, lat ] 
   function defineGridCellProps(feature, index) {

      if (feature !== null) {

         let coords = turf.coordAll(feature)
         let center = turf.getCoord(turf.centerOfMass(feature));
         let latitude = center[0], longitude = center[1];

         return feature.properties = { 
                              id: index+1,
                              plot_name: `Grid cell #${index+1}`,
                              density: Math.random(),
                              area: (turf.area(feature)/10000),
                              area_short: (turf.area(feature)/10000).toFixed(1),
                              area_rough: Math.round(turf.area(feature)/10000),
                              center: center,
                              center_lat: latitude,
                              center_lng: longitude,
                              bounds: turf.bbox(turf.polygon(feature.geometry.coordinates)),
                              // coords: coords,
                              topLeft: coords[0],
                              topRight: coords[1],
                              bottomRight: coords[2],
                              bottomLeft: coords[3]
         }
      }
   }



   // ASSIGN PROPERTIES TO GRID CELLS CONSTRAINED INSIDE THE IRREGULAR POLYGON 
   TRIMMED_GRID.features.forEach( (feature, index) => {
      defineGridCellProps(feature, index)
   })
   
   // ASSIGN PROPERTIES TO GRID POLYGONS RESULTING FROM THE KATANA SUBDIVISION & MASKING
   KATANA_POLYGONS.features.forEach( (feature, index) => {
      defineGridCellProps(feature, index)
   })


   
	// SANDBOX > 
	// SANDBOX > 

	// KATANA POLYGONS LAYERS
	const KATANA_GRIDLINES_LAYER = {
		id: "katanaGridLines",
		type: "line",
		source: {
			type: "geojson",
			data: KATANA_POLYGONS,
		},
		layout: {},
		paint: {
			// 'line-color': '#f0932b', // ORANGE
			// 'line-color': '#535c68', // BLACK
			// 'line-color': '#dff9fb', // pastel blue
			"line-color": "#535c68", // gandalf grey
			"line-dasharray": [2, 4],
			"line-opacity": 1,
			"line-width": 3,
		},
   };
   

	// EXPORT LABEL LAYERS FOR EACH KATAANA POLYGON
	const KATANA_POLYGON_LABELS = KATANA_POLYGONS.features.map(
		(katanaPolygon, index) => {
			let katanaPolygonCenter = turf.centerOfMass(katanaPolygon);

			const katanaPolygonLabel = {
				id: `katanaPolygonLabel_${index}`,
				type: "symbol",
				source: {
					type: "geojson",
					data: katanaPolygonCenter,
				},
				layout: {
					// "symbol-placement": "line",
					"text-font": ["Open Sans Regular"],
					"text-field": `${katanaPolygon.properties.area_rough} ha.`,
					"text-size": 20,
				},
				paint: {
					"text-color": "#130f40",
				},
			};
			return katanaPolygonLabel;
		}
	);

	// SANDBOX > 
	// SANDBOX > 
   

	// IRREGULAR POLYGON GRID LINES
	const GRIDLINES_LAYER = {
		id: "polygonGridLines",
		type: "line",
		source: {
			type: "geojson",
			data: TRIMMED_GRID,
		},
		layout: {},
		paint: {
			// 'line-color': '#f0932b', // ORANGE
			// 'line-color': '#535c68', // BLACK
			// 'line-color': '#dff9fb', // pastel blue
			"line-color": "#535c68", // gandalf grey
			"line-opacity": 1,
			"line-width": 0.4,
		},
   };
   

	// IRR. POLY. GRID INTERPOLATED FILL
	const GRID_FILL_LAYER = {
		id: "irregularPolyGridFill",
		type: "fill",
		source: {
			type: "geojson",
			data: TRIMMED_GRID,
		},
		layout: {},
		paint: {
			"fill-color": "#6ab04c",
			"fill-opacity": [
				"interpolate",
				["linear"],
				["get", "density"],
				0,
				0.1,
				1,
				0.2, // last number is overall opacity
			],
		},
	};



   return {
      GRID_AREA,
      TRIMMED_GRID,
      KATANA_POLYGONS,
      KATANA_GRIDLINES_LAYER,
      KATANA_POLYGON_LABELS,
      GRIDLINES_LAYER,
      GRID_FILL_LAYER,
   }
}



let shapefileArea; // init. shapefile area..
let layerID;
let renderedLayers = [];

export function RENDER_SHAPEFILE(map, leaflet_map, shapefile) {


	// CLEAR PREVIOUS RENDERED LAYERS
	if (renderedLayers.length > 0) {
		CLEAR_LAYERS(map, renderedLayers);
	}


	const area = turf.area(shapefile) / 10000
	const center = turf.coordAll(turf.centerOfMass(shapefile))[0]
	const bounds = turf.bbox(shapefile)
	const location = shapefile.features[0].properties.location


		
	// RE-POSITION THE MAP(S) TO MATCH THE SHAPEFILE'S CENTER
   map.flyTo({
		center: center,
		zoom: 16,
		// zoom: zoomSetting,
	})

	
	// CONTAIN THE ZOOM TO THE SHAPEFILE'S BOUNDS
	map.fitBounds(bounds, {padding: 20});


   // leaflet_map.flyTo([center[1], center[0]], 14);
   leaflet_map.setView([center[1], center[0]], 13.5);


   // ADD A MARKER TO THE CENTER
   let marker = new mapboxgl.Marker().setLngLat(center).addTo(map)


	// REMOVE > 
   // UPDATE THE POLYGON AREA ON THE DOM
   // REFRESH_DOM(area, location, center)


   // ADD LAYERS TO MAPBOX > IRREGULAR POLYGON OUTLINE
	layerID = "shapefileOutline"
	let shapefileOutline = GET_MAPBOX_POLYGON_LAYER(shapefile, {layerID, color: "#009432", thickness: 1, fillOpacity: null}).outlineLayer
	RENDER_LAYER(map, shapefileOutline)
	

   // IRREGULAR POLYGON FILL
	layerID = "shapefileFill"
	let shapefileFill = GET_MAPBOX_POLYGON_LAYER(shapefile, {layerID, color: "white", thickness: null, fillOpacity: 0.25}).fillLayer
	RENDER_LAYER(map, shapefileFill)


	// SAVE THE RENDERED LAYERS
	renderedLayers.push(shapefileOutline, shapefileFill)


   // RETURN THE AREA VARIABLE FOR COMPARISON WITH TOTAL ALLOCATION AREA ON CHUNKIFY BUTTON CLICK
   shapefileArea = area	
}



// FOR DISPLAY ON DOM
export function GET_SHAPEFILE_AREA() {

	return shapefileArea
}