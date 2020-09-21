// IMPORT THE AGCS

// CHECK THE ONES THAT NEED TO BE PARCELIZED
const selectedShapefile = {};
const farmAllocations = [];
const dirComboConfigObj = {};

// PARCELIZE
const { PARCELIZE } = require('./chunkify-moving-frames.js')

// RENDER LAYERS FROM THE MOVING FRAMES MODULE
PARCELIZE(selectedShapefile, farmAllocations, dirComboConfigObj)

// SAVE TO DB