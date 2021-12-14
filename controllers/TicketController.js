const Ticket = require("../models/TicketModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const mailer = require("../helpers/mailer");

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const {constants} = require("../helpers/constants");
mongoose.set("useFindAndModify", false);

// BusLine Schema
function TicketData(data) {
	this.id = data._id;
	this.ticketOnName = data.ticketOnName;
	this.ticketPhone = data.ticketPhone;
	this.ticketEmail = data.ticketEmail;
	this.ticketNote = data.ticketNote;
	this.ticketValid = data.ticketValid;
	this.ticketBusLineId = data.ticketBusLineId;
	this.ticketRoundTrip = data.ticketRoundTrip;
	this.ticketStartDate = data.ticketStartDate;
	this.createdAt = data.createdAt;
}


/**
 * BusLine List.
 *
 * @returns {Object}
 */
exports.ticketList = [
	auth,
	function (req, res) {
		try {
			Ticket.find({user: req.user._id},"_id ticketOnName ticketPhone ticketEmail ticketNote ticketValid ticketBusLineId ticketRoundTrip ticketStartDate createdAt modifiedAt").then((tickets)=>{
				if(tickets.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", tickets);
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

exports.ticketSearch = [
	auth,
	function (req,res) {
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;

		Ticket.count((err, count) => {
			res.count = count;
			try {


				Ticket.find(
					{ "ticketOnName" : { "$regex": searchTerm + ".*", "$options": "i"}},"_id ticketOnName ticketPhone ticketEmail ticketNote ticketValid ticketBusLineId ticketRoundTrip ticketStartDate createdAt modifiedAt").sort({createdAt:-1}).skip((+searchLimit - 10)).limit(searchLimit).then((tickets)=>{
					if(tickets.length > 0){
						return apiResponse.successResponseWithData(res, "Operation success", tickets);
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
 * BusLine Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.ticketDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Ticket.findOne({_id: req.params.id,user: req.user._id},"_id ticketOnName ticketPhone ticketEmail ticketNote ticketValid ticketBusLineId ticketRoundTrip ticketStartDate createdAt modifiedAt").then((ticket)=>{
				if(ticket !== null){
					let ticketData = new TicketData(ticket);
					return apiResponse.successResponseWithData(res, "Operation success", ticketData);
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
 * BusLine store.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.ticketStore = [
	auth,
	body("ticketOnName", "ticketOnName must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketPhone", "ticketPhone must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketEmail", "ticketEmail must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketValid", "lineCountryStart trip must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketBusLineId", "ticketBusLineId must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketRoundTrip", "ticketRoundTrip must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketStartDate", "ticketStartDate must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {

			const errors = validationResult(req);
			var ticket = new Ticket({
				ticketOnName: req.body.ticketOnName,
				ticketPhone: req.body.ticketPhone,
				ticketEmail: req.body.ticketEmail,
				ticketNote: req.body.ticketNote,
				ticketValid: req.body.ticketValid,
				ticketBusLineId: req.body.ticketBusLineId,
				ticketRoundTrip: req.body.ticketRoundTrip,
				ticketStartDate: req.body.ticketStartDate,
				user: req.user,
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				//Save Bus Line.
				ticket.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let ticketData = new TicketData(ticket);
					return apiResponse.successResponseWithData(res,"BusLine add Success.", ticketData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * BusLine update.
 *
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 *
 * @returns {Object}
 */
exports.ticketUpdate = [
	auth,
	body("ticketOnName", "ticketOnName must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketPhone", "ticketPhone must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketEmail", "ticketEmail must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketValid", "lineCountryStart trip must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketBusLineId", "ticketBusLineId must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketRoundTrip", "ticketRoundTrip must not be empty.").isLength({ min: 1 }).trim(),
	body("ticketStartDate", "ticketStartDate must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);

			var ticket = new Ticket({
				ticketOnName: req.body.ticketOnName,
				ticketPhone: req.body.ticketPhone,
				ticketEmail: req.body.ticketEmail,
				ticketNote: req.body.ticketNote,
				ticketValid: req.body.ticketValid,
				ticketBusLineId: req.body.ticketBusLineId,
				ticketRoundTrip: req.body.ticketRoundTrip,
				ticketStartDate: req.body.ticketStartDate,
				_id:req.params.id
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Ticket.findById(req.params.id, function (err, foundTicket) {
						if(foundTicket === null){
							return apiResponse.notFoundResponse(res,"BusLine not exists with this id");
						}else{
							//Check authorized user
							if(foundTicket.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update BusLine.
								Ticket.findByIdAndUpdate(req.params.id, ticket, {},function (err) {
									if (err) {
										return apiResponse.ErrorResponse(res, err);
									}else{
										let ticketData = new TicketData(ticket);
										return apiResponse.successResponseWithData(res,"BusLine update Success.", ticketData);
									}
								});
							}
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
 * BusLine Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.ticketDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Ticket.findById(req.params.id, function (err, foundTicket) {
				if(foundTicket === null){
					return apiResponse.notFoundResponse(res,"BusLine not exists with this id");
				}else{
					//Check authorized user
					if(foundTicket.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete BusLine.
						Ticket.findByIdAndRemove(req.params.id,function (err) {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							}else{
								return apiResponse.successResponseWithData(res,"BusLine delete Success.");
							}
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
 * BusLine Print.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */

exports.ticketPrint = [
	auth,
	async function (req,res) {
		try {
			var dataBinding = {
				isWatermark: true,
				ticketData : {
					ticketOnName: req.body.ticketOnName,
					ticketPhone: req.body.ticketPhone,
					ticketEmail: req.body.ticketEmail,
					ticketNote: req.body.ticketNote,
					ticketValid: req.body.ticketValid,
					ticketBusLineId: req.body.ticketBusLineId,
					ticketRoundTrip: req.body.ticketRoundTrip,
					ticketStartDate: req.body.ticketStartDate,
					busLineData: req.body.busLineData,
				},
			};

			var templateHtml = fs.readFileSync(path.join(process.cwd(), "karta.html"), "utf8");
			var template = handlebars.compile(templateHtml);
			var finalHtml = encodeURIComponent(template(dataBinding));
			var options = {
				format: "A4",
				headerTemplate: "<p></p>",
				footerTemplate: "<p></p>",
				displayHeaderFooter: false,
				margin: {
					top: "10px",
					bottom: "10px"
				},
				printBackground: true,
				path: "karte/generisani_2.pdf"
			};

			const browser = await puppeteer.launch({
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			});
			const page = await browser.newPage();
			await page.setContent(finalHtml);
			await page.setViewport({ width: 1366, height: 768});
			await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
				waitUntil: "networkidle0"
			});
			const pdfBuffer = await page.pdf(options);

			await page.close();
			await browser.close();

			res.setHeader("Content-Length",pdfBuffer.length);
			res.setHeader("Content-type", "application/pdf");
			res.setHeader("Content-Disposition", "attachment; filename=karta.pdf");

			res.end(pdfBuffer);
		} catch (err) {
			console.log("ERROR:", err);
		}
	}
];


exports.sendToMail = [
	auth,
	async function (req, res) {
		try {
			var dataBinding = {
				isWatermark: true,
				ticketData : {
					ticketOnName: req.body.ticketOnName,
					ticketPhone: req.body.ticketPhone,
					ticketEmail: req.body.ticketEmail,
					ticketNote: req.body.ticketNote,
					ticketValid: req.body.ticketValid,
					ticketBusLineId: req.body.ticketBusLineId,
					ticketRoundTrip: req.body.ticketRoundTrip,
					ticketStartDate: req.body.ticketStartDate,
					busLineData: req.body.busLineData,
				},
			};

			var templateHtml = fs.readFileSync(path.join(process.cwd(), "karta.html"), "utf8");
			var template = handlebars.compile(templateHtml);
			var finalHtml = encodeURIComponent(template(dataBinding));
			var options = {
				format: "A4",
				headerTemplate: "<p></p>",
				footerTemplate: "<p></p>",
				displayHeaderFooter: false,
				margin: {
					top: "10px",
					bottom: "10px"
				},
				printBackground: true,
				path: "karte/generisani_2.pdf"
			};

			const browser = await puppeteer.launch({
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			});
			const page = await browser.newPage();
			await page.setContent(finalHtml);
			await page.setViewport({ width: 1366, height: 768});
			await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
				waitUntil: "networkidle0"
			});
			const pdfBuffer = await page.pdf(options);

			await page.close();
			await browser.close();

			let html = "<p>Vašu kartu može preuzeti u priloženim datotekama na dnu email-a.</p><p> Ugodno putovanje želi vam Express Trans</p>";

			await mailer.send(
				constants.confirmEmails.from,
				dataBinding.ticketData.ticketEmail,
				`Rezervisano - Express Trans autobuska karta na ime ${dataBinding.ticketData.ticketOnName}`,
				html,
				`karta-${dataBinding.ticketData.ticketOnName}.pdf`,
				pdfBuffer
			);

			return apiResponse.successResponseWithData(res,"Karta je poslana na korisnikom email.", true);



		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
