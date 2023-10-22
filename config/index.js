`use strict`
const path = require("path");
const dotenv = require(`dotenv`);
dotenv.config({ path: path.resolve(__dirname, "../default.env") });

module.exports = Object.freeze({
	port: parseInt(process.env.AUTO_LAND_SUBDIVISION_PORT, 10) || 9443,
	cloudinaryUrl: process.env.CLOUDINARY_URL,
	turfPolygonBufferUnits: process.env.TURF_POLYGON_BUFFER_UNITS,
  minimumBufferArea: process.env.TURF_POLYGON_MINIMUM_BUFFER_AREA,
});
