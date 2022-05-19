const Vehicle = require("../models/VehicleModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Vehicle Schema
function VehicleData(data) {
	this._id = data._id;
	this.plateNumber = data.plateNumber;
}

/**
 * Vehicle List.
 *
 * @returns {Object}
 */
exports.vehicleList = [
	function (req, res) {
		try {
			Vehicle.find().then((vehicles)=>{
				if(vehicles.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", vehicles);
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
 * Vehicle Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.vehicleDetail = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Vehicle.findOne({_id: req.params.id},"_id title description isbn createdAt").then((vehicle)=>{
				if(vehicle !== null){
					let vehicleData = new VehicleData(vehicle);
					return apiResponse.successResponseWithData(res, "Operation success", vehicleData);
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
 * Vehicle store.
 *
 * @param {string}      plateNumber
 *
 * @returns {Object}
 */
exports.vehicleStore = [
	body("plateNumber", "plateNumber must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var vehicle = new Vehicle({plateNumber: req.body.plateNumber});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save vehicle.
				vehicle.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let vehicleData = new VehicleData(vehicle);
					return apiResponse.successResponseWithData(res,"Book add Success.", vehicleData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Vehicle update.
 *
 * @param {string}      plateNumber
 *
 * @returns {Object}
 */
exports.vehicleUpdate = [
	(req, res) => {
		try {
			const errors = validationResult(req);
			var vehicle = new Vehicle(
				{
					plateNumber: req.body.plateNumber,
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
					Vehicle.findById(req.params.id, function (err, foundVehicle) {
						if(foundVehicle === null){
							return apiResponse.notFoundResponse(res,"Vehicle not exists with this id");
						}else{
							//update vehicle.
							Vehicle.findByIdAndUpdate(req.params.id, vehicle, {},function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								}else{
									let vehicleData = new VehicleData(vehicle);

									return apiResponse.successResponseWithData(res,"Vehicle update Success.", vehicleData);
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
 * Vehicle Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.vehicleDelete = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Vehicle.findById(req.params.id, function (err, foundVehicle) {
				if(foundVehicle === null){
					return apiResponse.notFoundResponse(res,"Vehicle not exists with this id");
				}else{
					//delete vehicle.
					Vehicle.findByIdAndRemove(req.params.id,function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						}else{
							return apiResponse.successResponse(res,"Vehicle delete Success.");
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