const Invoice = require("../models/InvoiceModel");
const { body,validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
const Counter = require("../models/CounterModel");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const puppeteer = require("puppeteer");
mongoose.set("useFindAndModify", false);

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
}

/**
 * Invoice List.
 *
 * @returns {Object}
 */
exports.invoiceList = [
	function (req, res) {
		try {
			Invoice.find({},"_id invoicePublicId invoiceNumber invoiceDateStart invoiceDateReturn invoiceVehicle invoiceDrivers invoiceExpCro invoiceExpSlo invoiceExpAus invoiceExpGer invoiceInitialExpenses invoiceInitialExpensesDesc invoiceUnexpectedExpenses invoiceUnexpectedExpensesDesc totalKilometers bihKilometers diffKilometers firstCalculation secondCalculation returnTaxBih createdAt user modifiedAt").then((invoices)=>{
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
	function (req,res) {

		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;

		Invoice.find({ "invoiceNumber" : { "$regex": searchTerm + ".*", "$options": "i"}}).count((err, count) => {
			res.count = count;
			try {
				Invoice.find({"invoiceNumber" : { "$regex": searchTerm + ".*", "$options": "i"}}).sort({createdAt:-1}).skip(searchSkip).limit(searchLimit).then((invoices)=>{
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
			Invoice.findOne({_id: req.params.id},"_id invoicePublicId invoiceNumber invoiceDateStart invoiceDateReturn invoiceVehicle invoiceDrivers invoiceExpCro invoiceExpSlo invoiceExpAus invoiceExpGer invoiceTotalBill invoiceInitialExpenses invoiceInitialExpensesDesc invoiceUnexpectedExpenses invoiceUnexpectedExpensesDesc totalKilometers bihKilometers diffKilometers firstCalculation secondCalculation returnTaxBih createdAt user modifiedAt").then((invoice)=>{
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
	body("invoiceDateStart", "invoiceDateStart must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceDateReturn", "invoiceDateReturn must not be empty.").isLength({ min: 1 }).trim(),
	body("invoiceVehicle", "invoiceVehicle must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var invoice = new Invoice({
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
			var invoice = new Invoice({
				invoiceExpCro: req.body.invoiceExpCro,
				invoiceExpSlo: req.body.invoiceExpSlo,
				invoiceExpAus: req.body.invoiceExpAus,
				invoiceExpGer: req.body.invoiceExpGer,
				invoiceInitialExpenses: req.body.invoiceInitialExpenses,
				invoiceInitialExpensesDesc: req.body.invoiceInitialExpensesDesc,
				invoiceUnexpectedExpenses: req.body.invoiceUnexpectedExpenses,
				invoiceUnexpectedExpensesDesc: req.body.invoiceUnexpectedExpensesDesc,
				invoiceTotalBill: req.body.invoiceTotalBill,
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
			var invoice = new Invoice({
				totalKilometers: req.body.totalKilometers,
				bihKilometers: req.body.bihKilometers,
				diffKilometers: req.body.diffKilometers,
				firstCalculation: req.body.firstCalculation,
				secondCalculation: req.body.secondCalculation,
				returnTaxBih: req.body.returnTaxBih,
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
