const Invoice = require("../models/InvoiceModel");
const Client = require("../models/ClientModel");
const Driver = require("../models/DriverModel");
const Vehicle = require("../models/VehicleModel");
const Trailer = require("../models/TrailerModel");
const { body,validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");
const Counter = require("../models/CounterModel");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const puppeteer = require("puppeteer");
const pdfService = require("../helpers/printService");
const moment = require("moment-timezone");
const n2words = require("n2words");
const { format } = require("number-currency-format");
const ObjectId = require("mongoose").Types.ObjectId;
// mongoose.set("useFindAndModify", false);

// Invoice Schema
function InvoiceData(data) {
	this._id = data._id;
	this.invoiceNumber = data.invoiceNumber;
	this.invoiceDateStart = data.invoiceDateStart;
	this.invoiceDateReturn = data.invoiceDateReturn;
	this.invoiceVehicle = data.invoiceVehicle;
	this.invoiceDrivers = data.invoiceDrivers;
	this.invoiceExpCro = data.invoiceExpCro;
	this.invoiceExpSlo = data.invoiceExpSlo;
	this.invoiceExpAus = data.invoiceExpAus;
	this.invoiceExpGer = data.invoiceExpGer;
	this.invoiceInitialExpenses = data.invoiceInitialExpenses;
	this.invoiceInitialExpensesDesc = data.invoiceInitialExpensesDesc;
	this.invoiceUnexpectedExpenses = data.invoiceUnexpectedExpenses;
	this.invoiceUnexpectedExpensesDesc = data.invoiceUnexpectedExpensesDesc;
	this.invoiceTotalBill = data.invoiceTotalBill;
	this.totalKilometers = data.totalKilometers;
	this.bihKilometers = data.bihKilometers;
	this.diffKilometers = data.diffKilometers;
	this.firstCalculation = data.firstCalculation;
	this.secondCalculation = data.secondCalculation;
	this.returnTaxBih = data.returnTaxBih;
	this.createdAt = data.createdAt;
	this.invoicePublicId = data.invoicePublicId;

	//New Props
	this.invoiceType = data.invoiceType;
	this.invoiceRelations = data.invoiceRelations;
	this.cmr = data.cmr;
	this.deadline = data.deadline;
	this.priceKm = data.priceKm;
	this.priceEuros = data.priceEuros;
	this.accountNumber = data.accountNumber;
	this.invoiceTrailer = data.invoiceTrailer;
	this.payed = data.payed;
	this.priceKmTax = data.priceKmTax;
	this.clientId = data.clientId;
	this.invDriver= data.invDriver;
	this.invTrailer = data.invTrailer;
	this.active = data.active;
}

const optionsEur = {
	currency: "€",
	spacing: true,
	thousandSeparator: ".",
	decimalSeparator: ",",
	currencyPosition: "RIGHT",
};

const optionsKm = {
	currency: "KM",
	spacing: true,
	thousandSeparator: ".",
	decimalSeparator: ",",
	currencyPosition: "RIGHT",
};

function priceToWords(price) {
	let pr = price.toFixed(2);
	return n2words(pr, {lang: "sr"}).replace(/\s/g, "");
}

function getPercentage(relations, index) {
	let totalKilometers = 0;
	relations.forEach(r => totalKilometers += r.kilometers);
	return  totalKilometers / relations[index].kilometers;
}




exports.invoiceReportByClients = [
       async (req, res) => {

		try {
			await Client.find({}).lean().then((foundClients) => {
				if(foundClients === null) return;
				let clients = foundClients;
				Invoice.aggregate(
					[
						{
							"$facet": {
								"invoiceData": [
									{
										$match: {
											$or: [
												{ "active" : null },
												{ "active" : true },
											],
										}
									},
									{
										$group: {
											_id: '$clientId',
											invoices: { $push: '$$ROOT' }
										}
									}
								],
								"invoiceTotals": [
									{
										"$group": {
											"_id": null,
											"count": {
												"$sum": 1
											},
											"priceTotalKm": {
												"$sum": {$cond: [{ $eq: [ "$active", true ] }, '$priceKm', 0]},
											},
											"priceTotalEur": {
												"$sum": {$cond: [{ $eq: [ "$active", true ] }, '$priceEuros', 0]},
											}
										}
									}
								]
							}
						},
						{
							$unwind : "$invoiceTotals"
						},
						{
							$project: {
								"data": {
									"invoiceData": "$invoiceData",
									"invoiceTotals": "$invoiceTotals",
								}
							}
						},
						{$unwind: "$data"},
						{$replaceRoot: { newRoot: "$data" }}
					]
				).then(async (data) => {
					console.log(data[0].invoiceData);
					let newData = data[0];
					// console.log(clients);
					let dataBinding = {
						headline: 'Kartica kupaca',
						invoiceData: [ ...newData.invoiceData.map(d => {
							console.log(d);
							return {
								...d,
								name: clients.find(c => c._id._id.equals(d._id))?.name || '',
								}
							})
						],
						priceTotalKm: newData.invoiceTotals.priceTotalKm,
						priceTotalEur: newData.invoiceTotals.priceTotalEur,
					};

					console.log(dataBinding)

					if(dataBinding) {

						handlebars.registerHelper("formatDate", (date) => {
							return moment(date).tz("Europe/Sarajevo").format("DD.MM.YYYY");
						});
						handlebars.registerHelper("convertToEUR", (value) => {
							if(value) {
								return format(value, optionsEur);
							} else {
								return '';
							}
						});
						handlebars.registerHelper("convertToKM", (value) => {
							if(value) {
								return format(value, optionsKm);
							} else {
								return '';
							}
						});
						handlebars.registerHelper("calculateTotal", (invoices,prop, currency) => {
							let total = 0;
							invoices.forEach(i => total += (i[prop] ? i[prop] : 0));
							return format(total, currency === "bam" ? optionsKm : optionsEur);
						})
						const templateHtml = fs.readFileSync(
							path.join(process.cwd(), `template-clients.hbs`), "utf8");

						const template = await handlebars.compile(templateHtml);
						const finalHtml = encodeURIComponent(template(dataBinding));
						const options = await pdfService.pdfPrintConfig2;
						const pdfBuffer = await pdfService.pdfGenerateBuffer2(finalHtml, options);

						res.setHeader("Content-Length",pdfBuffer.length);
						res.setHeader("Content-type", "application/pdf");
						res.setHeader("Content-Disposition", "attachment; filename=karta.pdf");

						res.end(pdfBuffer);
					}
				}).catch(err => {
					console.log(err);
					apiResponse.ErrorResponse(res, ' oooo jooooj')
				})
			}).catch(err => console.log(err));
		} catch (err) {
			return apiResponse.ErrorResponse(res, 'oooo joj');
		}
	}
];

exports.invoiceReportNotPaid = [
	async (req, res) => {

		try {
			await Client.find({}).lean().then((foundClients) => {
				if(foundClients === null) return;
				let clients = foundClients;
				Invoice.aggregate(
					[
						{
							"$facet": {
								"invoiceData": [
									{
										$match: {
											$or: [
												{ "active" : null },
												{ "active" : true },
											],
											$or: [
												{ "payed" : null },
												{ "payed" : false },
											],
										}
									},
									{
										$group: {
											_id: '$clientId',
											invoices: { $push: '$$ROOT' }
										}
									}
								],
								"invoiceTotals": [
									{
										$match: {
											$or: [
												{ "active" : null },
												{ "active" : true },
											],
											$and: [
												{ "payed" : false },
											],
										}
									},
									{
										"$group": {
											"_id": null,
											"count": {
												"$sum": 1
											},
											"priceTotalKm": {
												"$sum": {$cond: [{ $eq: [ "$active", true ] }, '$priceKm', 0]},
											},
											"priceTotalEur": {
												"$sum": {$cond: [{ $eq: [ "$active", true ] }, '$priceEuros', 0]},
											}
										}
									}
								]
							}
						},
						{
							$unwind : "$invoiceTotals"
						},
						{
							$project: {
								"data": {
									"invoiceData": "$invoiceData",
									"invoiceTotals": "$invoiceTotals",
								}
							}
						},
						{$unwind: "$data"},
						{$replaceRoot: { newRoot: "$data" }}
					],
				).then(async (data) => {

					let newData = data[0];
					let dataBinding = {
						headline: 'Neplaćene po kupcima',
						invoiceData: [ ...newData.invoiceData.map(d => {
							return {
								...d,
								name: clients.find(c => c._id.toString() === d._id.toString())?.name || '---',
							}
						})
						],
						priceTotalKm: newData.invoiceTotals.priceTotalKm,
						priceTotalEur: newData.invoiceTotals.priceTotalEur,
					};

					if(dataBinding) {

						handlebars.registerHelper("formatDate", (date) => {
							return moment(date).tz("Europe/Sarajevo").format("DD.MM.YYYY");
						});
						handlebars.registerHelper("convertToEUR", (value) => {
							if(value) {
								return format(value, optionsEur);
							} else {
								return '';
							}
						});
						handlebars.registerHelper("convertToKM", (value) => {
							if(value) {
								return format(value, optionsKm);
							} else {
								return '';
							}
						});
						handlebars.registerHelper("calculateTotal", (invoices,prop, currency) => {
							let total = 0;
							invoices.forEach(i => total += (i[prop] ? i[prop] : 0));
							return format(total, currency === "bam" ? optionsKm : optionsEur);
						})
						const templateHtml = fs.readFileSync(
							path.join(process.cwd(), `template-clients.hbs`), "utf8");

						const template = await handlebars.compile(templateHtml);
						const finalHtml = encodeURIComponent(template(dataBinding));
						const options = await pdfService.pdfPrintConfig2;
						const pdfBuffer = await pdfService.pdfGenerateBuffer2(finalHtml, options);

						res.setHeader("Content-Length",pdfBuffer.length);
						res.setHeader("Content-type", "application/pdf");
						res.setHeader("Content-Disposition", "attachment; filename=karta.pdf");

						res.end(pdfBuffer);
					}
				}).catch(err =>  apiResponse.ErrorResponse(res, err))
			}).catch(err => console.log(err));
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]
exports.invoiceReportAllInvoices = [
	async (req, res) => {

		try {
			await Client.find({}).lean().then((foundClients) => {
				if(foundClients === null) return;
				let clients = foundClients;
				Invoice.aggregate(
					[
						{
							$match: {
								$or: [
									{ "active" : null },
									{ "active" : true },
								],
							}
						},
					]
				).then(async (data) => {

					let dataBinding = {
						headline: 'Sve Fakture',
						invoiceData: data,
					};

					if(dataBinding.invoiceData) {

						handlebars.registerHelper("formatDate", (date) => {
							return moment(date).tz("Europe/Sarajevo").format("DD.MM.YYYY");
						});
						handlebars.registerHelper("convertToEUR", (value) => {
							if(value) {
								return format(value, optionsEur);
							} else {
								return '';
							}
						});
						handlebars.registerHelper("convertToKM", (value) => {
							if(value) {
								return format(value, optionsKm);
							} else {
								return '';
							}
						});
						handlebars.registerHelper("calculateTotal", (invoices,prop, currency) => {
							let total = 0;
							invoices.forEach(i => total += (i[prop] ? i[prop] : 0));
							return format(total, currency === "bam" ? optionsKm : optionsEur);
						})
						const templateHtml = fs.readFileSync(
							path.join(process.cwd(), `template-invoices.hbs`), "utf8");

						const template = await handlebars.compile(templateHtml);
						const finalHtml = encodeURIComponent(template(dataBinding));
						const options = await pdfService.pdfPrintConfig2;
						const pdfBuffer = await pdfService.pdfGenerateBuffer2(finalHtml, options);

						res.setHeader("Content-Length",pdfBuffer.length);
						res.setHeader("Content-type", "application/pdf");
						res.setHeader("Content-Disposition", "attachment; filename=karta.pdf");

						res.end(pdfBuffer);
					}
				}).catch(err =>  apiResponse.ErrorResponse(res, err))
			}).catch(err => console.log(err));
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
]

exports.invoiceReportByMonth = [
	async (req, res) => {
	const months = [
		"Januar",
		"Februar",
		"Mart",
		"April",
		"Maj",
		"Jun",
		"Jul",
		"August",
		"Septembar",
		"Oktobar",
		"Novembar",
		"Decembar",
	]
		try {
			Invoice.aggregate(
				[
					{
						$match: {
							$or: [
								{ "active" : null },
								{ "active" : true },
							],
						}
					},
					{
						$group: {
							_id: {
								year: { $year: "$invoiceDateStart" },
								month: { $month: "$invoiceDateStart" }
							},
							total_cost_Km: { $sum: "$priceKm" },
							total_cost_Eur: { $sum: "$priceEuros" },
							invoices: {$push: '$$ROOT'}
						},
					},
				]
			).then(async (data) => {

				let dataBinding = {
					headline: 'Fakture po mjesecima',
					invoiceData: data.map(d => {
						return {
							...d,
							_id: {
								...d._id,
								name: months[d._id.month - 1],
							}
						}
					}),
				};

				dataBinding.invoiceData.sort(function(a, b) {
					return a['_id']['month'] - b['_id']['month'];
				});

				if(dataBinding) {

					handlebars.registerHelper("formatDate", (date) => {
						return moment(date).tz("Europe/Sarajevo").format("DD.MM.YYYY");
					});
					handlebars.registerHelper("convertToEUR", (value) => {
						if(value) {
							return format(value, optionsEur);
						} else {
							return '';
						}
					});
					handlebars.registerHelper("convertToKM", (value) => {
						if(value) {
							return format(value, optionsKm);
						} else {
							return '';
						}
					});
					handlebars.registerHelper("calculateTotal", (invoices,prop, currency) => {
						let total = 0;
						invoices.forEach(i => total += (i[prop] ? i[prop] : 0));
						return format(total, currency === "bam" ? optionsKm : optionsEur);
					})
					const templateHtml = fs.readFileSync(
						path.join(process.cwd(), `template-invoice-months.hbs`), "utf8");

					const template = await handlebars.compile(templateHtml);
					const finalHtml = encodeURIComponent(template(dataBinding));
					const options = await pdfService.pdfPrintConfig2;
					const pdfBuffer = await pdfService.pdfGenerateBuffer2(finalHtml, options);

					res.setHeader("Content-Length",pdfBuffer.length);
					res.setHeader("Content-type", "application/pdf");
					res.setHeader("Content-Disposition", "attachment; filename=karta.pdf");

					res.end(pdfBuffer);
				}
			}).catch(err =>  apiResponse.ErrorResponse(res, err))
	} catch (err) {
	}
	}
]
/**
 * Invoice List.
 *
 * @returns {Object}
 */
exports.invoiceList = [
	function (req, res) {
		try {
			Invoice.find({}).then((invoices)=>{
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

exports.invoiceSearchV2 = [
	(req, res) => {
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const clientId = req.body.clientId;
		const paymentStatus = req.body.paymentStatus || null;
		const sort = req.body.sort || { createdAt: -1};
		const start = req.body?.start || null;
		const end = req.body?.end || null;

		const queries = [
			{	"invoiceNumber" : { "$regex": searchTerm + ".*", "$options": "i"} },
		];
		if(clientId) {
			queries.push({"clientId": new ObjectId(clientId) });
		}

		if(paymentStatus !== null) {
			queries.push({"payed": paymentStatus});
		}

		if(start) {
			queries.push({'invoiceDateStart':  { '$gte': new Date(start)}});
		}

		if(end) {
			queries.push({'invoiceDateStart': { '$lt': new Date(end)}});
		}

		try {
			Invoice.aggregate(	
				[
					{
						$match: {
							$and: queries,
						}
					},
					{
						"$facet": {
							"data": [
								{ "$sort":  sort },
								{ "$skip":  searchSkip },
								{ "$limit":  searchLimit },
							],
							"meta": [
								{
									"$group": {
										"_id": null,
										"count": {
											"$sum": 1
										},
										"priceTotalKm": {
											"$sum": {$cond: [{ $eq: [ "$active", true ] }, '$priceKm', 0]},
										},
										"priceTotalEur": {
											"$sum": {$cond: [{ $eq: [ "$active", true ] }, '$priceEuros', 0]},
										}
									}
								}
							]
						}
					},
					{
						"$unwind": {
							"path": "$meta"
						}
					},
				]).then((invoices) => {
				if(invoices.length > 0){
					return apiResponse.successResponseWithMetaData(res, "Operation success", ...invoices);
				}else{
					return apiResponse.successResponseWithMetaDataEmpty(res, "Nema rezultata pretrage");
				}
			});
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
		
		
	}
];
exports.invoiceSearch = [
	function (req,res) {

		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const clientId = req.body.clientId;

		Invoice.find({"invoiceNumber" : { "$regex": searchTerm + ".*", "$options": "i"}}).countDocuments((err, count) => {
			res.count = count;
			try {
				Invoice.find({"invoiceNumber" : { "$regex": searchTerm + ".*", "$options": "i"}},).sort({createdAt:-1}).skip(searchSkip).limit(searchLimit).then((invoices)=>{
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
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Invoice.findOne({_id: req.params.id}).then((invoice)=>{
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
	body("invoiceDateStart", "invoiceDateStart must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceDateReturn", "invoiceDateReturn must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			Counter.findOneAndUpdate({name: "invoiceCounter"}, {$inc: {count: 1}}, {new: true}, (err, doc) => {
				if (err) {
					console.log("Something wrong when updating data!");
				} else {
					const errors = validationResult(req);

					var invoice = new Invoice({
						invoiceNumber: doc.count,
						invoiceDateStart: req.body.invoiceDateStart, // ok
						invoiceDateReturn: req.body.invoiceDateReturn, // ok
						invoiceVehicle: req.body.invoiceVehicle, // ok
						invoiceExpCro: req.body.invoiceExpCro, // optional
						invoiceExpSlo: req.body.invoiceExpSlo, // optional
						invoiceExpAus: req.body.invoiceExpAus, // optional
						invoiceExpGer: req.body.invoiceExpGer, // optional
						invoiceInitialExpenses: req.body.invoiceInitialExpenses, // ok
						invoiceInitialExpensesDesc: req.body.invoiceInitialExpensesDesc, // optional
						invoiceUnexpectedExpenses: req.body.invoiceUnexpectedExpenses, // optional
						invoiceUnexpectedExpensesDesc: req.body.invoiceUnexpectedExpensesDesc, // optional
						invoiceTotalBill: req.body.invoiceTotalBill, // optional
						totalKilometers: req.body.totalKilometers, // optional
						bihKilometers: req.body.bihKilometers, // optional
						diffKilometers: req.body.diffKilometers, // optional
						firstCalculation: req.body.firstCalculation, // optional
						secondCalculation: req.body.secondCalculation, // optional
						returnTaxBih: req.body.returnTaxBih, // optional
						invoiceDrivers: [...req.body.invoiceDrivers], // ok
						invoicePublicId: doc.count,
						//New Props
						invoiceType : req.body.invoiceType, // ok
						invoiceRelations : [...req.body.invoiceRelations], // ok
						cmr : [...req.body.cmr], // ok
						deadline: req.body.deadline, // ok
						priceKm: req.body.priceKm, // ok
						priceEuros: req.body.priceEuros, // ok
						accountNumber: req.body.accountNumber, // ok
						invoiceTrailer: [...req.body.invoiceTrailer], // ok
						payed: req.body.payed, // ok
						priceKmTax: req.body.priceKmTax, // ok
						clientId: req.body.clientId, // ok
						invDriver: req.body.invDriver, // ok
						invTrailer: req.body.invTrailer, // ok
						active: req.body.active, // ok
					});




					if (!errors.isEmpty()) {
						return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
					} else {
						//Save Invoice.
						invoice.save(function (err) {
							if (err) {
								console.log(err);

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
	body("invoiceDateStart", "invoiceDateStart must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceDateReturn", "invoiceDateReturn must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			let invoice = new Invoice({
				invoiceNumber: req.body.invoiceNumber,
				invoiceDateStart: req.body.invoiceDateStart,
				invoiceDateReturn: req.body.invoiceDateReturn,
				invoiceVehicle: req.body.invoiceVehicle,
				invoiceExpCro: req.body.invoiceExpCro,
				invoiceExpSlo: req.body.invoiceExpSlo,
				invoiceExpAus: req.body.invoiceExpAus,
				invoiceExpGer: req.body.invoiceExpGer,
				invoiceInitialExpenses: req.body.invoiceInitialExpenses,
				invoiceInitialExpensesDesc: req.body.invoiceInitialExpensesDesc,
				invoiceUnexpectedExpenses: req.body.invoiceUnexpectedExpenses,
				invoiceUnexpectedExpensesDesc: req.body.invoiceUnexpectedExpensesDesc,
				invoiceTotalBill: req.body.invoiceTotalBill,
				totalKilometers: req.body.totalKilometers,
				bihKilometers: req.body.bihKilometers,
				diffKilometers: req.body.diffKilometers,
				firstCalculation: req.body.firstCalculation,
				secondCalculation: req.body.secondCalculation,
				returnTaxBih: req.body.returnTaxBih,
				invoiceDrivers: [...req.body.invoiceDrivers],
				invoicePublicId: req.body.invoicePublicId,
				_id: req.params.id,

				//New Props
				invoiceType : req.body.invoiceType,
				invoiceRelations : [...req.body.invoiceRelations],
				cmr : [...req.body.cmr],
				deadline: req.body.deadline,
				priceKm: req.body.priceKm,
				priceEuros: req.body.priceEuros,
				accountNumber: req.body.accountNumber,
				invoiceTrailer: [...req.body.invoiceTrailer],
				payed: req.body.payed,
				priceKmTax: req.body.priceKmTax,
				clientId: req.body.clientId,
				invDriver: req.body.invDriver, // ok
				invTrailer: req.body.invTrailer, // ok
				active: req.body.active, // ok
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
									console.log(err);
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
			console.log(err);
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.invoiceUpdateExp = [
	body("invoiceInitialExpenses", "invoiceInitialExpenses must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceUnexpectedExpenses", "invoiceUnexpectedExpenses must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceExpCro", "invoiceExpCro must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceExpSlo", "invoiceExpSlo must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceExpAus", "invoiceExpAus must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceExpGer", "invoiceExpGer must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			const invoice = {
				invoiceExpCro: req.body.invoiceExpCro,
				invoiceExpSlo: req.body.invoiceExpSlo,
				invoiceExpAus: req.body.invoiceExpAus,
				invoiceExpGer: req.body.invoiceExpGer,
				invoiceInitialExpenses: req.body.invoiceInitialExpenses,
				invoiceInitialExpensesDesc: req.body.invoiceInitialExpensesDesc,
				invoiceUnexpectedExpenses: req.body.invoiceUnexpectedExpenses,
				invoiceUnexpectedExpensesDesc: req.body.invoiceUnexpectedExpensesDesc,
				invoiceTotalBill: req.body.invoiceTotalBill,
			};

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

exports.invoiceUpdateTax = [
	body("totalKilometers", "totalKilometers must not be empty.").isLength({ min: 1 }).trim(),
	body("bihKilometers", "bihKilometers must not be empty.").isLength({ min: 1 }).trim(),
	body("diffKilometers", "diffKilometers must not be empty.").isLength({ min: 1 }).trim(),
	body("firstCalculation", "firstCalculation must not be empty.").isLength({ min: 1 }).trim(),
	body("secondCalculation", "secondCalculation must not be empty.").isLength({ min: 1 }).trim(),
	body("returnTaxBih", "returnTaxBih must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			const invoice = {
				totalKilometers: req.body.totalKilometers,
				bihKilometers: req.body.bihKilometers,
				diffKilometers: req.body.diffKilometers,
				firstCalculation: req.body.firstCalculation,
				secondCalculation: req.body.secondCalculation,
				returnTaxBih: req.body.returnTaxBih,
			};

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

exports.invoicePdfPrint = [
	async function (req,res) {
	    try {
			let cd = {};
			let id = {};
			let drivers = [];
			let vehicles = [];
			let trailers = [];

			await Driver.find({}, "_id name").lean().then((foundDrivers) => {
				if(foundDrivers === null) return;
				drivers = [...foundDrivers];
			}).catch(err => console.log(err));

			await Trailer.find({}).lean().then((foundTrailers) => {
				if(foundTrailers === null) return;
				trailers = foundTrailers;
			}).catch(err => console.log(err));

			await Vehicle.find({}).lean().then((foundVehicles) => {
				if(foundVehicles === null) return;
				vehicles = foundVehicles;
			}).catch(err => console.log(err));

			await Client.findOne({_id: new ObjectId(req.body.clientId)}).lean().then((foundClient) => {
				if(foundClient === null) return;
				cd = foundClient;
			}).catch(err => console.log(err));

			await Invoice.findOne({_id: new ObjectId(req.body.invoiceId)}).lean().then((foundInvoice) => {
				if(foundInvoice === null) return;
				id = foundInvoice;
			}).catch(err => console.log(err));


			const dataBinding = {
				isWatermark: true,
				printOption: req.body.printOption,
				clientData: cd,
				invoiceData: id,
				signed: req.body.signed,
			};

			try {
				if(dataBinding.clientData && dataBinding.invoiceData) {

					handlebars.registerHelper("formatDate", (date) => {
						return moment(date).tz("Europe/Sarajevo").format("DD.MM.YYYY");
					});

					handlebars.registerHelper("priceToWordsKM", (relations) => {
						let total = 0;
						relations.map(r => total += r.priceKm);

						return `${priceToWords(total)} KM`;
					});

					handlebars.registerHelper("priceToWordsEUR", (relations) => {
						let total = 0;
						relations.map(r => total += r.priceEur);

						return `${priceToWords(total)} EUR`;
					});

					handlebars.registerHelper("priceToWords", (price, curr) => {
						return `${priceToWords(price)} ${curr}`;
					});

					handlebars.registerHelper("deadline", (startdate, value) => {
						return moment(startdate, "DD.MM.YYYY").add(value, "days").format("DD.MM.YYYY");
					});

					handlebars.registerHelper("getDriverName", (id) => {
						return drivers.find(driver => driver._id.toString() === id.toString())?.name || '';
					});

					handlebars.registerHelper("getVehiclePlate", (id) => {
						return vehicles.find(vehicle => vehicle._id.toString() === id.toString())?.plateNumber || '';
					});

					handlebars.registerHelper("getTrailerName", (id) => {
						return trailers.find(trailer => trailer._id.toString() === id.toString())?.name || '';
					});

					handlebars.registerHelper("formatStringArray", (array) => {
						return array.join(", ");
					});

					handlebars.registerHelper("calculateTotalKM", (relations) => {
						let total = 0;
						relations.forEach(r => total += r.priceKm);
						return format(total, optionsKm);
					});

					handlebars.registerHelper("inc", (value) => {
						return parseInt(value) + 1;
					});

					handlebars.registerHelper("sum", (value1, value2) => {
						return value1 + value2;
					});

					handlebars.registerHelper("calculateTotalEUR", (relations) => {
						let total = 0;
						relations.forEach(r => total += r.priceEur);
						return format(total, optionsEur);
					});

					handlebars.registerHelper("convertToEUR", (value) => {
						if(value) {
							return format(value, optionsEur);
						} else {
							return value;
						}
					});

					handlebars.registerHelper("convertToKM", (value) => {
						if(value) {
							return format(value, optionsKm);
						} else {
							return value;
						}
					});

					handlebars.registerHelper("taxTotal", (relations) => {
						let total = 0;
						relations.map(r => total += (r.priceKmTax));
						return format(total, optionsKm);
					});

					handlebars.registerHelper("relationDiff", (relations, index, prop, currency) => {
						let curr = currency === "eur" ? optionsEur : optionsKm;
						return format(dataBinding.invoiceData[prop] / getPercentage(relations, index), curr);
					});

					handlebars.registerHelper("priceWithoutTax", (relations, prop1, prop2, index, currency) => {
						let curr = currency === "eur" ? optionsEur : optionsKm;

						let diff = (dataBinding.invoiceData[prop1] / getPercentage(relations, index) - dataBinding.invoiceData[prop2] / getPercentage(relations, index));
						return format(diff, curr);
					});

					handlebars.registerHelper("priceWithoutTax2", (r) => {
						return format(r.priceKm - r.priceKmTax, optionsKm);
					});

					handlebars.registerHelper("relationsSum", (relations, prop, currency) => {
						let curr = currency === "eur" ? optionsEur : optionsKm;
						let total = 0;
						relations.forEach(r => total += r[prop]);
						return format(total, curr);
					});

					handlebars.registerHelper("relationsTotalKM", (relations) => {
						let diff = (dataBinding.invoiceData["priceKmTax"] / getPercentage(relations, 0));
						let total =  dataBinding.invoiceData.priceKm - diff;
						return format(total, optionsKm);
					});

					handlebars.registerHelper("getRelationPrice", (relations, prop, index, currency) => {
						let curr = currency === "eur" ? optionsEur : optionsKm;
						let diff = (dataBinding.invoiceData[prop] / getPercentage(relations,index));

						return format(diff, curr);

					});

					const templateHtml = fs.readFileSync(
						path.join(process.cwd(), `option-${dataBinding.printOption}.hbs`), "utf8");

					const template = await handlebars.compile(templateHtml);
					const finalHtml = encodeURIComponent(template(dataBinding));
					const options = pdfService.pdfPrintConfig2;
					const pdfBuffer = await pdfService.pdfGenerateBuffer2(finalHtml, options);

					res.setHeader("Content-Length",pdfBuffer.length);
					res.setHeader("Content-type", "application/pdf");
					res.setHeader("Content-Disposition", "attachment; filename=karta.pdf");

					res.end(pdfBuffer);
				} else {
					return apiResponse.ErrorResponse(res, new Error("no invoice data"));
				}


			} catch (err) {
				return apiResponse.ErrorResponse(res, new Error("test"));
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, new Error("test2"));
		}

	}
];

exports.invoicePrintTax = [
	async function (req,res) {
		try {
			var dataBinding = {
				isWatermark: true,
				drivers: req.body.invoice.invoiceDrivers.map((driver) => driver.name).join(", "),
				showExpenses: req.body.showExpenses,
				showTax: req.body.showTax,
				invoice: req.body.invoice,
				bihTickets: req.body.bihTickets,
				deTickets: req.body.deTickets,
				expenses: req.body.expenses,
				tax: req.body.tax,
				totalPriceDe: req.body.totalPriceDe,
				totalPriceBih: req.body.totalPriceBih,
				total: +(req.body.totalPriceBih + req.body.totalPriceDe).toFixed(2),
				totalKM: +(+(req.body.totalPriceBih + req.body.totalPriceDe) * 1.95583).toFixed(2),
				toBillTotal: +(+(req.body.totalPriceBih + req.body.totalPriceDe) -
					+(req.body.invoice.invoiceInitialExpenses + req.body.invoice.invoiceUnexpectedExpenses) -
					+(req.body.invoice.invoiceExpCro + req.body.invoice.invoiceExpSlo + req.body.invoice.invoiceExpAus + req.body.invoice.invoiceExpGer)).toFixed(2),
				toBillTotalKM: +(+(+(req.body.totalPriceBih + req.body.totalPriceDe) -
					+(req.body.invoice.invoiceInitialExpenses + req.body.invoice.invoiceUnexpectedExpenses) -
					+(req.body.invoice.invoiceExpCro + req.body.invoice.invoiceExpSlo + req.body.invoice.invoiceExpAus + req.body.invoice.invoiceExpGer)) * 1.95583).toFixed(2),
				expensesTotal: +(+(req.body.invoice.invoiceInitialExpenses + req.body.invoice.invoiceUnexpectedExpenses) +
					+(req.body.invoice.invoiceExpCro + req.body.invoice.invoiceExpSlo + req.body.invoice.invoiceExpAus + req.body.invoice.invoiceExpGer)).toFixed(2),
				expensesTotalKM: +(+(+(req.body.invoice.invoiceInitialExpenses + req.body.invoice.invoiceUnexpectedExpenses) +
					+(req.body.invoice.invoiceExpCro + req.body.invoice.invoiceExpSlo + req.body.invoice.invoiceExpAus + req.body.invoice.invoiceExpGer)) * 1.95583).toFixed(2),
			};

			let ticketTemplate = "izvjestaj-bih.html";

			var templateHtml = fs.readFileSync(path.join(process.cwd(), ticketTemplate), "utf8");
			var template = handlebars.compile(templateHtml);
			var finalHtml = encodeURIComponent(template(dataBinding));
			var options = {
				format: "A4",
				headerTemplate: "<p></p>",
				footerTemplate: "<p></p>",
				displayHeaderFooter: false,
				margin: {
					top: "15px",
					left: "15px",
					right: "15px",
					bottom: "15px",
				},
				printBackground: true,
			};

			const browser = await puppeteer.launch({
				headless: true,
				args: ["--no-sandbox", "--use-gl=egl"],
			});
			const page = await browser.newPage();
			await page.setContent(finalHtml);
			await page.setViewport({ width: 1000, height: 420});
			await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
				waitUntil: "networkidle0"
			});
			const pdfBuffer = await page.pdf(options);

			await page.close();
			await browser.close();

			res.setHeader("Content-Length",pdfBuffer.length);
			res.setHeader("Content-type", "application/pdf");
			res.setHeader("Content-Disposition", "attachment; filename=izvjestaj-bih.pdf");

			res.end(pdfBuffer);
		} catch (err) {
			console.log("ERROR:", err);
		}
	}
];