"use-strict";



const tj = require("@mapbox/togeojson");
const fs = require("fs");
const path = require("path");
const turf = require('@turf/turf');
const JSZip = require('jszip');
const shapefile = require("shapefile");
// node doesn't have xml parsing or a dom. > so, use xmldom
const DOMParser = require("xmldom").DOMParser;
const chalk = require('../utils/chalk-messages.js');



// CONVERT .kml & .gpx TO GeoJSON WITH MAPBOX togeojson
const toGeojsonConverter = function (geofileData, extension) {
	try {
		let converted, convertedWithStyles;
		switch (extension) {
			case `kml`:
				converted = tj.kml(geofileData);
				convertedWithStyles = tj.kml(geofileData, { styles: true });
				break
			case `gpx`:
				converted = tj.gpx(geofileData);
				convertedWithStyles = tj.gpx(geofileData, { styles: true });
				break
		}
		return convertedWithStyles;

	} catch (_err) {
		console.log(chalk.highlight(`KML conversion failed. ${_err.message}`))
		throw new Error(`KML conversion failed. ${_err.message}`)
	}
}



// POLYGONIZE .kml / .gpx DATA
const constructPolygon = function(geojson) {

	// CONSTRUCT POLYGONS FROM POINTS & LINESTRINGS
		// 0. ANALYZE THE FEATURES IN THE CONVERTED GEOJSON
		// 1. CHECK FOR POINTS & LINESTRINGS
		// 2. CONNECT THE POINTS &/OR LINESTRINGS
		
	const pointFeaturesCoords = [];
	const linestringFeatures = [];
	const geofilePolygonFeatures = [];
	const linestringFeaturesCoords = [];
	let constructedPointsLinestring, constructedPolygon;
	let extractedLinestring;
	
	// 0. ANALYZE THE FEATURES IN THE CONVERTED GEOJSON	
	for (const feature of geojson.features) {
		
		// console.log(chalk.fail(`geojson[feature]: ${turf.getType(feature)} `))
		
		switch (turf.getType(feature)) {
			case `Point`:
				pointFeaturesCoords.push(feature.geometry.coordinates);
				break
			case `LineString`:
				linestringFeatures.push(feature);
				linestringFeaturesCoords.push(feature.geometry.coordinates);
			case `Polygon`:
				constructedPolygon = feature // REMOVE <
				geofilePolygonFeatures.push(feature)
			}
		};
		
		
	// 1. CHECK FOR POINTS & LINESTRINGS
	// 2. CONNECT THE POINTS &/OR LINESTRINGS
	if (pointFeaturesCoords.length !== 0) {
		constructedPointsLinestring = turf.lineString(pointFeaturesCoords);
		// extractedLinestring = constructedPointsLinestring

		console.log(chalk.highlight(turf.area(turf.lineToPolygon(constructedPointsLinestring)).toFixed(5)))
	}


	// SOMETIMES A LINESTRING OF THE POINTS IS ALREADY CONTAINED IN THE KML ..
	// USE IT TO MAKE THE POLYGON INSTEAD..
	if (linestringFeatures.length === 1) {
		extractedLinestring = linestringFeatures[0];

		console.log(chalk.highlight(turf.area(turf.lineToPolygon(extractedLinestring)).toFixed(5)))

		if (constructedPointsLinestring) {
			console.log(chalk.highlight(turf.booleanOverlap(constructedPointsLinestring, extractedLinestring)))

			// IF ABOVE IS FALSE, ATTEMPT TO UNTE THEM AN CONSTRUCT A POLYGON
		}

		// CONSTRUCT POLYGONS FROM THE LINESTRING
		constructedPolygon = turf.lineToPolygon(extractedLinestring);

	} else if (linestringFeatures.length > 1) {

		// FIXME > SHOULD THIS NOT BE turf.multilineString ??? 
		extractedLinestring = turf.lineString(...linestringFeaturesCoords);

		// CONSTRUCT POLYGONS FROM THE LINESTRINGS
		constructedPolygon = turf.lineToPolygon(extractedLinestring);
	}


	// GEOFILE CONTAINS POLYGO(S)
	if (geofilePolygonFeatures.length > 1) {
		throw new Error(`Your geofile seems to contain multiple un-connected polygons. This cannot be parcelized.`)
	} else if (geofilePolygonFeatures === 1) {
		constructedPolygon = geofilePolygonFeatures[0];
	}

	return constructedPolygon;
}



// CONVERT .shp TO GeoJSON
const shapefileConverter = function({baseFileName, completeGeofilePath}) {
	const geojsonFeatures = [];
	shapefile.open(`${__approotdir}${completeGeofilePath}`)
		.then(source => source.read()
		.then(function log(result) {
			if (result.done) return;
			geojsonFeatures.push(result.value);
			return source.read().then(log);
		}))
		.then( () => {
			// console.log(chalk.interaction(JSON.stringify(turf.featureCollection(geojsonFeatures))))
			saveGeojson(baseFileName, turf.featureCollection(geojsonFeatures));
		})
		.catch(error => console.error(error.stack));
}



// SAVE GEOJSON DATA TO FILE
function saveGeojson(baseFileName, filePath, geojsonPolygon) {

	// SAVE CONSTRUCTED GEOJSON POLYGON TO FILE
	if (geojsonPolygon && turf.getType(geojsonPolygon) === "Polygon") {

		const geofileArea = (turf.area(geojsonPolygon)/10000).toFixed(5);	

		console.log(chalk.highlight(`geofileArea: ${geofileArea} ha.`));
		console.log(chalk.fail(`we are at saveGeojson fn. niggers`));

		fs.writeFile(`${__approotdir}${filePath}${baseFileName}.geojson`, JSON.stringify(geojsonPolygon), (_err) => {
			if (_err) throw new Error(_err);
		});
		
	} else {
		throw new Error(`Your geofile could not be converted into a closed GeoJSON polygon.`)
	};
}




// CONVERT THE GEO FILE TO GeoJSON && SAVE TO DISK
exports._geofileConverter = async function({completeFileName, geofileUploadPath, convertedGeofilePath}) {

	// HOLD THE GeoJSON THAT'S BEEN CONVERTED FROM KML, GPX, etc
	let convertedGeojson;

	const completeGeofilePath = `${geofileUploadPath}/${completeFileName}`

	const [baseFileName, fileExtension] = completeFileName.split(/\.(?=[^\.]+$)/);
	// console.log(chalk.warning(baseFileName, fileExtension));
	// const fileExtension = path.extname(completeFileName);

	// switch (fileExtension) {
	switch (true) {
		
		case (fileExtension === `kml` || fileExtension === `gpx`):
			
			// READ FROM DISK & PARSE THE KML FILE
			let fileContent;
			try {
				fileContent = new DOMParser().parseFromString(fs.readFileSync(`${__approotdir}${geofileUploadPath}${completeFileName}`, "utf8"));
			} catch (_err) {
				console.error(_err.message)
			}

			// CONVERT THE KML TO GEOJSON
			try {
				convertedGeojson = toGeojsonConverter(fileContent, fileExtension)
			} catch (_err) {
				console.error(_err.message)
			}

			// ATTEMPT TO MAKE A POLYGON FROM THE GEOJSON FEATS.
			const constructedPolygon = constructPolygon(convertedGeojson);

			// WRITE GEOJSON POLYGON TO FILE
			// saveGeojson(baseFileName, convertedGeojson);
			// saveGeojson(baseFileName, extractedLinestring);
			saveGeojson(baseFileName, convertedGeofilePath, constructedPolygon);

			break;

		case (fileExtension === 'kmz'):
			
			// kmzConverter(`${completeGeofilePath}${baseFileName}`)

			// CHANGE THE KMZ FILE EXTENSION TO .zip
			try {
				fs.renameSync(`${__approotdir}${geofileUploadPath}${completeFileName}`, `${__approotdir}${geofileUploadPath}${baseFileName}.zip`);
			} catch (_err) {
				throw new Error(`${_err.message}`)	
			}

			// UNZIP THE FILE
			// TODO > 
			try {
				
				// GET THE FILE
				fs.readFile(`${__approotdir}${geofileUploadPath}${baseFileName}.zip`, function(_err, data) {
					if (_err) throw _err;
					
					// UNPACK THE ZIP FILE
					const jszip = new JSZip();
					jszip.loadAsync(data).then(function (folderContents) {
						// ...
						// console.log(folderContents);
						// console.log(folderContents.files);
	
						// READ THE CONTENTS OF EACH FILE IN THE ZIP FOLDER
						Object.keys(folderContents.files).forEach((zippedFileName, idx) => {

							console.log(chalk.warning(`Zip File(s) #${idx+1}: ${zippedFileName}`))
							
							// GET CONTENTS OF THAT FILE
							jszip.file(zippedFileName).async('text')
								.then(fileContent => {

									// CONVERT THE KML TO GEOJSON WITH MAPBOX "toGeojson"
									const [zipDocName, zipDocExt] = zippedFileName.split(/\.(?=[^\.]+$)/);
									convertedGeojson = toGeojsonConverter(new DOMParser().parseFromString(fileContent), zipDocExt)

									// TRY TO CONSTRUCT A USABLE POLYGON
									const constructedPolygon = constructPolygon(convertedGeojson);

									// SAVE TO FILE
									saveGeojson(baseFileName, convertedGeofilePath, constructedPolygon);
								})
						})
					})
				});

			} catch (_err) {
				throw new Error(_err.message)
			};

			// IF UNZIP SUCCESSFUL, UPDATE THE completeFileName VARIABLE
			// TODO > 
			// completeFileName = `${baseFileName}.kml`

			// POINT TO THE NEW FILE
			// TODO > 

			// // READ FROM DISK & PARSE THE KML FILE
			// let fileContent;
			// try {
			// 	fileContent = new DOMParser().parseFromString(fs.readFileSync(`${__approotdir}${geofileUploadPath}${completeFileName}`, "utf8"));
			// } catch (_err) {
			// 	console.error(_err.message)
			// };

			// // CONVERT THE KML TO GEOJSON
			// try {
			// 	convertedGeojson = toGeojsonConverter(fileContent, fileExtension)
			// } catch (_err) {
			// 	console.error(_err.message)
			// }
			
			break
				
		case (fileExtension === 'shp'):

			shapefileConverter({baseFileName, completeGeofilePath});

			break
		
		default: throw new Error(`Geofile conversion error. The file extension of the uploaded geofile seems to have changed on the server. This isn't supposed to happen.`)
	}
}