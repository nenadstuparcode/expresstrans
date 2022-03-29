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
	invoiceExpCro: { type: Number, required: true },
	invoiceExpSlo: { type: Number, required: true },
	invoiceExpAus: { type: Number, required: true },
	invoiceExpGer: { type: Number, required: true },
	invoiceInitialExpenses: { type: Number, required: true },
	invoiceInitialExpensesDesc: { type: String },
	invoiceUnexpectedExpenses: { type: Number, required: true },
	invoiceUnexpectedExpensesDesc: { type: String },
	invoiceTotalBill: { type: Number, required: true },
	totalKilometers: { type: Number, required: true },
	bihKilometers: { type: Number, required: true },
	diffKilometers: { type: Number, required: true },
	firstCalculation: { type: Number, required: true },
	secondCalculation: { type: Number, required: true },
	returnTaxBih: { type: Number, required: true },
	invoiceDrivers: [Driver],
}, {timestamps: true});

module.exports = mongoose.model("Invoice", InvoiceSchema);
