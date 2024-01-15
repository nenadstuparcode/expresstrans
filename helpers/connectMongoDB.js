const mongoose = require("mongoose");
const MONGODB_URL = process.env.NODE_ENV == "prod" ? process.env.MONGODB_URL_PROD : process.env.MONGODB_URL_DEV;
const DB_CONNECTION = process.env.MONGODB_CONNECTION_STRING;
let dbConnection;



function createConnectionString(name) {
	return MONGODB_URL.replace("{{dbNameGoesHere}}", name);
}

exports.createConnString = (name) => {
	return MONGODB_URL.replace("{{dbNameGoesHere}}", name);
};

exports.connectToDatabase = function(dbName) {
	if(dbName === undefined) {
		dbName = `etrans${new Date().getFullYear()}`;
	}

	let connString = createConnectionString(dbName);

	return mongoose.connect(connString, { useNewUrlParser: true, useUnifiedTopology: true, keepAlive: true }).then((conn) => {
		//don't show the log when it is test

		if(process.env.NODE_ENV !== "test") {
			console.log(`Connected to ${process.env.NODE_ENV}  %s`, connString);
			console.log("App is running ... \n");
			console.log("Press CTRL + C to stop the process. \n");
		}



		return true;
	}).catch(err => {
		console.error("App starting error:", err.message);

		process.exit(1);
		return false;
	});


};
exports.connection = dbConnection;