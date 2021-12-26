var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CounterSchema = new Schema({
	count: {type: Number, required: true},
	name: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Counter", CounterSchema);
