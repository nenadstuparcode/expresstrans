const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TicketSchema = new Schema({
	ticketOnName: {type: String, required: true},
	ticketPhone: {type: String},
	ticketEmail: {type: String},
	ticketNote: {type: String},
	ticketValid: {type: Number, required: true},
	ticketBusLineId: {type: Schema.ObjectId, ref: "BusLine", required: true},
	ticketRoundTrip: {type: Boolean, required: true},
	ticketStartDate: {type: Date, required: true},
	ticketStartTime: {type: Date, required: true},
	ticketInvoiceNumber: {type: Number},
	ticketType: {type: String, required: true},
	ticketClassicId: { type: String },
	ticketId: { type: String },
	ticketQR: { type: String },
	ticketPrice: { type: Number },
	ticketDiscount: { type: Number, default: 0 },
	ticketDisabled: { type: Boolean, default: false },
	ticketInvoicePublicId: { type: Number, default: 0 },
}, {timestamps: true});

// module.exports = mongoose.model("Ticket", TicketSchema);
module.exports = TicketSchema;
