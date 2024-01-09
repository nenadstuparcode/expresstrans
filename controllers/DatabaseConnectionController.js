const {connectToDatabase} = require("../helpers/connectMongoDB");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");


exports.dbList = async function (req, res) {
	try {
		const data = await mongoose.connection.db.admin().command({
			listDatabases: 1,
		});

		if(data.databases) {
			return apiResponse.successResponseWithData(res, "Operation success", data.databases || []);
		} else {
			apiResponse.ErrorResponse(res, "Database not found");
		}
	} catch (e) {
		apiResponse.ErrorResponse(res, "Database not found");
	}
};

exports.dbCurrent = [
	async function (req, res) {
		const currentDbConection = await mongoose.connection;
		const lastConnected = new Date(new Date().toUTCString());
		if (currentDbConection.name) {
			return apiResponse.successResponseWithData(res, "Operation Success", {
				name: currentDbConection.name,
				connectionTime: lastConnected,
			});
		}
		else {
			return apiResponse.ErrorResponse(res, "No selected Db");
		}
	}
];


exports.dbConnect = [
	async function (req, res) {
		mongoose.disconnect();
		connectToDatabase();
		const dbName = req.params.name;
		const data = await mongoose.connection.db.admin().command({
			listDatabases: 1,
		});
		const dbExists = data.databases.some(db => db.name === dbName);

		if(dbExists) {
			return dbName && connectToDatabase(dbName) ?
				apiResponse.successResponseWithData(res, `Database changed to ${dbName}`, {
					dbName: dbName,
					connectionTime: new Date(new Date().toUTCString()),
				}) :
				apiResponse.ErrorResponse(res, "Database not found");
		} else {
			apiResponse.ErrorResponse(res, "Database not exist");
		}
	}
];