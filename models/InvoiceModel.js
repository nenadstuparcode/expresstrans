const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Relation = new Schema({
	name: String,
	priceKm: { type: Number, default: null},
	priceEur: { type: Number, default: null },
	priceKmTax: { type: Number, default: null},
	kilometers: { type: Number, default: null },
});
const InvoiceSchema = new Schema({
	invoiceNumber: { type: String },
	invoiceDateStart: { type: Date, required: true },
	invoiceDateReturn: { type: Date, required: true },
	invoiceVehicle: { type: String  },
	invoiceExpCro: { type: Number },
	invoiceExpSlo: { type: Number  },
	invoiceExpAus: { type: Number },
	invoiceExpGer: { type: Number },
	invoiceInitialExpenses: { type: Number },
	invoiceInitialExpensesDesc: { type: String },
	invoiceUnexpectedExpenses: { type: Number },
	invoiceUnexpectedExpensesDesc: { type: String },
	invoiceTotalBill: { type: Number },
	totalKilometers: { type: Number },
	bihKilometers: { type: Number },
	diffKilometers: { type: Number },
	firstCalculation: { type: Number },
	secondCalculation: { type: Number },
	returnTaxBih: { type: Number },
	invoiceDrivers: [String],
	invoicePublicId: { type: Number },
	invoiceType: { type: String, default: "bus"},
	invoiceRelations: [Relation],
	cmr: [String],
	deadline: { type: Number },
	priceKm: { type: Number },
	priceEuros: { type: Number },
	accountNumber: { type: String },
	invoiceTrailer: [String],
	payed: { type: Boolean, default: false },
	priceKmTax: { type: Number, default: null },
	clientId: { type: Schema.ObjectId, ref: "Client", default: null },
	invDriver: { type: Schema.ObjectId, ref: "Driver", default: null },
	invTrailer: { type: Schema.ObjectId, ref: "Trailer", default: null },
	active: { type: Boolean, default: true },
	paidInCurrency: { type: String, default: null },

}, {timestamps: true});

// module.exports = mongoose.model("Invoice", InvoiceSchema);
module.exports = InvoiceSchema;
