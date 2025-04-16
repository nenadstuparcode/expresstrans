const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CounterSchema = new Schema({
	count: {type: Number, required: true},
	name: {type: String, required: true},
}, {timestamps: true});

// module.exports = mongoose.model("Counter", CounterSchema);
module.exports = CounterSchema;
