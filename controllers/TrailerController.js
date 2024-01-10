const Trailer = require("../models/TrailerModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");

// Trailer Schema
function TrailerData(data) {
	this._id = data._id;
	this.name = data.name;
}

exports.trailerSearch = [
	function (req,res) {
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const sortBy = req.body.sortBy;
		const sortOrder = req.body.sortOrder;

		Trailer.find({ "name" : { "$regex": searchTerm + ".*", "$options": "i"}}).countDocuments((err, count) => {
			res.count = count;
			try {
				Trailer.find(
					{ "name" : { "$regex": searchTerm + ".*", "$options": "i"}}).sort({createdAt: sortOrder}).skip(searchSkip).limit(searchLimit).then((trailers)=>{
					trailers.length > 0 ?
						apiResponse.successResponseWithData(res, "Operation success", trailers) :
						apiResponse.successResponseWithData(res, "Operation success", []);
				});
			} catch (err) {
				return apiResponse.ErrorResponse(res, err);
			}
		});
	}
];

/**
 * Trailer List.
 *
 * @returns {Object}
 */
exports.trailerList = [
	function (req, res) {
		try {
			Trailer.find().then((trailers)=>{
				if(trailers.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", trailers);
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
 * Trailer Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.trailerDetail = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Trailer.findOne({_id: req.params.id}).then((trailer)=>{
				if(trailer !== null){
					let trailerData = trailer;
					return apiResponse.successResponseWithData(res, "Operation success", trailerData);
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
 * Trailer store.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.trailerStore = [
	body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			const trailer = new Trailer({name: req.body.name});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save trailer.
				trailer.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let trailerData = new TrailerData(trailer);
					return apiResponse.successResponseWithData(res,"Book add Success.", trailerData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Trailer update.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.trailerUpdate = [
	(req, res) => {
		try {
			const errors = validationResult(req);
			const trailer = new Trailer(
				{
					name: req.body.name,
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
					Trailer.findById(req.params.id, function (err, foundTrailer) {
						if(foundTrailer === null){
							return apiResponse.notFoundResponse(res,"Trailer not exists with this id");
						}else{
							//update trailer.
							Trailer.findByIdAndUpdate(req.params.id, trailer, {},function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								}else{
									let trailerData = new TrailerData(trailer);
									console.log(trailerData);
									return apiResponse.successResponseWithData(res,"Trailer update Success.", trailerData);
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
 * Trailer Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.trailerDelete = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Trailer.findById(req.params.id, function (err, foundTrailer) {
				if(foundTrailer === null){
					return apiResponse.notFoundResponse(res,"Trailer not exists with this id");
				}else{
					//delete trailer.
					Trailer.findByIdAndRemove(req.params.id,function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						}else{
							return apiResponse.successResponse(res,"Trailer delete Success.");
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