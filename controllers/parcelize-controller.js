const chalk = require('../utils/chalk-messages.js');
const PARCELIZED_AGC_MODEL = require('../models/parcelized-agc-model.js')
const { PARCELIZE_SHAPEFILE } = require('../database/agcs/parcelize/chunkify-moving-frames.js')



// PARCELIZATION LOGIC FN.
async function parcelize(agc) {
   
   try {
      
      // INIT. PARCELIZATION VARIABLES
      const selectedShapefile = agc

      // GET THE FARM HA. ALLOCATIONS
      const farmerAllocations = [];
      const farmers_data = agc.properties.farmers;
      // console.log(chalk.highlight(farmers_data))
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
      const dirOptionsArray = [
         { katanaSliceDirection: "south", chunkifyDirection: "east" },
         { katanaSliceDirection: "south", chunkifyDirection: "west" },
         { katanaSliceDirection: "north", chunkifyDirection: "east" },
         { katanaSliceDirection: "north", chunkifyDirection: "west" },
         { katanaSliceDirection: "east", chunkifyDirection: "south" },
         { katanaSliceDirection: "east", chunkifyDirection: "north" },
         { katanaSliceDirection: "west", chunkifyDirection: "south" },
         { katanaSliceDirection: "west", chunkifyDirection: "north" },
      ]
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
      // const dirComboConfigObj = dirOptionsMap.ne;
      const dirComboConfigObj = dirOptionsMap.es;

      // PARCELIZE
      // const parcelizedShapefile = await PARCELIZE_SHAPEFILE(selectedShapefile, farmerAllocations, dirComboConfigObj)
      const parcelizedShapefile = PARCELIZE_SHAPEFILE(selectedShapefile, farmers_data, dirComboConfigObj)

      return parcelizedShapefile;

   } catch (err) {
      console.log(chalk.fail(err.message));
   }
}



// PARCELIZE THE NEW AGC AND INSERT INTO DB.
exports.parcelizeAgc = async (req, res) => {

   try {

      // PARCELIZE THE NEW AGC
      console.log(chalk.highlight(JSON.stringify(req.body)));
      const parcelizedAgc = await parcelize(req.body)

      // INSERT PARCELIZED AGC INTO DB.
      const insertedAgc = await PARCELIZED_AGC_MODEL.create(parcelizedAgc) // "model.create" returns a promise

      // SERVER RESPONSE
      res.status(201).json({
         status: 'success',
         inserted_at: req.requestTime,
         data: insertedAgc
      })

   } catch (err) {
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: 'That POST request failed. Check your JSON data payload.',
         error_msg: err.message,
      });
   }
}