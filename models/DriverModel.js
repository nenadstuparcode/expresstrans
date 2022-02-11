var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DriverSchema = new Schema({
	name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Driver", DriverSchema);
