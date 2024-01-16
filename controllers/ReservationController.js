const Reservation = require("../models/ReservationModel");
const { body,validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
// mongoose.set("useFindAndModify", false);

// Reservation Schema
function ReservationData(data) {
	this._id = data._id;
	this.reservationOnName = data.reservationOnName;
	this.reservationPhone = data.reservationPhone;
	this.reservationDate = data.reservationDate;
	this.reservationTime = data.reservationTime;
	this.reservationNote = data.reservationNote;
	this.ticketBusLineId = data.ticketBusLineId;

}

/**
 * Reservation List.
 *
 * @returns {Object}
 */
exports.reservationList = [
	function (req, res) {
		try {
			Reservation.find({},"_id reservationOnName reservationPhone reservationDate reservationTime reservationNote ticketBusLineId modifiedAt createdAt").then((reservations)=>{
				if(reservations.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", reservations);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Reservation Search.
 *
 * @returns {Object}
 */
exports.reservationSearch = [
	async function (req,res) {

		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;

		res.count = await Reservation.count({ "reservationOnName" : { "$regex": searchTerm + ".*", "$options": "i"}})
		try {
			Reservation.find({"reservationOnName" : { "$regex": searchTerm + ".*", "$options": "i"}}).sort({createdAt:-1}).skip(searchSkip).limit(searchLimit).then((reservations)=>{
				if(reservations.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", reservations);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}

];

/**
 * Reservation Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.reservationDetail = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Reservation.findOne({_id: req.params.id},"_id reservationOnName reservationPhone reservationDate reservationTime reservationNote ticketBusLineId modifiedAt createdAt").then((reservation)=>{
				if(Reservation !== null){
					let reservationData = new ReservationData(reservation);
					return apiResponse.successResponseWithData(res, "Operation success", reservationData);
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
 * Reservation store.
 *
 * @param {number}      invoiceNumber
 * @param {date}      invoiceDateStart
 * @param {date}      invoiceDateReturn
 * @param {string}      invoiceVehicle
 * @param {string[]}      invoiceDrivers
 *
 * @returns {Object}
 */
exports.reservationStore = [
	(req, res) => {
		try {
			const errors = validationResult(req);

			const reservation = new Reservation({
				reservationOnName: req.body.reservationOnName,
				reservationPhone: req.body.reservationPhone,
				reservationDate: req.body.reservationDate,
				reservationTime: req.body.reservationTime,
				reservationNote: req.body.reservationNote,
				ticketBusLineId: req.body.ticketBusLineId,
			});

			console.log(reservation);


			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				//Save Reservation.
				reservation.save().then(reservation => {
					let reservationData = new ReservationData(reservation);
					return apiResponse.successResponseWithData(res, "Reservation add Success.", reservationData);
				}).catch(err => {
					return apiResponse.ErrorResponse(res,err);
				});
			}

		} catch (err) {
			console.log(err);
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Invoice update.
 *
 * @param {date}      invoiceDateStart
 * @param {date}      invoiceDateReturn
 * @param {string}      invoiceVehicle
 * @param {string[]}      invoiceDrivers
 *
 * @returns {Object}
 */
exports.reservationUpdate = [
	body("reservationOnName", "reservationOnName must not be empty.").isLength({ min: 1 }).trim(),
	body("reservationTime", "reservationTime must not be empty.").isLength({ min: 1 }).trim(),
	body("reservationDate", "reservationDate must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketBusLineId", "ticketBusLineId must not be empty.").isLength({ min: 1 }).trim(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			const reservation = new Reservation({
				reservationOnName: req.body.reservationOnName,
				reservationPhone: req.body.reservationPhone,
				reservationDate: req.body.reservationDate,
				reservationTime: req.body.reservationTime,
				reservationNote: req.body.reservationNote,
				ticketBusLineId: req.body.ticketBusLineId,
				_id: req.params.id,
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					const foundReservation = await Reservation.findById(req.params.id);
					if(foundReservation) {
						Reservation.findByIdAndUpdate(req.params.id, reservation, {}).then(reservation =>
							apiResponse.successResponseWithData(res,"Reservation Update Success.", new ReservationData(reservation))
						).catch(err => apiResponse.ErrorResponse(res, err));
					} else {
						return apiResponse.notFoundResponse(res, "Reservation not found");
					}
				}
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Reservation Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.reservationDelete = [
	async (req, res) => {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			const foundReservation = await Reservation.findById(req.params.id);
			if(foundReservation) {
				Reservation.findByIdAndRemove(req.params.id).then(() =>
					apiResponse.successResponse(res, "Reservation delete suceess")
				).catch(err => apiResponse.ErrorResponse(res, err));
			} else {
				return apiResponse.notFoundResponse(res, "Reservation not found");
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.reservationsSearchDate = [
	async function (req,res) {
		const pageNumber = req.body.pageNumber;
		const resultPerPage = req.body.resultPerPage;
		const searchTerm = req.body.searchTerm;
		const startDate = req.body.startDate;
		const endDate = req.body.endDate;
		const sortByProp = req.body.sortByProp ? req.body.sortByProp : "reservationOnName";
		const sortOption = req.body.sortOption ? req.body.sortOption : -1;

		res.count = await Reservation.count(
			{
				$and : [
					{ "reservationOnName" : { "$regex": searchTerm + ".*", "$options": "i"}},
					{ "reservationDate" : { "$gte" : startDate, "$lt" : endDate}},
				]
			});
		try {
			Reservation.find(
				{
					$and : [
						{ "reservationOnName" : { "$regex": searchTerm + ".*", "$options": "i"}},
						{ "reservationDate" : { "$gte" : startDate, "$lt" : endDate}},
					]
					,
				}, "_id reservationOnName reservationPhone reservationDate reservationTime reservationNote ticketBusLineId modifiedAt createdAt")
				.sort({[sortByProp]: sortOption})
				.skip( pageNumber > 0 ? ( ( pageNumber ) * resultPerPage ) : 0 )
				.limit( resultPerPage )
				.then((reservations)=>{
					if(reservations.length > 0){
						return apiResponse.successResponseWithData(res, "Operation success", reservations);
					}else{
						return apiResponse.successResponseWithData(res, "Operation success", []);
					}
				});
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}

	}

];
