const catchAsyncServer = require("../utils/catch-async-server.js");

// exports.insertFarmerBiodata = catchAsyncServer(async (req, res, next) => {}, `getFarmerBiodata`);
exports.getFarmerBiodata = catchAsyncServer(async (req, res, next) => {}, `getFarmerBiodata`);
