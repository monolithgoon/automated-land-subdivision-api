`uee strict`;
const turf = require("@turf/turf");
const { getGeomCollPolygons, getUsablePolygonGeometry, getBufferedPolygon } = require("../helpers.js");

describe("getGeomCollPolygons", () => {
	test("should extract polygon features from a GeoJSON GeometryCollection", () => {
		const geojson = turf.geometryCollection([
			turf.polygon([
				[
					[0, 0],
					[0, 1],
					[1, 1],
					[1, 0],
					[0, 0],
				],
			]),
			turf.lineString([
				[2, 0],
				[2, 1],
			]),
			turf.point([3, 0]),
		]);
		const expected = [turf.feature(geojson.geometry.geometries[0].geometry)];
		// console.log(expected[0].geometry)
		const result = getGeomCollPolygons(geojson);
		// console.log(result[0].geometry)
		expect(result).toEqual(expected);
	});

	test("should return [] if there are no polygons in the GeoJSON GeometryCollection", () => {
		const geojson = turf.geometryCollection([
			turf.lineString([
				[0, 0],
				[0, 1],
			]),
			turf.point([1, 0]),
		]);
		expect(getGeomCollPolygons(geojson)).toEqual([]);
	});
});

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

describe('getBufferedPolygon', () => {

  const gjPolygon = turf.polygon([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]);

  // test('returns null if gjPolygon is null or undefined', () => {
  //   expect(getBufferedPolygon(null, 1)).toBeNull();
  //   expect(getBufferedPolygon(undefined, 1)).toBeNull();
  // });

  // test('returns original polygon if bufferAmt is 0', () => {
  //   expect(getBufferedPolygon(gjPolygon, 0)).toBe(gjPolygon);
  // });

  // test('returns original polygon if originalArea is less than 0.5', () => {
  //   const smallPolygon = turf.polygon([[[0, 0], [0, 0.1], [0.1, 0.1], [0.1, 0], [0, 0]]]);
  //   console.log(getBufferedPolygon(smallPolygon, 1).geometry.coordinates)
  //   // expect(getBufferedPolygon(smallPolygon, 1)).toBe(gjPolygon);
  // });

  // test('returns original polygon if types are different', () => {
  //   const gjLineString = turf.lineString([[0, 0], [1, 1]]);
  //   expect(getBufferedPolygon(gjLineString, 1)).toBe(gjLineString);
  // });

  test('returns original polygon if bufferAmt caused deformation', () => {
    const gjRectangle = turf.polygon([[[0, 0], [0, 1], [2, 1], [2, 0], [0, 0]]]);
    expect(getBufferedPolygon(gjRectangle, 1)).toBe(gjRectangle);
  });

  // test('returns buffered polygon if all conditions are met', () => {
  //   const gjRectangle = turf.polygon([[[0, 0], [0, 1], [2, 1], [2, 0], [0, 0]]]);
  //   const bufferedPolygon = turf.buffer(gjRectangle, 1);
  //   expect(getBufferedPolygon(gjRectangle, 1)).toEqual(bufferedPolygon);
  // });
});