const { PARCELIZE } = require('./chunkify-moving-frames.js')



// IMPORT THE AGCS



// CHECK THE ONES THAT NEED TO BE PARCELIZED
const selectedShapefile = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"extended_name":"uniqueId","location":"Rigachikum, Kaduna", "name":"Rigachickun AGC","agcname":"Rigachickun AGC","code":"NIRSALAGCAD0001","farmers":[{"code":"NIRSALAGCAD0001-001","firstname":"Mohammed","lastname":"Sadiq","coordinates":"","hectare":2.3},{"code":"NIRSALAGCAD0001-002","firstname":"Emmanuel","lastname":"James","coordinates":"","hectare":2.7}]},"geometry":{"type":"Polygon","coordinates":[[[7.475653141736985,10.627761368604803],[7.478830888867378,10.629113406009933],[7.480225302278996,10.628697217702442],[7.481489293277264,10.62825697355466],[7.481489293277264,10.626841004353153],[7.481274716556071,10.625009164779053],[7.481152340769768,10.623202028950532],[7.481164410710335,10.621990675170915],[7.4790434539318085,10.6220631719958],[7.477033138275147,10.621500003026645],[7.47676357626915,10.624850332335757],[7.475653141736985,10.627761368604803]]]}}]};
const farmAllocations = [ 2, 2.3, 2, 1, 3, 3, 2.1, 3, 3.1 ];
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
const dirComboConfigObj = dirOptionsMap.se;



// PARCELIZE
PARCELIZE(selectedShapefile, farmAllocations, dirComboConfigObj)



// SAVE TO DB