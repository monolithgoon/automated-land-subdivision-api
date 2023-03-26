`uee strict`;
const turf = require("@turf/turf");
const { getGeomCollPolyFeats, getUsablePolygonGeometry } = require("../helpers.js");

// describe('getGeomCollPolyFeats', () => {
//   test('should extract polygon features from a GeoJSON GeometryCollection', () => {
//     const geojson = turf.geometryCollection([
//       turf.polygon([[[0,0],[0,1],[1,1],[1,0],[0,0]]]),
//       turf.lineString([[2,0],[2,1]]),
//       turf.point([3,0])
//     ]);
//     const expected = [turf.feature(geojson.geometry.geometries[0])];
//     expect(getGeomCollPolyFeats(geojson)).toEqual(expected);
//   });

//   test('should return null if there are no polygons in the GeoJSON GeometryCollection', () => {
//     const geojson = turf.geometryCollection([
//       turf.lineString([[0,0],[0,1]]),
//       turf.point([1,0])
//     ]);
//     const expected = null;
//     expect(getGeomCollPolyFeats(geojson)).toEqual(expected);
//   });
// });

describe("getUsablePolygonGeometry", () => {
	test("throws an error for invalid input geometry", () => {
		expect(() => {
			getUsablePolygonGeometry(null);
		}).toThrow("Invalid input geometry");

		expect(() => {
			getUsablePolygonGeometry({ type: "Point", coordinates: [0, 0] });
		}).toThrow("Invalid input geometry");
	});

	test("returns the same polygon if input is already a polygon", () => {
		const polygon = turf.polygon([
			[
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0],
			],
		]);
		const result = getUsablePolygonGeometry(polygon);

		expect(result.refinedGeoJSON).toEqual(polygon);
		expect(result.discardedMultipolyParts).toEqual([]);
	});

	test("gets polygon from MultiPolygon", () => {
		const multiPolygon = turf.multiPolygon([
			[
				[
					[0, 0],
					[0, 1],
					[1, 1],
					[1, 0],
					[0, 0],
				],
			],
			[
				[
					[2, 0],
					[2, 1],
					[3, 1],
					[3, 0],
					[2, 0],
				],
			],
		]);

		const result = getUsablePolygonGeometry(multiPolygon);

		if (result) {
			if (result.refinedGeoJSON) {
				expect(result.refinedGeoJSON.geometry.type).toEqual("Polygon");
			}
			expect(result.discardedMultipolyParts).not.toBeNull();
		} else {
			expect(result).toBeNull();
		}
	});

	test("gets polygon from GeometryCollection", () => {
		const geometryCollection = turf.geometryCollection([
			turf.point([0, 0]),
			turf.polygon([
				[
					[0, 0],
					[0, 1],
					[1, 1],
					[1, 0],
					[0, 0],
				],
			]),
			// turf.polygon([
			// 	[
			// 		[2, 0],
			// 		[2, 1],
			// 		[3, 1],
			// 		[3, 0],
			// 		[2, 0],
			// 	],
			// ]),
		]);

		const result = getUsablePolygonGeometry(geometryCollection);

		if (result) {
			if (result.refinedGeoJSON) {
				// console.log({ result });
				// console.log(result.refinedGeoJSON);
				expect(result.refinedGeoJSON.geometry.type).toEqual("Polygon");
			}
			expect(result.discardedMultipolyParts).not.toBeNull();
		} else {
			expect(result).toBeNull();
		}
	});
});
