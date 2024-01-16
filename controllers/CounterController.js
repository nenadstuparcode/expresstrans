const Counter = require("../models/CounterModel");
const apiResponse = require("../helpers/apiResponse");

/**
 * Counter List.
 *
 * @returns {Object}
 */
exports.counterList = [
  async (req, res) => {
    try {
      await Counter.find().then((counters) =>
        apiResponse.successResponseWithData(
          res,
          "Operation success",
          counters ?? []
        )
      );
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
