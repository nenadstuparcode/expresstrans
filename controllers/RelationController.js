const Relation = require("../models/RelationModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");

// Relation Schema
function RelationData(data) {
	this._id = data._id;
	this.name = data.name;
}

/**
 * Relation Search.
 *
 * @returns {Object}
 */

exports.relationSearch = [
	function (req,res) {
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const sortBy = req.body.sortBy;
		const sortOrder = req.body.sortOrder;

		Relation.find({ "name" : { "$regex": searchTerm + ".*", "$options": "i"}}).countDocuments((err, count) => {
			res.count = count;
			try {
				Relation.find(
					{ "name" : { "$regex": searchTerm + ".*", "$options": "i"}}).sort({createdAt: sortOrder}).skip(searchSkip).limit(searchLimit).then((relations)=>{
					relations.length > 0 ?
						apiResponse.successResponseWithData(res, "Operation success", relations) :
						apiResponse.successResponseWithData(res, "Operation success", []);
				});
			} catch (err) {
				return apiResponse.ErrorResponse(res, err);
			}
		});
	}
];

/**
 * Relations List.
 *
 * @returns {Object}
 */
exports.relationsList = [
	function (req, res) {
		try {
			Relation.find().then((relations)=>{
				if(relations.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", relations);
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
 * Relation Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.relationDetail = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.ErrorResponse(res, "Not valid id");
		}
		try {
			Relation.findOne({_id: req.params.id},"_id name createdAt").then((relation)=>{
				if(relation !== null){
					let relationData = relation;
					return apiResponse.successResponseWithData(res, "Operation success", relationData);
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
 * Relation store.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.relationStore = [
	body("name", "name must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var relation = new Relation({name: req.body.name});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				relation.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let relationData = new RelationData(relation);
					return apiResponse.successResponseWithData(res,"Relation add Success.", relationData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Relation update.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.relationUpdate = [
	(req, res) => {
		try {
			const errors = validationResult(req);
			const relation = new Relation(
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
					Relation.findById(req.params.id, function (err, foundRealtion) {
						if(foundRealtion === null){
							return apiResponse.notFoundResponse(res,"Relatiom not exists with this id");
						}else{
							//update driver.
							Relation.findByIdAndUpdate(req.params.id, relation, {},function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								} else {
									const relationData = new RelationData(relation);
									return apiResponse.successResponseWithData(res,"Relation update Success.", relationData);
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
 * Relation Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.relationDelete = [
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Relation.findById(req.params.id, function (err, foundRelation) {
				if(foundRelation === null){
					return apiResponse.notFoundResponse(res,"Relation not exists with this id");
				}else{
					//delete relation.
					Relation.findByIdAndRemove(req.params.id,function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						}else{
							return apiResponse.successResponse(res,"Relation delete Success.");
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