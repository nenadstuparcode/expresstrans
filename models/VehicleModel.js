const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const VehicleSchema = new Schema({
	plateNumber: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Vehicle", VehicleSchema);