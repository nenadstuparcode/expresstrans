var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const Driver = new Schema({
	_id : false,
	name: String,
});

var InvoiceSchema = new Schema({
	invoiceNumber: { type: String },
	invoiceDateStart: { type: Date, required: true },
	invoiceDateReturn: { type: Date, required: true },
	invoiceVehicle: { type: String, required: true },
	invoiceDrivers: [Driver],
}, {timestamps: true});

module.exports = mongoose.model("Invoice", InvoiceSchema);
