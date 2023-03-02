const turf = require("@turf/turf");
const chalk = require("./chalk-messages.js");

// DISABLLE SOME DEFAULT EXPRESS HEADERS
const _customHeaders = (app, req, res, next) => {
	app.disable(`x-powerd-by`);
	res.setHeader(`X-Powered-By`, `Your Village People V9.31`);
	// res.removeHeader(`Access-Control-Allow-Origin`);
	res.removeHeader(`Connection`);
	next();
};

const _getNextPayload = (prevMiddlewareParam, apiReqBodyParam) => {
	let nextPayload;
	if (prevMiddlewareParam) {
		return (nextPayload = prevMiddlewareParam);
	} else if (apiReqBodyParam) {
		return (nextPayload = apiReqBodyParam);
	}
};

// COMPARE THE LAND AREA TO THE SUM OF THE ALLOCATIONS
function _validateAllocationsArea(geojson, allocationsArray, geofileName) {
	const landArea = turf.area(geojson) / 10000;
	const allocations = [];
	allocationsArray.forEach((plotOwner) => allocations.push(plotOwner.allocation));
	const totalAllocArea = allocations.reduce((alloc, sum) => alloc + sum);
	if (landArea <= totalAllocArea) {
		throw new Error(
			`The total area allocated to the plot owners exceeds the land area of the geofile. Increase the land area in the geofile by at least ${(
				totalAllocArea - landArea
			).toFixed(
				3
			)} ha., and re-upload it. Or reduce the total area allocated to the plot owners by at least that amount. Call the API admin. on +234 8179144492 to de-list this JSON file [ ${geofileName}.json ] from the database so you can ammend the allocations. { Fee: NGN 500.00 }`
		);
	} else {
		console.log(chalk.warning(`LAND SIZE VS. TOTAL ALLOCATIONS CHECK OK.`));
	}
}

module.exports = {
	_customHeaders,
	_getNextPayload,
	_validateAllocationsArea,
};

exports._catchSyncError = (fn, fnDescr = null) => {
	return function (...params) {
		try {
			return fn(...params);
		} catch (err) {
			console.error(chalk.fail(`${fnDescr || fn.name} error:`, err.message));
		}
	};
};

/**
 * Wraps an asynchronous function and catches any errors that occur during its execution.
 *
 * @param {Function} fn - The asynchronous function to wrap.
 * @param {string} fnDescr - A description of the function (optional).
 * @returns {Function} A new function that catches errors and returns a Promise.
 */
exports._catchAsyncError = (fn, fnDescr = null) => {
  return async function (...params) {
    try {
      return await fn(...params);
    } catch (err) {
      console.error(`${fnDescr || fn.name} error:`, err.message);
      throw err;
    }
  };
}
