var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BusLineSchema = new Schema({
	lineCityStart: { type: String, required: true },
	lineCityEnd: { type: String, required: true },
	linePriceOneWay: { type: Number, required: true },
	linePriceRoundTrip: { type: Number, required: true },
	lineCountryStart: { type: String, required: true },
	lineStartDay1: { type: Number, required: true },
	lineStartDay2: { type: Number, required: true },
	lineStartTime: { type: String, required: true },
	user: { type: Schema.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Busline", BusLineSchema);
