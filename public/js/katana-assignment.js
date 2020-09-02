export function ASSIGN_KATANAS (polygons, farmAllocations) {
// export function ASSIGN_BEST_FIT (polygons, farmAllocations) {

   const perfectMatches = [];
   let unallocatedFarms = [];
   let unallocatedKatanas = [];

   let idx = 0
   // for (idx; idx < polygons.length; idx++) {
   for (let i = 0; i < polygons.length; i++) {

      const polygon = polygons[i]

      let katanaArea = polygon.properties.area_rough * 1;
      console.log(`katana area: ${katanaArea}`);
      console.log(`idx: ${i}, length: ${polygons.length}`);
      console.log(polygons.map(polygon=>polygon.properties.plot_name));

      // CHECK FOR PERFECT FITS
      for (let j = 0; j < farmAllocations.length; j++) {

         const allocation = farmAllocations[j] * 1;

         const offset = katanaArea - allocation
         console.log(offset);

         if (offset === 0) {

            perfectMatches.push([allocation, polygon]);
            
            // remove that perfectly matching allocation from the allocations array
            farmAllocations = farmAllocations.filter((element, index) => index !== j)
            
            // remove that perfectly matching katana from polygons array
            polygons = polygons.filter( (element, index) => element.properties !== polygon.properties )

            // IF AT LAST KATANA POLYON..
            // GET ARRAY OF FARMS THAT HAVEN'T YET MATCHED WITH KATANAS
            unallocatedFarms.push(farmAllocations)
            unallocatedKatanas.push(polygons)
            
            // IMPORTANT
            // reset the main katana array index after popping off a katana!
            i = -1;    

            // IMPORTANT > 
            // END THE FARM ALLOCATIONS LOOP AFTER A MATCHING THE KATANA WITH THE ALLOCATION
            // QUIT LOOKING THRU THE ALLOCATIONS ARRAY AFTER MATCHING THE KATANA WITH THE FARM ALLOCATION
            break

         } else if (offset > 0) {
            // KATANA TOO LARGE??
            // TRY TO FIT IN MORE ALLOCATIONS
            console.log(`this katana is too big: ${polygon.properties.area_rough}`);
            console.log(unallocatedFarms); // iterate thru farms till katana full
            break

         } else if (offset < 0) {
            // KATANA TOO SMALL??
            // CHILL AND WAIT TILL THE END OF THE KATANAS LOOP THEN FIGURE OUT WHAT TO DO
         }
         console.log(farmAllocations);
      }

      // console.log(perfectMatches);
      console.log("[ ******************* ]");
   }

   unallocatedFarms = unallocatedFarms[unallocatedFarms.length-1]; // select final array
   unallocatedKatanas = unallocatedKatanas[unallocatedKatanas.length-1]; // select final array
   console.log(unallocatedFarms);
   console.log(unallocatedKatanas);
   
   return perfectMatches;
}

