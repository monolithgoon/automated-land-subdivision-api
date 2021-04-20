"use-strict";



const tj = require("@mapbox/togeojson");
const fs = require("fs");
const path = require("path");
const turf = require('@turf/turf');
const JSZip = require('jszip');
const shapefile = require("shapefile");
// node doesn't have xml parsing or a dom. > so, use xmldom
const DOMParser = require("xmldom").DOMParser;
const chalk = require('./chalk-messages.js');
const { Z_ERRNO } = require("zlib");



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
		console.log(chalk.highlight(`KML convESRIon failed. ${_err.message}`))
		throw new Error(`KML convESRIon failed. ${_err.message}`)
	}
}



// CONVERT .shp TO GeoJSON
const shapefileConverter = function(completeGeofilePath) {

	return new Promise((resolve, reject) => {

		const geojsonFeatures = [];

		shapefile.open(`${__approotdir}${completeGeofilePath}`)
			.then(source => source.read()
			.then(function log(result) {
				if (result.done) return;
				geojsonFeatures.push(result.value);
				return source.read().then(log);
			}))
			.then( () => {
	
				const constructedPolygon = constructPolygon(turf.featureCollection(geojsonFeatures));
				// const constructedPolygon = turf.featureCollection(geojsonFeatures);
				
				// console.log(constructedPolygon);
				resolve(constructedPolygon);
				// return constructedPolygon;
			})
			// .then((geofilePolygon)=>{
			// 	console.log(JSON.stringify(geofilePolygon))
			// 	saveGeojson(baseFileName, convertedGeofilePath, geofilePolygon);
			// })
			.catch(_error => {
				// .catch(error => console.error(error.stack))
				// .catch(error => console.error(chalk.fail(error.message)));
				reject(Error(_error)); // IMPORTANT < REJECT THE PROMISE IN THE CATCH BLOCK IN ORDER TO PASS THE ERR. IN PROMISE TO THE FN. THAT CALLED shapefileConverter 
			});
	});
}



// POLYGONIZE .kml / .gpx DATA
const constructPolygon = function(geojson) {

		// CONSTRUCT POLYGONS FROM POINTS & LINESTRINGS
			// 0. ANALYZE THE FEATURES IN THE CONVERTED GEOJSON
			// 1. CHECK FOR POINTS & LINESTRINGS
			// 2. CONNECT THE POINTS &/OR LINESTRINGS
			
		const pointFeaturesCoords = [];
		const linestringFeatures = [];
		const linestringFeaturesCoords = [];
		const geofilePolygonFeatures = [];
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
					break
					case `Polygon`:
					geofilePolygonFeatures.push(feature);
					break;
				}
			};
			
			
		// 1. CHECK FOR POINTS & LINESTRINGS
		// 2. CONNECT THE POINTS &/OR LINESTRINGS
		if (pointFeaturesCoords.length !== 0) {

			constructedPointsLinestring = turf.lineString(pointFeaturesCoords);
			extractedLinestring = constructedPointsLinestring;

			// console.log(chalk.highlight(`Point Feats. Polygon Area: ${turf.area(turf.lineToPolygon(constructedPointsLinestring)).toFixed(5)}`));
		}


		// SOMETIMES A LINESTRING OF THE POINTS IS ALREADY CONTAINED IN THE KML ..
		// USE IT TO MAKE THE POLYGON INSTEAD..
		if (linestringFeatures.length === 1) {
			
			extractedLinestring = linestringFeatures[0];

			// CHECK IF IDENTICAL WITH THE LINES FROM THE POINT FEATS.
			if (constructedPointsLinestring) {
				
				const pointLineOverlapCheck = turf.booleanOverlap(constructedPointsLinestring, extractedLinestring);
				
				console.log(chalk.highlight(`overlapCheck: ${pointLineOverlapCheck} `))
				
				if (!pointLineOverlapCheck) {
					
					// TODO > 
					// extractedLinestring = linestringFeatures[0]; // FIXME < 
					// IF ABOVE IS FALSE, ATTEMPT TO UNTE THEM AN CONSTRUCT A POLYGON
					throw new Error(`Your geofile contains an un-usable mix of point & line features, which cannot be combined into a closed polygon.`)

				} else {
					extractedLinestring = constructedPointsLinestring;
				}

			}

			// CONSTRUCT POLYGONS FROM THE LINESTRING
			constructedPolygon = turf.lineToPolygon(extractedLinestring);

		} else if (linestringFeatures.length > 1) {
			
			// console.log(JSON.stringify(linestringFeaturesCoords));

			throw new Error(`Your geofile contains a MultiLineString. It is not possible to construct a polygon from this structure. Open & inspect your geofile in Google Earth or ESRI.`)

			// REMOVE > UN-NEEDED > 
			extractedLinestring = turf.multiLineString(...[linestringFeaturesCoords]);
			
			// CONSTRUCT POLYGONS FROM THE LINESTRINGS
			constructedPolygon = turf.lineToPolygon(extractedLinestring);
		}


		// CHECK IF GEOFILE CONTAINS POLYGON(S)
		if (geofilePolygonFeatures.length > 1) {
			try {
				console.log(chalk.working(`Attempting to unite ${geofilePolygonFeatures.length} polygons in the geofile .. `))
				constructedPolygon = turf.union(...geofilePolygonFeatures);
			} catch (_err) {
				throw new Error(`An error occured in trying to unite the polygons in your geofile.`)
			}
		} else if (geofilePolygonFeatures.length === 1) {
			constructedPolygon = geofilePolygonFeatures[0];
		}


	// CHECK IF A POLYGON WAS SUCCESSFULLY CONSTRUCTED
	if (constructedPolygon) {
		if (turf.getType(constructedPolygon) === "Polygon")
			return constructedPolygon;
		else if (turf.getType(constructedPolygon) === "MultiPolygon") {
			// SOMETIMES THE turf.lineToPolygon FN. CREATS A MULTIPOLY. WITH ONLY ONE COORDINATES ARRAY => ie., A "POLYGON"
			if (constructedPolygon.geometry.coordinates.length === 1) {
				return constructedPolygon;
			} else if (constructedPolygon.geometry.coordinates.length > 1) {
				throw new Error(`Your geofile seems to contain multiple, non-adjacent polygons. These MultiPolygon features cannot be parcelized.`)
			}
		} else {
			throw new Error(
				`Your geofile contains Point, LineString, MultiLineString and/or other features that cannot be converted/assembled into a (closed) GeoJSON polygon. Open & inspect your geofile in Google Earth or ESRI, and check that the features in it are polygonizable.`
			);
		}
	} else {
		// REMOVE > UN-NEEDED >
		// throw new Error (`The LineString & Point features in your geofile could not be converted/assembled into a (closed) GeoJSON polygon. Open & inspect your geofile in Google Earth or ESRI, and check that the features in it are valid.`)
	}
}



// SAVE GEOJSON DATA TO FILE
// SAVE CONSTRUCTED GEOJSON POLYGON TO FILE
function saveGeojson(baseFileName, saveFilePath, geojsonPolygon) {

	try {
		
		const geofileArea = (turf.area(geojsonPolygon)/10000).toFixed(5);	
	
		console.log(chalk.highlight(`geofileArea: ${geofileArea} ha.`));
	
		fs.writeFile(`${__approotdir}${saveFilePath}${baseFileName}.geojson`, JSON.stringify(geojsonPolygon), (_err) => {
			if (_err) throw new Error(_err);
		});

	} catch (_err) {
		throw new Error(`The GeoJSON polygon constructed from the geofile could not be saved to file for some reason. You might have run out of storage space, or the converted GeoJSON is not valid. ${_err.message}`)
	}		
}



// CONVERT THE GEO FILE TO GeoJSON && SAVE TO DISK
exports._geofileConverter = async function({completeFileName, geofileUploadPath, convertedGeofilePath}) {
// exports._geofileConverter = function({completeFileName, geofileUploadPath, convertedGeofilePath}) {

	// HOLD THE GeoJSON THAT'S BEEN CONVERTED FROM KML, GPX, etc
	let convertedGeojson;

	const completeGeofilePath = `${geofileUploadPath}${completeFileName}`

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
				
				convertedGeojson = toGeojsonConverter(fileContent, fileExtension);

				// SAVE THE CONVERTED GEOJSON ... {OPTIONAL}
				fs.writeFile(`${__approotdir}${geofileUploadPath}${completeFileName}`, JSON.stringify(convertedGeojson), (_err) => {
					if (_err) throw new Error(_err);
				});
		
			} catch (_err) {
				console.error(_err.message)
			}

			// ATTEMPT TO MAKE A POLYGON FROM THE GEOJSON FEATS.
			const constructedPolygon = constructPolygon(convertedGeojson);

			// WRITE GEOJSON POLYGON TO FILE
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
			
			break
				
		case (fileExtension === 'shp'):

			// GET THE CONVERTED POLYGON FROM THE .shp CONVERTER > MTD. 1
			try {

				const geofilePolygon = await shapefileConverter(completeGeofilePath)

				// ATTEMPT TO WRITE THE GEOJSON POLYGON TO FILE
				if (geofilePolygon) {
					saveGeojson(baseFileName, convertedGeofilePath, geofilePolygon);
				} else {
					throw new Error(`The data in your Shapefile does not seem to be valid.`)
				}
				
			} catch (_err) {
				throw _err
			}
			// GET THE CONVERTED POLYGON FROM THE .shp CONVERTER > MTD. 2
			// shapefileConverter({baseFileName, completeGeofilePath, convertedGeofilePath})
			// 	.then(geofilePolygon => {
			// 		console.log(geofilePolygon);
			// 		saveGeojson(baseFileName, convertedGeofilePath, geofilePolygon);
			// 	})
			// 	.catch(_err => { // FIXME < THIS MTD. FAILS TO PASS THE ERROR TO THE convertGeofile FN. IN geofile-controller.js 
			// 		console.log(chalk.fail(_err.message))
			// 		throw new Error(`FUCK OGO OWO`)
			// 	})

			break
		
		default: throw new Error(`Geofile convESRIon error. The file extension of the uploaded geofile seems to have changed on the server. This isn't supposed to happen.`)
	}
}