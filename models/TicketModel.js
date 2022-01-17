var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TicketSchema = new Schema({
	ticketOnName: {type: String, required: true},
	ticketPhone: {type: String, required: true},
	ticketEmail: {type: String, required: true},
	ticketNote: {type: String},
	ticketValid: {type: Number, required: true},
	ticketBusLineId: {type: Schema.ObjectId, ref: "BusLine", required: true},
	ticketRoundTrip: {type: Boolean, required: true},
	ticketStartDate: {type: Date, required: true},
	ticketStartTime: {type: Date, required: true},
	ticketId: { type: String },
	ticketQR: { type: String},
	user: { type: Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});

module.exports = mongoose.model("Ticket", TicketSchema);
