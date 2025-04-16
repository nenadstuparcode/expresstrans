const Vehicle = require("../models/VehicleModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");
const {getModel} = require("../helpers/dbManager");

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

		const VehicleModel = await getModel(req, "Vehicle");
		res.count = await VehicleModel.find({ "plateNumber" : { "$regex": searchTerm + ".*", "$options": "i"}});
		try {
			await VehicleModel.find(
				{ "plateNumber" : { "$regex": searchTerm + ".*", "$options": "i"}}).sort({createdAt: sortOrder}).skip(searchSkip).limit(searchLimit).then((vehicles)=>{
				apiResponse.successResponseWithData(res, "Operation success",vehicles.length > 0 ? vehicles : []);
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
	async function (req, res) {
		try {
			const VehicleModel = await getModel(req, "Vehicle");
			await VehicleModel.find().then((vehicles)=> {
				return apiResponse.successResponseWithData(res, "Operation success", vehicles.length > 0 ? vehicles : []);
			});
		} catch (err) {
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
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			const VehicleModel = await getModel(req, "Vehicle");
			await VehicleModel.findOne({_id: req.params.id},"_id plateNumber createdAt").then((vehicle)=> {
				return apiResponse.successResponseWithData(res, "Operation success", vehicle !== null ? vehicle : {});
			});
		} catch (err) {
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
	async (req, res) => {
		try {
			const VehicleModel = await getModel(req, "Vehicle");
			const errors = validationResult(req);
			const vehicle = new VehicleModel({plateNumber: req.body.plateNumber});

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
			const VehicleModel = await getModel(req, "Vehicle");
			const errors = validationResult(req);
			const vehicle = new VehicleModel(
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
					const foundVehicle = await VehicleModel.findById(req.params.id);

					if(foundVehicle) {
						await VehicleModel.findByIdAndUpdate(req.params.id, vehicle, { new: true}).then(updatedVehicle =>
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
			const VehicleModel = await getModel(req, "Vehicle");

			await VehicleModel.findByIdAndRemove(req.params.id).then(() =>
				apiResponse.successResponse(res, "Delete Success")
			).catch(err => apiResponse.ErrorResponse(res, err));
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
