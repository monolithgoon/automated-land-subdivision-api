const turf = require('@turf/turf');
const chalk = require('../utils/chalk-messages.js');
const { PARCELIZE_SHAPEFILE } = require('../data/agcs/parcelize/chunkify-moving-frames.js');
const { _getNextPayload } = require('../utils/utils.js');



// AUTO-SUBDIVIDE / AUTO-PARCELIZATION LOGIC FN.
// async function parcelize(agc, dirCombo) { // FIXME > THIS SHOULDN'T BE AN ASYNC FN.
function parcelize(agc, dirCombo) {
   
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
      // const dirComboConfigObj = dirOptionsMap.sw;
      const dirComboConfigObj = dirOptionsMap[dirCombo];

      // PARCELIZE
      const parcelizedShapefile = PARCELIZE_SHAPEFILE(selectedShapefile, farmers_data, dirComboConfigObj)

      return parcelizedShapefile;

   } catch (err) {
      console.log(chalk.fail(err.message));
   }
}



// PARCELIZE THE NEW AGC AND INSERT INTO DB.
exports.parcelizeAgc = async (req, res, next) => {

	console.log(chalk.success(`CALLED THE [ parcelizeAgc ] CONTROLLER FN. `))

   try {

      // SELECT PAYLOAD > 
      // EITHER FROM PARAM FROM PREV. M.WARE. (res.locals.appendedGeojson) VS. API CALL PARAM (req.body)
      const agcPayload = _getNextPayload(res.locals.appendedGeojson, req.body);

      console.log(agcPayload);
      
      // PARCELIZE THE NEW AGC
      // const parcelizedAgc = await parcelize(res.locals.appendedGeojson); // IMPORTANT < DON'T USE await HERE < 
      let parcelizedAgc; // TODO > CHANGE TO parcelizedGeoCluster 
      const directionsArray = [ 'nw', 'ne', 'sw', 'se', 'es', 'en', 'ws', 'wn' ];
      for (const dirCombo of directionsArray) {
         console.log(chalk.warning(`trying: ${dirCombo} `))
         parcelizedAgc = parcelize(agcPayload, dirCombo); 
         if (parcelizedAgc) {
            if (!parcelizedAgc.properties.parcelization_metadata.is_inaccurate) {
               break;
            }
         }
      }
      // const parcelizedAgc = parcelize(agcPayload);

      // PASS PARCELIZED AGC TO insertParcelizedAgc M.WARE.
      // if (await parcelizedAgc) {

      //    res.locals.parcelizedAgc = await parcelizedAgc;

      //    next();
      if (parcelizedAgc) {

         res.locals.parcelizedAgc = parcelizedAgc;

         next();
         
         // REMOVE > DEPRECATED > NOW PASSING parcelizedAgc TO NEXT M.WARE 
         // const insertedAgc = await PARCELIZED_AGC_MODEL.create(parcelizedAgc) // "model.create" returns a promise

         // if (insertedAgc) {
         //    // SERVER RESPONSE
         //    res.status(201).json({
         //       status: 'success',
         //       // status: 'This file [ ${req.file.originalname} ] was successfully uploaded, converted to GeoJSON, parcelized & saved to the database.',
         //       inserted_at: req.requestTime,
         //       data: insertedAgc
         //    })
         // }

      } else {
         
         throw new Error(`THIS PARCELIZATION ATTEMPT OF [ ${req.file.originalname} ] WAS NOT SUCCESSFUL. RECALIBRATING ALGO. & RE-TRYING WITH DIFF. PARAM. SET.`)
      }

   } catch (_err) {
      res.status(400).json({ // 400 => bad request
         status: 'fail',
         message: `[ ${req.file.originalname} ] was successfully uploaded to the server, converted to a GeoJSON polygon, and updated with the farmer allocations JSON.`,
         error_msg: _err.message,
      });
   }
}