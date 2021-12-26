var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const LineDay = new Schema({
	_id : false,
	day: Number,
	time: String,
});

var BusLineSchema = new Schema({
	lineCityStart: { type: String, required: true },
	lineCityEnd: { type: String, required: true },
	linePriceOneWay: { type: Number, required: true },
	linePriceRoundTrip: { type: Number, required: true },
	lineCountryStart: { type: String, required: true },
	lineArray: [LineDay],
	user: { type: Schema.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Busline", BusLineSchema);
