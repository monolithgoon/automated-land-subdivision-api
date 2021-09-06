const chalk = require("../../../utils/chalk-messages");
const { PARCELIZE_SHAPEFILE } = require("./chunkify-moving-frames.js");


exports.PARCELIZE_AGC = function subdividePolygon (agc, directionsCode) {
   
   try {
      
      console.log(chalk.working(`PARCELIZING ${agc.properties.agc_id} ... `));
      
      // INIT. PARCELIZATION VARIABLES
      const selectedShapefile = agc

      // GET THE FARM HA. ALLOCATIONS
      const farmerAllocations = [];
      const plotOwnersData = agc.properties.plot_owners;
      agc.properties.farmers.forEach(farmer=>farmerAllocations.push(farmer.allocation));
   
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

      // const dirOptionsArray = [
      //    { katanaSliceDirection: "south", chunkifyDirection: "east" },
      //    { katanaSliceDirection: "south", chunkifyDirection: "west" },
      //    { katanaSliceDirection: "north", chunkifyDirection: "east" },
      //    { katanaSliceDirection: "north", chunkifyDirection: "west" },
      //    { katanaSliceDirection: "east", chunkifyDirection: "south" },
      //    { katanaSliceDirection: "east", chunkifyDirection: "north" },
      //    { katanaSliceDirection: "west", chunkifyDirection: "south" },
      //    { katanaSliceDirection: "west", chunkifyDirection: "north" },
      // ]

      // for (let idx = 0; idx < dirOptionsArray.length; idx++) {
      //    const directionsObj = dirOptionsArray[idx];
      //    const parcelizedAgcGeojson = await PARCELIZE_SHAPEFILE(selectedShapefile, farmerAllocations, agcID, agcLocation, directionsObj)
      //    if (parcelizedAgcGeojson) {
      //       await saveToFile(parcelizedAgcGeojson, agcID, idx);
      //    }
      // }

      // GET CHUNKIFY DIRECTIONS
      // const dirComboConfigObj = dirOptionsMap.wn;
      // const dirComboConfigObj = dirOptionsMap.ws;
      // const dirComboConfigObj = dirOptionsMap.en;
      // const dirComboConfigObj = dirOptionsMap.es;
      // const dirComboConfigObj = dirOptionsMap.ne;
      // const dirComboConfigObj = dirOptionsMap.nw;
      // const dirComboConfigObj = dirOptionsMap.sw;
      // const dirComboConfigObj = dirOptionsMap.se;
      const dirComboConfigObj = dirOptionsMap[directionsCode];

      // PARCELIZE
      // const parcelizedShapefile = await PARCELIZE_SHAPEFILE(selectedShapefile, farmerAllocations, dirComboConfigObj)
      const parcelizedShapefile = PARCELIZE_SHAPEFILE(selectedShapefile, plotOwnersData, dirComboConfigObj)

      return parcelizedShapefile;

   } catch (err) {
      console.log(chalk.fail(err.message));
   }
};