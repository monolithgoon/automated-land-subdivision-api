export function POLYGON_SUBDIVIDE(polygon, mask) {
   
   // const bufferedPolygon = turf.transformScale(polygon, 2, {units: 'kilometers'})
   const bufferedPolygon = turf.buffer(polygon, 0.2, {units: 'kilometers'})
   const bufferedPolygonMask = bufferedPolygon.features[0].geometry
   const bufferedGridOptions = { units: 'kilometers', mask: bufferedPolygonMask}
   
   const katanaPolygonSide = 0.447 // ~20 ha. per cell
   // const katanaPolygonSide = 0.31 // 10.0 ha. per cell
   // const katanaPolygonSide = 0.2234 // 5.0 ha. per cell
   // const katanaPolygonSide = 0.2 // 4.0 ha. per cell
   // const katanaPolygonSide = 0.14128 // 2.0 ha. per cell

   let KATANA_GRID = turf.squareGrid(turf.bbox(bufferedPolygon), katanaPolygonSide, bufferedGridOptions)

   let katanaPolygons = []

   // TRIM GRID WHERE IT INTERSECTS THE ORIGINAL POLYGON
   KATANA_GRID.features.forEach(katanaPolygon => {

      let intersection = turf.intersect(mask, katanaPolygon.geometry);

      if (intersection) {
         katanaPolygon.geometry = intersection.geometry; // HACK
         katanaPolygons.push(katanaPolygon)

      } else {
         // delete the grid's geometry where there's no intersection
         // katanaPolygon.geometry = {type: "Polygon", coordinates: []}
      }
   });


   return KATANA_GRID = turf.featureCollection(katanaPolygons)
}