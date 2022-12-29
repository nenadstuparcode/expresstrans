const Counter = require("../models/CounterModel");
const apiResponse = require("../helpers/apiResponse");

/**
 * Counter List.
 *
 * @returns {Object}
 */
exports.counterList = [
	function (req, res) {
		try {
			Counter.find().then((counters) => {
				if(counters.length > 0) {
					return apiResponse.successResponseWithData(res, "Operation success", counters);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];