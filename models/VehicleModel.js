var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var VehicleSchema = new Schema({
	plateNumber: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Vehicle", VehicleSchema);