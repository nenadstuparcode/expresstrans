const Vehicle = require("../models/VehicleModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");

function VehicleData(data) {
	this._id = data._id;
	this.plateNumber = data.plateNumber;
}

exports.vehicleSearch = [
	async function (req,res) {
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const sortBy = req.body.sortBy;
		const sortOrder = req.body.sortOrder;

		res.count = await Vehicle.find({ "plateNumber" : { "$regex": searchTerm + ".*", "$options": "i"}});
		try {
			Vehicle.find(
				{ "plateNumber" : { "$regex": searchTerm + ".*", "$options": "i"}}).sort({createdAt: sortOrder}).skip(searchSkip).limit(searchLimit).then((vehicles)=>{
				vehicles.length > 0 ?
					apiResponse.successResponseWithData(res, "Operation success", vehicles) :
					apiResponse.successResponseWithData(res, "Operation success", []);
			});
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
/**
 * Vehicle List.
 *
 * @returns {Object}
 */
exports.vehicleList = [
	function (req, res) {
		try {
			Vehicle.find().then((vehicles)=> {
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
			Vehicle.findOne({_id: req.params.id},"_id plateNumber createdAt").then((vehicle)=>{
				if(vehicle !== null){
					let vehicleData = vehicle;
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
			const vehicle = new Vehicle({plateNumber: req.body.plateNumber});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				vehicle.save().then(vehicle =>
					apiResponse.successResponseWithData(res,"Book add Success.", new VehicleData(vehicle))
				).catch(err => apiResponse.ErrorResponse(res,err));
			}
		} catch (err) {
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
	async (req, res) => {
		try {
			const errors = validationResult(req);
			const vehicle = new Vehicle(
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
					const foundVehicle = await Vehicle.findById(req.params.id);

					if(foundVehicle) {
						await Vehicle.findByIdAndUpdate(req.params.id, vehicle, { new: true}).then(updatedVehicle =>
							apiResponse.successResponseWithData(res,"Vehicle update Success.", updatedVehicle)
						).catch(err => apiResponse.ErrorResponse(res, err));
					} else {
						return apiResponse.notFoundResponse(res, "Vehicle not found");
					}
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
	async (req, res) => {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			await Vehicle.findByIdAndRemove(req.params.id).then(() =>
				apiResponse.successResponse(res, "Delete Success")
			).catch(err => apiResponse.ErrorResponse(res, err));
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];