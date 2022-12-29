const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ClientSchema = new Schema({
	name: {type: String, required: true},
	info: {type: String},
	address: {type: String},
	zip: {type: Number},
	city: {type: String},
	country: { type: String },
	pib: {type: String},
	phone: {type: String},
	contact: {type: String},
}, {timestamps: true});

module.exports = mongoose.model("Client", ClientSchema);

