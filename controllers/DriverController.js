const Driver = require("../models/DriverModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");
const {getModel} = require("../helpers/dbManager");

// Driver Schema
function DriverData(data) {
  this._id = data._id;
  this.name = data.name;
}

/**
 * Clients Search.
 *
 * @returns {Object}
 */

exports.driverSearch = [
  async (req, res) => {
    const DriverModel = await getModel(req, "Driver");
    const searchTerm = req.body.searchTerm;
    const searchLimit = req.body.searchLimit;
    const searchSkip = req.body.searchSkip;
    const sortBy = req.body.sortBy;
    const sortOrder = req.body.sortOrder;

    res.count = await DriverModel.count({
      name: { $regex: searchTerm + ".*", $options: "i" },
    });
    try {
      await DriverModel.find({ name: { $regex: searchTerm + ".*", $options: "i" } })
        .sort({ createdAt: sortOrder })
        .skip(searchSkip)
        .limit(searchLimit)
        .then((drivers) =>
          apiResponse.successResponseWithData(
            res,
            "Operation success",
            drivers ?? []
          )
        );
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Driver List.
 *
 * @returns {Object}
 */
exports.driverList = [
  async function (req, res) {
    try {
      const DriverModel = await getModel(req, "Driver");
      await DriverModel.find().then((drivers) => {
        if (drivers.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            drivers
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Driver Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.driverDetail = [
  async (req, res) => {
    const DriverModel = await getModel(req, "Driver");

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.ErrorResponse(res, "Id not valid");
    }
    try {
      await DriverModel.findOne({ _id: req.params.id }, "_id name createdAt").then(
        (driver) =>
			apiResponse.successResponseWithData(res, "Operation success", driver ?? {}));
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Driver store.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.driverStore = [
  body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
  sanitizeBody("*").escape(),
  async (req, res) => {
    const DriverModel = await getModel(req, "Driver");

    try {
      const errors = validationResult(req);
      const driver = new DriverModel({ name: req.body.name });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        await DriverModel.create(driver).then((driver) =>
			apiResponse.successResponseWithData(res, "Driver add Success.", new DriverData(driver))
		).catch((err) => apiResponse.ErrorResponse(res, err));
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Driver update.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.driverUpdate = [
  async (req, res) => {
    try {
      const DriverModel = await getModel(req, "Driver");
      const errors = validationResult(req);
      const driver = new DriverModel({
        name: req.body.name,
        _id: req.params.id,
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          await DriverModel.findByIdAndUpdate(req.params.id, driver, {new: true})
            .then((updatedDriver) =>
              apiResponse.successResponseWithData(
                res,
                "Book update Success.",
                  updatedDriver
              )
            )
            .catch((err) => apiResponse.ErrorResponse(res, err));
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Driver Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.driverDelete = [
  async (req, res) => {
    const DriverModel = await getModel(req, "Driver");

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid Error.",
        "Invalid ID"
      );
    }
    try {
      const foundDriver = await DriverModel.findById(req.params.id);
      if (foundDriver) {
        await DriverModel.findByIdAndRemove(req.params.id)
          .then(() => apiResponse.successResponse(res, "Driver delete success"))
          .catch((err) => apiResponse.ErrorResponse(res, err));
      } else {
        return apiResponse.notFoundResponse(res, "Driver not found");
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
