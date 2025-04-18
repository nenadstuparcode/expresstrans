const Client = require("../models/ClientModel");
const Invoice = require("../models/InvoiceModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");
const {getModel} = require("../helpers/dbManager");
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
	async (req,res) => {
		const ClientModel = await getModel(req, "Client");
		const InvoiceModel = await getModel(req, "Invoice");
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const sortProp = req.body.sort;

		res.count = await ClientModel.count({ "name" : { "$regex": searchTerm + ".*", "$options": "i"}});

		try {
			await InvoiceModel.find(
				{
					$and: [
						{payed: false},
						{active: true},
					]
				}

			).lean().then((notPaidInvoices) => {

				let unpaidInvoices = [...notPaidInvoices.map(n => n.clientId.toString() )];

				ClientModel.find(
					{ "name" : { "$regex": searchTerm + ".*", "$options": "i"}}).sort(sortProp).skip(searchSkip).limit(searchLimit).lean().then((clients)=>{
					clients.length > 0 ?
						apiResponse.successResponseWithData(res, "Operation success", clients.map(c => {
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

	}
];

/**
 * Client List.
 *
 * @returns {Object}
 */
exports.clientList = [
	async (req, res) => {
		const ClientModel = await getModel(req, "Client");
		try {
			await ClientModel.find().then(clients =>
				apiResponse.successResponseWithData(res, "Operation success", clients ?? []));
		} catch (err) {
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
	async (req, res) => {
		const ClientModel = await getModel(req, "Client");
		if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.ErrorResponse(res, "Client id not good");
		}

		try {
	 		await ClientModel.findOne({_id: req.params.id}).then(client =>
				apiResponse.successResponseWithData(res, "Operation success", client ?? {}));
		} catch (err) {
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
	async (req, res) => {
		try {
			const ClientModel = await getModel(req, "Client");
			const errors = validationResult(req);
			const client = new ClientModel({
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
			} else {
				client.save().then(client => {
					let clientData = new ClientData(client);
					return apiResponse.successResponseWithData(res,"Book add Success.", clientData);
				}).catch(err => apiResponse.ErrorResponse(res,err));
			}
		} catch (err) {
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
	async (req, res) => {
		try {
			const ClientModel = await getModel(req, "Client");
			const errors = validationResult(req);
			const client = new ClientModel(
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
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					const foundClient = await ClientModel.findById(req.params.id);
					if (foundClient) {
						await ClientModel.findByIdAndUpdate(req.params.id, client, {new: true}).then(updatedClient =>
							apiResponse.successResponseWithData(res, "Client update Success.", updatedClient)
						).catch(err => apiResponse.ErrorResponse(res, err));
					} else {
						return apiResponse.notFoundResponse(res, "Client not found");
					}
				}
			}
		} catch (err) {
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
	async (req, res)=> {
		const ClientModel = await getModel(req, "Client");
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			const foundClient = await ClientModel.findById(req.params.id);
			if(foundClient) {
				await ClientModel.findByIdAndRemove(req.params.id).then(() =>
					apiResponse.successResponse(res, "Client delete success")
				).catch(err => apiResponse.ErrorResponse(res, err));
			} else {
				return apiResponse.notFoundResponse(res, "Client not found");
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
