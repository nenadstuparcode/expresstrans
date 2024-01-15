const Busline = require("../models/BusLineModel");
const { body,validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
// mongoose.set("useFindAndModify", false);

// BusLine Schema
function BusLineData(data) {
	this.id = data._id;
	this.lineCityStart = data.lineCityStart;
	this.lineCityEnd = data.lineCityEnd;
	this.linePriceOneWay = data.linePriceOneWay;
	this.linePriceRoundTrip = data.linePriceRoundTrip;
	this.createdAt = data.createdAt;
	this.lineCountryStart = data.lineCountryStart;
	this.lineArray = data.lineArray;
	this.bihKilometers = data.bihKilometers;
	this.deKilometers = data.deKilometers;
}


/**
 * BusLine List.
 *
 * @returns {Object}
 */
exports.busLineList = [
	function (req, res) {
		try {
			Busline.find({},"_id lineCityStart lineCityEnd linePriceOneWay linePriceOneWay linePriceRoundTrip lineCountryStart lineArray createdAt bihKilometers deKilometers modifiedAt").then((busLines)=>{
				if(busLines.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", busLines);
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

exports.busLineSearch = [
	async function (req,res) {
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;

		res.count = await Busline.count({
			$or: [
				{ "lineCityStart" : { "$regex": searchTerm + ".*", "$options": "i"}},
				{ "lineCityEnd" : { "$regex": searchTerm + ".*", "$options": "i"}},
			]
		});
		try {
			Busline.find({
				$or: [
					{ "lineCityStart" : { "$regex": searchTerm + ".*", "$options": "i"}},
					{ "lineCityEnd" : { "$regex": searchTerm + ".*", "$options": "i"}},
				]
			},"_id lineCityStart lineCityEnd linePriceOneWay linePriceOneWay linePriceRoundTrip lineCountryStart bihKilometers deKilometers createdAt modifiedAt lineArray").sort({createdAt:-1}).skip(searchSkip).limit(searchLimit).then((busLines)=>{
				if(busLines.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", busLines);
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
 * BusLine Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.busLineDetail = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Busline.findOne({_id: req.params.id},"_id lineCityStart lineCityEnd linePriceOneWay linePriceOneWay linePriceRoundTrip lineCountryStart bihKilometers deKilometers lineArray createdAt modifiedAt").then((busLine)=>{
				if(busLine !== null){
					let busLineData = new BusLineData(busLine);
					return apiResponse.successResponseWithData(res, "Operation success", busLineData);
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
exports.busLineStore = [
	body("lineCityStart", "Line city start must not be empty.").isLength({ min: 1 }).trim(),
	body("lineCityEnd", "Line city end must not be empty.").isLength({ min: 1 }).trim(),
	body("linePriceOneWay", "Line price one way end must not be empty.").isLength({ min: 1 }).trim(),
	body("linePriceRoundTrip", "Line price round trip must not be empty.").isLength({ min: 1 }).trim(),
	body("lineCountryStart", "lineCountryStart trip must not be empty.").isLength({ min: 1 }).trim(),
	body("lineArray", "Line array must not be empty").isLength({min: 1}),
	body("bihKilometers", "Line array must not be empty").isLength({min: 1}),
	body("deKilometers", "Line array must not be empty").isLength({min: 1}),
	// sanitizeBody("*").escape(),
	(req, res) => {
		try {

			const errors = validationResult(req);

			var busLine = new Busline({
				lineCityStart: req.body.lineCityStart,
				lineCityEnd: req.body.lineCityEnd,
				linePriceOneWay: req.body.linePriceOneWay,
				linePriceRoundTrip: req.body.linePriceRoundTrip,
				lineCountryStart: req.body.lineCountryStart,
				lineArray: [...req.body.lineArray],
				bihKilometers: req.body.bihKilometers,
				deKilometers: req.body.deKilometers,
			});



			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			} else {
				//Save Bus Line.
				busLine.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let busLineData = new BusLineData(busLine);
					return apiResponse.successResponseWithData(res,"BusLine add Success.", busLineData);
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
exports.busLineUpdate = [
	body("lineCityStart", "Line city start must not be empty.").isLength({ min: 1 }).trim(),
	body("lineCityEnd", "Line city end must not be empty.").isLength({ min: 1 }).trim(),
	body("linePriceOneWay", "Line city end must not be empty.").isLength({ min: 1 }).trim(),
	body("lineCityEnd", "Line price one way must not be empty.").isLength({ min: 1 }).trim(),
	body("linePriceRoundTrip", "Line price round trip must not be empty.").isLength({ min: 1 }).trim(),
	body("lineCountryStart", "lineCountryStart trip must not be empty.").isLength({ min: 1 }).trim(),
	body("lineArray", "Line array must not be empty").isLength({min: 1}),
	body("bihKilometers", "Line array must not be empty").isLength({min: 1}),
	body("deKilometers", "Line array must not be empty").isLength({min: 1}),
	// sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var busLine = new Busline({
				lineCityStart: req.body.lineCityStart,
				lineCityEnd: req.body.lineCityEnd,
				linePriceOneWay: req.body.linePriceOneWay,
				linePriceRoundTrip: req.body.linePriceRoundTrip,
				lineCountryStart: req.body.lineCountryStart,
				lineArray: [...req.body.lineArray],
				bihKilometers: req.body.bihKilometers,
				deKilometers: req.body.deKilometers,
				_id:req.params.id
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Busline.findById(req.params.id, function (err, foundBusLine) {
						if(foundBusLine === null){
							return apiResponse.notFoundResponse(res,"BusLine not exists with this id");
						}else{
							//update BusLine.
							Busline.findByIdAndUpdate(req.params.id, busLine, {},function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								}else{
									let busLineData = new BusLineData(busLine);
									return apiResponse.successResponseWithData(res,"BusLine update Success.", busLineData);
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
 * BusLine Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.busLineDelete = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Busline.findById(req.params.id, function (err, foundBusLine) {
				if(foundBusLine === null){
					return apiResponse.notFoundResponse(res,"BusLine not exists with this id");
				}else{
					//delete BusLine.
					Busline.findByIdAndRemove(req.params.id,function (err) {
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
