const apiResponse = require("../helpers/apiResponse");

/**
 * Counter List.
 *
 * @returns {Object}
 */
exports.counterList = [
  async (req, res) => {
    const CounterModel = await getModel(req, "Counter");
    try {
      await CounterModel.find().then((counters) =>
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
