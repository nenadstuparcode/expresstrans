const Invoice = require("../models/InvoiceModel");
const { body,validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const Counter = require("../models/CounterModel");
mongoose.set("useFindAndModify", false);

// Invoice Schema
function InvoiceData(data) {
	this._id = data._id;
	this.invoiceDateStart = data.invoiceDateStart;
	this.invoiceDateReturn = data.invoiceDateReturn;
	this.invoiceVehicle = data.invoiceVehicle;
	this.invoiceDrivers = data.invoiceDrivers;
	this.createdAt = data.createdAt;
}


/**
 * Invoice List.
 *
 * @returns {Object}
 */
exports.invoiceList = [
	auth,
	function (req, res) {
		try {
			Invoice.find({},"_id invoiceNumber invoiceDateStart invoiceDateReturn invoiceVehicle invoiceDrivers createdAt user modifiedAt").then((invoices)=>{
				if(invoices.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", invoices);
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
 * Invoice Search.
 *
 * @returns {Object}
 */
exports.invoiceSearch = [
	auth,
	function (req,res) {

		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;

		Invoice.find({ "invoiceNumber" : { "$regex": searchTerm + ".*", "$options": "i"}}).count((err, count) => {
			res.count = count;
			try {
				Invoice.find({"invoiceNumber" : { "$regex": searchTerm + ".*", "$options": "i"}},"_id invoiceNumber invoiceDateStart invoiceDateReturn invoiceVehicle invoiceDrivers createdAt user modifiedAt").sort({createdAt:-1}).skip(searchSkip).limit(searchLimit).then((invoices)=>{
					if(invoices.length > 0){
						return apiResponse.successResponseWithData(res, "Operation success", invoices);
					}else{
						return apiResponse.successResponseWithData(res, "Operation success", []);
					}
				});
			} catch (err) {
				return apiResponse.ErrorResponse(res, err);
			}
		});
	}

];

/**
 * Invoice Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.invoiceDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Invoice.findOne({_id: req.params.id},"_id invoiceNumber invoiceDateStart invoiceDateReturn invoiceVehicle invoiceDrivers createdAt user modifiedAt").then((invoice)=>{
				if(invoice !== null){
					let invoiceData = new InvoiceData(invoice);
					return apiResponse.successResponseWithData(res, "Operation success", invoiceData);
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
 * Invoice store.
 *
 * @param {number}      invoiceNumber
 * @param {date}      invoiceDateStart
 * @param {date}      invoiceDateReturn
 * @param {string}      invoiceVehicle
 * @param {string[]}      invoiceDrivers
 *
 * @returns {Object}
 */
exports.invoiceStore = [
	auth,
	body("invoiceDateStart", "invoiceDateStart must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceDateReturn", "invoiceDateReturn must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceVehicle", "invoiceVehicle must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {

			Counter.findOneAndUpdate({name: "invoiceCounter"}, {$inc: {count: 1}}, {new: true}, (err, doc) => {
				if (err) {
					console.log("Something wrong when updating data!");
				} else {
					const errors = validationResult(req);

					var invoice = new Invoice({
						invoiceNumber: doc.count,
						invoiceDateStart: req.body.invoiceDateStart,
						invoiceDateReturn: req.body.invoiceDateReturn,
						invoiceVehicle: req.body.invoiceVehicle,
						invoiceDrivers: [...req.body.invoiceDrivers],
					});


					if (!errors.isEmpty()) {
						return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
					} else {
						//Save Invoice.
						invoice.save(function (err) {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							}
							let invoiceData = new InvoiceData(invoice);
							return apiResponse.successResponseWithData(res, "Invoice add Success.", invoiceData);
						});
					}
				}
			});

		} catch (err) {
			//throw error in json response with status 500. 
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
exports.invoiceUpdate = [
	auth,
	body("invoiceDateStart", "invoiceDateStart must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceDateReturn", "invoiceDateReturn must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceVehicle", "invoiceVehicle must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var invoice = new Invoice({
				invoiceDateStart: req.body.invoiceDateStart,
				invoiceDateReturn: req.body.invoiceDateReturn,
				invoiceVehicle: req.body.invoiceVehicle,
				invoiceDrivers: [...req.body.invoiceDrivers],
				_id: req.params.id,
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Invoice.findById(req.params.id, function (err, foundInvoice) {
						if(foundInvoice === null){
							return apiResponse.notFoundResponse(res,"Invoice not exists with this id");
						}else{
							//update Invoice.
							Invoice.findByIdAndUpdate(req.params.id, invoice, {},function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								}else{
									let invoiceData = new InvoiceData(invoice);
									return apiResponse.successResponseWithData(res,"Invoice Update Success.", invoiceData);
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
 * Invoice Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.invoiceDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Invoice.findById(req.params.id, function (err, foundInvoice) {
				if(foundInvoice === null){
					return apiResponse.notFoundResponse(res,"Invoice not exists with this id");
				}else{
					//delete Invoice.
					Invoice.findByIdAndRemove(req.params.id,function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						}else{
							return apiResponse.successResponse(res,"BusLine delete Success.");
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
