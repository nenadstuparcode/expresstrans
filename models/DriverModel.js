const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DriverSchema = new Schema({
	name: { type: String, required: true },
}, { timestamps: true });

// module.exports = mongoose.model("Driver", DriverSchema);
module.exports = DriverSchema;
