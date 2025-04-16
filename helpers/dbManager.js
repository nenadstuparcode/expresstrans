const mongoose = require("mongoose");
const VehicleSchema = require("../models/VehicleModel");
const BusLineSchema = require("../models/BusLineModel");
const CounterSchema = require("../models/CounterModel");
const RelationSchema = require("../models/RelationModel");
const TicketSchema = require("../models/TicketModel");
const TrailerSchema = require("../models/TrailerModel");
const InvoiceSchema = require("../models/InvoiceModel");
const DriverSchema = require("../models/DriverModel");
const MONGODB_URL = process.env.NODE_ENV == "prod" ? process.env.MONGODB_URL_PROD : process.env.MONGODB_URL_DEV;
const connections = new Map();

function createConnectionString(name) {
	return MONGODB_URL.replace("{{dbNameGoesHere}}", name);
}

async function getDbConnection(dbId) {
	if (connections.has(dbId)) {
		return connections.get(dbId);
	}

	const uri = createConnectionString(dbId); // each tenant gets its own DB
	const conn = await mongoose.createConnection(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		maxPoolSize: 1000000,
	});

	conn.model("Client", VehicleSchema);
	conn.model("Driver", DriverSchema);
	conn.model("Busline", BusLineSchema);
	conn.model("Invoice", InvoiceSchema);
	conn.model("Counter", CounterSchema);
	conn.model("Relation", RelationSchema);
	conn.model("Ticket", TicketSchema);
	conn.model("Trailer", TrailerSchema);
	conn.model("Vehicle", VehicleSchema);

	connections.set(dbId, conn);
	return conn;
}

function getModel(req, modelName) {
	if(!modelName) return;
	return req.db.model(modelName);
}

module.exports = { getDbConnection, getModel };
