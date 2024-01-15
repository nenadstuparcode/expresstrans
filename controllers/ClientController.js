const Client = require("../models/ClientModel");
const Invoice = require("../models/InvoiceModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");

// Client Schema
function ClientData(data) {
	this._id = data._id;
	this.name = data.name;
	this.info = data.info;
	this.address = data.address;
	this.zip = data.zip;
	this.city = data.city;
	this.country = data.country;
	this.pib = data.pib;
	this.phone = data.phone;
	this.contact = data.contact;
}


/**
 * Clients Search.
 *
 * @returns {Object}
 */

exports.clientSearch = [
	function (req,res) {
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const sortProp = req.body.sort;

		Client.find({ "name" : { "$regex": searchTerm + ".*", "$options": "i"}}).count((err, count) => {
			res.count = count;

			try {
				Invoice.find(
					{
						$and: [
							{payed: false},
							{active: true},
						]
					}

				).lean().then((notPaidInvoices) => {

					let unpaidInvoices = [...notPaidInvoices.map(n => n.clientId.toString() )];

					Client.find(
						{ "name" : { "$regex": searchTerm + ".*", "$options": "i"}}).sort(sortProp).skip(searchSkip).limit(searchLimit).lean().then((clients)=>{
						clients.length > 0 ?
							apiResponse.successResponseWithData(res, "Operation success", clients.map(c => {

								if(unpaidInvoices.includes(c._id.toString())) {
									console.log(notPaidInvoices.filter((i => i.clientId === c._id.toString())));
								}

								return {
									...c,
									hasInvoiceToPay: unpaidInvoices.includes(c._id.toString()),
								};
							})) :
							apiResponse.successResponseWithData(res, "Operation success", []);
					});
				});


			} catch (err) {
				return apiResponse.ErrorResponse(res, err);
			}
		});
	}
];


/**
 * Client List.
 *
 * @returns {Object}
 */
exports.clientList = [
	function (req, res) {
		try {
			Client.find().then((clients) => {
				if(clients.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", clients);
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
 * Client Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.clientDetail = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.ErrorResponse(res, "Client id not good");
		}
		try {
			Client.findOne({_id: req.params.id}).then((client)=> {
				console.log(client);
				client != null ?
					apiResponse.successResponseWithData(res, "Operation success", client) :
					apiResponse.successResponseWithData(res, "Operation success", {});

			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Client store.
 *
 * @returns {Object}
 */
exports.clientStore = [
	body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
	body("pib", "pib must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			const client = new Client({
				name: req.body.name,
				info: req.body.info,
				address: req.body.address,
				city: req.body.city,
				country: req.body.country,
				zip: req.body.zip,
				pib: req.body.pib,
				contact: req.body.contact,
				phone: req.body.phone,
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				client.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let clientData = new ClientData(client);
					return apiResponse.successResponseWithData(res,"Book add Success.", clientData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Client update.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.clientUpdate = [
	(req, res) => {
		try {
			const errors = validationResult(req);
			const client = new Client(
				{
					_id:req.params.id,
					name: req.body.name,
					info: req.body.info,
					address: req.body.address,
					zip: req.body.zip,
					city: req.body.city,
					country: req.body.country,
					pib: req.body.pib,
					phone: req.body.phone,
					contact: req.body.contact,
				}
			);

			if (!errors.isEmpty()) {
				console.log("test got err");
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Client.findById(req.params.id, function (err, foundClient) {
						if(foundClient === null){
							return apiResponse.notFoundResponse(res,"Client not exists with this id");
						}else{
							//update client.
							Client.findByIdAndUpdate(req.params.id, client, {},function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								}else{
									let clientData = new ClientData(client);
									console.log(clientData);
									return apiResponse.successResponseWithData(res,"Client update Success.", clientData);
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
 * Client Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.clientDelete = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Client.findById(req.params.id, function (err, foundClient) {
				if(foundClient === null){
					return apiResponse.notFoundResponse(res,"Client not exists with this id");
				}else{
					//delete client.
					Client.findByIdAndRemove(req.params.id,function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						}else{
							return apiResponse.successResponse(res,"Client delete Success.");
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