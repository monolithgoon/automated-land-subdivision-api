
export function CHUNKIFY(chunksGrid, farmAllocations) {

   // GRID ASSIGNMENT PARAMETERS
   const gridCells = chunksGrid.features
   // let cellSize = 4 // hectares
   // let cellSize = 2 // hectares
   // let cellSize = 1 // hectares
   // let cellSize = 0.1 // hectares
   // let cellSize = 0.05 // hectares per. cell (using sqareGrid)
   // let cellSize = 0.025 // hectares per. cell (using sqareGrid)
   // let cellSize = 0.02 // hectares per. cell (using sqareGrid)
   // let cellSize = 0.015 // hectares per. cell (using sqareGrid)
   
   // let cellSize = .25 // hectares per. cell (using triangleGrid)
   // let cellSize = .05 // hectares per. cell (using triangleGrid)
   // let cellSize = .025 // hectares per. cell (using triangleGrid)
   // let cellSize = .013 // hectares per. cell (using triangleGrid)
   let cellSize = .01 // hectares per. cell (using triangleGrid) ***
   // let cellSize = .007 // hectares per. cell (using triangleGrid)

   // let cellSize = .038 // hectares per. cell (using hexGrid)


   // CONVERT FARMERS HA. ALLOC. TO A COUNT OF GRID CELLS 
   let hectrageGridCells = farmAllocations.map(hectrage => hectrage/cellSize) // [150, 150, 200, 50 ... etc]


   // GRID CHUNKING PER. FARMER HA. ALLOCATION
   // ASSIGN GRID CELLS CHUNKS BASED ON FARMER HECTARAGE
   let startIndex = 0
   const GRID_CHUNKS = [];
   const chunksCellsCoordsArr = []
   const chunksAreas = [];

   const totalGridCells = hectrageGridCells.reduce((allocation, sum) => {

      sum = sum + allocation

      // GET A CHUNK OF GRID CELLS FOR EACH HEACTRAGE ALLOC.
      let chunk = gridCells.slice(allocation, sum) 

      
      // BUILD AN ARRAY OF ALLOCATED CHUNKS
      GRID_CHUNKS.push(chunk)

      
      // BUILD AN ARRAY OF THE GEOMETRIES OF THE ALLOCATED CHUNKS
      let chunkGridCellGeometries = turf.featureCollection(chunk).features.map(gridCell => {
         return gridCell.geometry
      });


      // BUILD AN ARRAY OF THE COORDINATES OF THE ALLOCATED CHUNKS
      let chunkGridCellCoordinates = chunkGridCellGeometries.map(gridCell => {
         return gridCell.coordinates
      })


      // BUILD THE ARRAY
      chunksCellsCoordsArr.push(chunkGridCellCoordinates)
      
      return sum
      
   }, startIndex)


   // CALCULATE TOTAL HECTRAGE
   const TOTAL_HECTARES = totalGridCells * cellSize







   // BUILD 4 ARRAYS FROM EACH CHUNK: 
   // ARRAY 1 & 2: THE FIRST & LAST CELLS OF EACH CHUNK
   // ARRAY 3: THE ENDS OF EACH CHUNK'S ROWS
   // ARRAY 4: THE BEGINNING OF EACH CHUNK'S ROWS

   let chunkFirstCells = []
   let chunkLastCells = []

   let chunkRowsEndCells = []
   let chunkNextRowStartCells = []


   // LOOP THRU CHUNKS
   for (let chunkIndex = 0; chunkIndex < GRID_CHUNKS.length; chunkIndex++) {
      
      // GET CHUNK
      let chunk = GRID_CHUNKS[chunkIndex];
      
      
      // keep track of the first cell of each chunk
      let chunkFirstCell = chunk[0].properties.id - 1
      // let cfc_tl_vertex = chunk[0].geometry.coordinates[0][0]
      // let cfc_bl_vertex = chunk[0].geometry.coordinates[0][3]
      
      // chunkFirstCells.push([cfc_tl_vertex, cfc_bl_vertex])
      chunkFirstCells.push(chunkFirstCell)


      // keep track of the last cell of each chunk
      let chunkLastCell = chunk[chunk.length - 1].properties.id - 1
      // let clc_tr_vertex = chunk[chunk.length - 1].geometry.coordinates[0][1]
      // let clc_br_vertex = chunk[chunk.length - 1].geometry.coordinates[0][2]
      // let clc_bl_vertex = chunk[chunk.length - 1].geometry.coordinates[0][3]

      // chunkLastCells.push([clc_tr_vertex, clc_br_vertex, clc_bl_vertex])
      chunkLastCells.push(chunkLastCell)

      
      // row endING CELLS
      let borderlessCells = []
      

      // row startING CELLS
      let nextRowStartCells = []


      // loop thru THE cells & IDENTIFY ROW ENDS
      for (let cell_idx = 0; cell_idx < chunk.length; cell_idx++) {

         let cell, adjCell

         // get adjacent cell index
         let adj_cell_idx = cell_idx + 1

         cell = chunk[cell_idx]
         adjCell = chunk[adj_cell_idx];

         // check for shared boundary btw. both

         if (adjCell) { 
         // handle edge case where adj_cell_idx > chunk.length
         // because adj_cell_idx = cell_idx + 1

            const borderIntersect = turf.intersect(cell, adjCell)
         
            // boundary is shared ..
            if (borderIntersect) {

               // do nothing

            }

            // boundary not shared
            else {

               // return the index of borderless cell

               let rowEndCell = chunk[cell_idx]

               let rowEndCell_id = rowEndCell.properties.id - 1 // id
               // let rowEndCell_name = rowEndCell.properties.plot_name // plot_name
               // let rec_tr_vertex = rowEndCell.geometry.coordinates[0][1] // top right coords.
               // let rec_br_vertex = rowEndCell.geometry.coordinates[0][2] // bottom right coords.

               // borderlessCells.push(rec_tr_vertex, rec_br_vertex)
               borderlessCells.push(rowEndCell_id)


               // return the index of cell after the borderless cell => ie., next row cell
               let nextRowStartCell = chunk[cell_idx + 1]

               let nextRowStartCell_id = nextRowStartCell.properties.id - 1 
               // let nrsc_tl_vertex = nextRowStartCell.geometry.coordinates[0][0]
               // let nrsc_bl_vertex = nextRowStartCell.geometry.coordinates[0][3]

               // nextRowStartCells.push(nrsc_tl_vertex, nrsc_bl_vertex)
               nextRowStartCells.push(nextRowStartCell_id)

            }
         }
      }
      chunkRowsEndCells.push(borderlessCells)
      chunkNextRowStartCells.push(nextRowStartCells)
   }




   // CONSTRUCT AN ARRAY OF EACH CHUNKS' CORNERS

   const chunksCorners = []

   // NB: chunkFirstCells.Length === NUMBER OF ROWS THE CHUNK HAS

   for (let i = 0; i < chunkFirstCells.length; i++) {
      const wtf1 = chunkFirstCells[i];
      const wtf2 = chunkRowsEndCells[i];
      const wtf3 = chunkNextRowStartCells[i];
      const wtf4 = chunkLastCells[i];

      // corners.push([wtf1, wtf3, wtf2, wtf4])
      chunksCorners.push([wtf1, ...wtf3, ...wtf2, wtf4])
      // chunksCorners.push([...wtf1, ...[...wtf3], ...[...wtf2], ...wtf4]) // I used this when working with coordinates
   }



   // FOR EACH CHUNK, CREATE AN ARRAY OF CORNERS
   const sortedChunksCorners = chunksCorners.map(corners => {
      // sort the corners & filter out duplicates
      // return Array.from((new Uint32Array(corners)).sort()) // faster numbers sorting using a TypedArray
      return Array.from(new Set(corners.sort((a,b)=>a-b))) 
   })





   // CREATE ROWS BASED ON EACH CHUNK'S CORNERS
   const chunksRows = [] // rows of each chunk

   sortedChunksCorners.forEach(cornersArray => {

      let slicePoints = []
      let rows = []
      
      for (let i = 0; i < cornersArray.length; i++) {
      
         const currentElement = cornersArray[i];
      
         // slice the array where the next element is greater by 1
         // that condition indicats a new row
         // search thru the array and locate the element that is 1 greater than currentElement
         if (cornersArray.indexOf(currentElement + 1) > 0) {
      
            // console.log(`slice here: ${i}`);
            slicePoints.push(i)
      
            let row = cornersArray.slice( (i-1 < 0 ? 0: i-1), i+1)
            
            rows.push(row)
         }
      }
      
      // STORE THE LAST SLICE AT THE BACKEND...
      let lastSlicePoint = (slicePoints[slicePoints.length - 1]);
      let remainder = cornersArray.slice(lastSlicePoint + 1);
      rows.push(remainder)
      
      chunksRows.push(rows)
      // console.log(slicePoints);
   })

   // console.log(chunksRows);




   // RETURN A NEW GEOJSON OBJ. CREATED FROM THE VERTICES OF EACH CHUNK
   const chunksGeojson = []

   chunksRows.forEach((rows, chunkIndex) => {
         
      const rowsRightVertices = []
      const rowsLeftVertices = []
      
      //  GET THE COORDINATES OF THE VERTICES OF EACH CHUNK'S ROW
      for (let i = 0; i < rows.length; i++) {

         let rowSides = rows[i]; 

         let rowStart = rowSides[0]
         let rowFinish = rowSides[1]

         let tl_vertex = gridCells[rowStart].geometry.coordinates[0][0]
         let tr_vertex = rowFinish === undefined ? gridCells[rowStart].geometry.coordinates[0][0] : gridCells[rowFinish].geometry.coordinates[0][1] // => the row has only one cell
         let br_vertex = rowFinish === undefined ? gridCells[rowStart].geometry.coordinates[0][3] : gridCells[rowFinish].geometry.coordinates[0][2] // => the row has only one cell
         let bl_vertex = gridCells[rowStart].geometry.coordinates[0][3]


         // let rightVertices = [ tr_vertex, br_vertex ] // include the top left vertex if @ very first row of chunk
         // let leftVertices = [ tl_vertex, bl_vertex ] // include the bottom right vertex if @ very last row of chunk
         let rightVertices = i===0 ? [ tl_vertex, tr_vertex, br_vertex ] : [ tr_vertex, br_vertex ] // include the top left vertex if @ very first row of chunk
         let leftVertices = i===rows.length-1 ? [ tl_vertex, bl_vertex, br_vertex ] : [ tl_vertex, bl_vertex ] // include the bottom right vertex if @ very last row of chunk

         rowsRightVertices.push(...rightVertices)
         rowsLeftVertices.push(...leftVertices)
      }


      // CONSTRUCT A NEW GEOJSON OBJECT FROM THE RIGHT & LEFT ROW VERTICES
      const chunkGeojson = {}

         chunkGeojson['type'] = "FeatureCollection"
         chunkGeojson['features'] = [{
            "type": "Feature",
            "geometry": {
               "type": "Polygon",
               "coordinates": [[...rowsRightVertices], [...rowsLeftVertices]]
            }
         }]
         chunkGeojson.properties = {
            "area": (turf.area(turf.featureCollection(GRID_CHUNKS[chunkIndex])) / 10000).toFixed(),
            "area": (turf.area(turf.featureCollection(GRID_CHUNKS[chunkIndex])) / 10000),
            "farmer": farmAllocations[chunkIndex],
            "rVertices": [ ...rowsRightVertices ]
         }

      chunksGeojson.push(chunkGeojson)
      
      // console.log(chunkGeojson);
      // console.log(chunkGeojson.features[0].geometry.coordinates);

   })




   // FILL LAYER COLOR PICKER
   const getFillColor = (index) => {
         
      const colors = [
         "#088", // green
         "#f9ca24", // yellow
         "#f0932b", // orange
         "#8e44ad", // wisteria purple
         "#eb4d4b", // red
         "#130f40", // indigo
         "#00a8ff", // blue
         "#535c68", // wizard grey
         "#44bd32", // skittles green
         "#a29bfe", // light indigo
         "#2d3436", // dracula
         "#f5f6fa", // white
         "#b71540", // jalepeno red
         "#78e08f" // aurora green
      ]

      return colors[index]
   }


   // CREATE & EXPORT OUTLINE LAYERS FOR EACH CHUNK   
   const CHUNKS_OUTLINES = chunksGeojson.map((chunk, index) => {

         const chunkOutline = {
            'id': `chunkOutline_${index}`,
            'type': 'line',
            'source': {
            'type': 'geojson',
            'data': chunk
            },
            'paint': {
            'line-color': `${getFillColor(index)}`,
            'line-width': 3,
            }
         }

         return chunkOutline
   })
      


   // STYLE CELLS IN EACH CHUNK WITH SAME PRE-DEFINED FILL COLORS AS ITS OUTLINE
   const FILLED_CHUNKS = GRID_CHUNKS.map((chunk,index) => {

      // console.log(turf.featureCollection(chunk));
      // console.log(turf.dissolve(turf.featureCollection(chunk)));
      // console.log(turf.cleanCoords(turf.featureCollection(chunk)));
      let data = turf.featureCollection(chunk)

        
      // STYLING FOR THE GRID CELLS IN EACH CHUNK
      const styledChunkFill = {
         'id': `chunkGrid_${index}`,
         'type': 'fill',
         'source': {
         'type': 'geojson',
         'data': data
         },
         'paint': {
            'fill-antialias': true,
            // 'fill-outline-color': `pink`,
            'fill-color': `${getFillColor(index)}`,
            // 'fill-opacity': .5,
            'fill-opacity': [
               "interpolate", ["linear"], ["get", "density"], 0, 0.1, 1, .2 // last number is overall opacity
               ]
         }
      }
      
      return styledChunkFill
   })



   // BETTER CHUNKS' OUTLINES
   const CHUNKS_POLYGONS_LAYERS = GRID_CHUNKS.map((chunk, index) => {
      const chunkPolygonOutline = {
         'id': `chunkPolygonOutline_${index}`,
         'type': 'line',
         'source': {
         'type': 'geojson',
         'data': turf.union(...chunk)
         },
         'paint': {
         'line-color': `${getFillColor(index)}`,
         'line-width': 3,
         }
      }

      return chunkPolygonOutline
   })
   
   

   // STYLE EACH CHUNK POLYGON WITH SAME PRE-DEFINED FILL COLORS AS ITS OUTLINE
   const CHUNKS_POLYGONS_FILL_LAYERS = GRID_CHUNKS.map((chunk,index) => {
      
      // STYLING FOR THE GRID CELLS IN EACH CHUNK
      const chunkPolygonFill = {
         'id': `chunkPolygonFill_${index}`,
         'type': 'fill',
         'source': {
         'type': 'geojson',
         'data': turf.union(...chunk)
         },
         'paint': {
            'fill-antialias': true,
            // 'fill-outline-color': `pink`,
            'fill-color': `${getFillColor(index)}`,
            'fill-opacity': 0.1,
            // 'fill-opacity': [
            //    "interpolate", ["linear"], ["get", "density"], 0, 0.1, 1, .2 // last number is overall opacity
            //    ]
         }
      }
      return chunkPolygonFill
   })


   // EXPORT LABEL LAYERS FOR EACH CHUNK   
   const CHUNKS_LABELS = chunksGeojson.map((chunk, index) => {

      // Find the center point of the chunk of grid cells
      // Define the a POINT representing the labels for your CHUNK CENTER
      // USE a Symbol layer TO ADD THE LABELS
      // One way to generate the label points is https://github.com/mapbox/polylabel

      var chunkCenterPoint = turf.centerOfMass(chunk);
      // chunkCenterPoint.properties.label_title = `Farmer #${index} ${chunk.properties.farmer} ha.`;

      const chunkLabel = {
         'id': `chunkLabel_${index}`,
         "type": "symbol",
         'source': {
            'type': 'geojson',    
            data: chunkCenterPoint
         },
         "layout": {
            // "symbol-placement": "line",
            "text-font": ["Open Sans Regular"],
            // "text-field": '{label_title}',
            "text-field": `Farmer #${index+1} ${chunk.properties.farmer} ha.`, // FIXME > proper farmer naming 
            "text-size": 10
         },
         "paint": {
            "text-color": "#130f40"
         }
      }
      return chunkLabel
   })


   return {
      GRID_CHUNKS,
      chunksGeojson,
      TOTAL_HECTARES,
      CHUNKS_OUTLINES, 
      FILLED_CHUNKS, 
      CHUNKS_POLYGONS_LAYERS, 
      CHUNKS_POLYGONS_FILL_LAYERS,
      CHUNKS_LABELS,
   }
}
