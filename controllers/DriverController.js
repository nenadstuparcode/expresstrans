const Driver = require("../models/DriverModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Driver Schema
function DriverData(data) {
	this._id = data._id;
	this.name = data.name;
}

/**
 * Driver List.
 *
 * @returns {Object}
 */
exports.driverList = [
	function (req, res) {
		try {
			Driver.find().then((drivers)=>{
				if(drivers.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", drivers);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Driver Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.driverDetail = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Driver.findOne({_id: req.params.id},"_id title description isbn createdAt").then((driver)=>{
				if(driver !== null){
					let driverData = new DriverData(driver);
					return apiResponse.successResponseWithData(res, "Operation success", driverData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
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
	(req, res) => {
		try {
			const errors = validationResult(req);
			var driver = new Driver({name: req.body.name});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save book.
				driver.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let driverData = new DriverData(driver);
					return apiResponse.successResponseWithData(res,"Book add Success.", driverData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Driver update.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.driverUpdate = [
	(req, res) => {
		try {
			const errors = validationResult(req);
			var driver = new Driver(
				{
					name: req.body.name,
					_id:req.params.id,
				}
			);

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Driver.findById(req.params.id, function (err, foundDriver) {
						if(foundDriver === null){
							return apiResponse.notFoundResponse(res,"Driver not exists with this id");
						}else{
							//update driver.
							Driver.findByIdAndUpdate(req.params.id, driver, {},function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								}else{
									let driverData = new DriverData(driver);
									console.log(driverData);
									return apiResponse.successResponseWithData(res,"Book update Success.", driverData);
								}
							});
						}

					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Driver Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.driverDelete = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Driver.findById(req.params.id, function (err, foundDriver) {
				if(foundDriver === null){
					return apiResponse.notFoundResponse(res,"Driver not exists with this id");
				}else{
					//delete driver.
					Driver.findByIdAndRemove(req.params.id,function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						}else{
							return apiResponse.successResponse(res,"Driver delete Success.");
						}
					});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];