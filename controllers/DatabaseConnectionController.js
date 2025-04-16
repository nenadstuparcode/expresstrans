const { connectToDatabase } = require("../helpers/connectMongoDB");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");

exports.dbList = async (req, res) => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		const data = await conn.connection.db.admin().command({
			listDatabases: 1,
		});

		if (data.databases) {
			return apiResponse.successResponseWithData(
				res,
				"Operation success",
				data.databases || []
			);
		} else {
			apiResponse.ErrorResponse(res, "Database not found");
		}
	} catch (err) {
		apiResponse.ErrorResponse(res, err);
	}
};

exports.dbCurrent = [
	async (req, res) => {
		const conn = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		const currentDbConection = await conn.connection;
		const lastConnected = new Date(new Date().toUTCString());
		if (currentDbConection.name) {
			return apiResponse.successResponseWithData(res, "Operation Success", {
				name: currentDbConection.name,
				connectionTime: lastConnected,
			});
		} else {
			return apiResponse.ErrorResponse(res, "No selected Db");
		}
	},
];

exports.dbUse = [
	async (req, res) => {
		const name = req.params.name;
		await req.db.connection.useDb(name, {useCache: false});
		const connectionData = mongoose.connection.name;
        
		return apiResponse.successResponseWithData(res, `Database changed to ${name}`, connectionData);
	}
];

exports.dbConnect = [
	async (req, res) => {
		const data = await req.db.admin().command({
			listDatabases: 1,
		});

		await mongoose.disconnect();
		const dbName = req.params.name;

		const dbExists = data.databases.some((db) => db.name === dbName);

		if (dbExists) {
			connectToDatabase(dbName);
			return dbName
				? apiResponse.successResponseWithData(
					res,
					`Database changed to ${dbName}`,
					{
						dbName: dbName,
						connectionTime: new Date(new Date().toUTCString()),
					}
				)
				: apiResponse.ErrorResponse(res, "Database not found");
		} else {
			apiResponse.ErrorResponse(res, "Database not exist");
		}
	},
];
