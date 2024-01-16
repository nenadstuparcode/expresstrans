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
	async function (req,res) {
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const sortBy = req.body.sortBy;
		const sortOrder = req.body.sortOrder;

		res.count = await Relation.count({ "name" : { "$regex": searchTerm + ".*", "$options": "i"}});
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
			const relation = new Relation({name: req.body.name});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				relation.save().then(relation => {
					let relationData = new RelationData(relation);
					return apiResponse.successResponseWithData(res,"Relation add Success.", relationData);
				}).catch(err => apiResponse.ErrorResponse(res,err));
			}
		} catch (err) {
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
	async (req, res) => {
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
					const foundRelation = await Relation.findById(req.params.id);
					if(foundRelation) {
						Relation.findByIdAndUpdate(req.params.id, relation, {}).then(relation =>
							apiResponse.successResponseWithData(res,"Relation update Success.", new RelationData(relation))
						).catch(err => apiResponse.ErrorResponse(res, err));
					} else {
						return apiResponse.notFoundResponse(res, "Relation not found");
					}
				}
			}
		} catch (err) {
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
	async (req, res) => {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			const foundRelation = await Relation.findById(req.params.id);
			if(foundRelation) {
				Relation.findByIdAndRemove(req.params.id).then(() =>
					apiResponse.successResponse(res, "Relation delete success")
				).catch(err => apiResponse.ErrorResponse(res, err));
			} else {
				return apiResponse.notFoundResponse(res, "Relation not found");
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];