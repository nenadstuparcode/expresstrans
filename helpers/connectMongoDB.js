const mongoose = require("mongoose");
const MONGODB_URL = process.env.NODE_ENV == "prod" ? process.env.MONGODB_URL_PROD : process.env.MONGODB_URL_DEV;
let currentConnection;

exports.connectToDatabase = function() {
	mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, keepAlive: true }).then(() => {
		//don't show the log when it is test
		if(process.env.NODE_ENV !== "test") {
			console.log(`Connected to ${process.env.NODE_ENV}  %s`, MONGODB_URL);
			console.log("App is running ... \n");
			console.log("Press CTRL + C to stop the process. \n");
		}
	}).catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});

	currentConnection = mongoose.connection;
};

exports.connection = currentConnection;