const Relation = require("../models/RelationModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");
const {getModel} = require("../helpers/dbManager");

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
		const RelationModel = await getModel(req, "Relation");
		const searchTerm = req.body.searchTerm;
		const searchLimit = req.body.searchLimit;
		const searchSkip = req.body.searchSkip;
		const sortBy = req.body.sortBy;
		const sortOrder = req.body.sortOrder;

		res.count = await RelationModel.count({ "name" : { "$regex": searchTerm + ".*", "$options": "i"}});
		try {
			await RelationModel.find(
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
	async function (req, res) {
		try {
			const RelationModel = await getModel(req, "Relation");
			await RelationModel.find().then((relations)=> {
				if(relations.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", relations);
				}else {
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
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.ErrorResponse(res, "Not valid id");
		}
		try {
			const RelationModel = await getModel(req, "Relation");
			await RelationModel.findOne({_id: req.params.id},"_id name createdAt").then((relation)=>{
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
	async (req, res) => {
		try {
			const RelationModel = await getModel(req, "Relation");
			const errors = validationResult(req);
			const relation = new RelationModel({name: req.body.name});

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
			const RelationModel = await getModel(req, "Relation");
			const errors = validationResult(req);
			const relation = new RelationModel(
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
					const foundRelation = await RelationModel.findById(req.params.id);
					if(foundRelation) {
						await RelationModel.findByIdAndUpdate(req.params.id, relation, {new: true}).then(updatedRelation =>
							apiResponse.successResponseWithData(res,"Relation update Success.", updatedRelation)
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
			const RelationModel = await getModel(req, "Relation");
			const foundRelation = await RelationModel.findById(req.params.id);
			if(foundRelation) {
				await RelationModel.findByIdAndRemove(req.params.id).then(() =>
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
