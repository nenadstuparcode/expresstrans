const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const LineDay = new Schema({
	_id : false,
	day: Number,
	time: String,
});

const BusLineSchema = new Schema({
	lineCityStart: { type: String, required: true },
	lineCityEnd: { type: String, required: true },
	linePriceOneWay: { type: Number, required: true },
	linePriceRoundTrip: { type: Number, required: true },
	lineCountryStart: { type: String, required: true },
	bihKilometers: { type: Number},
	deKilometers: { type: Number},
	lineArray: [LineDay],
}, { timestamps: true });

module.exports = mongoose.model("Busline", BusLineSchema);
