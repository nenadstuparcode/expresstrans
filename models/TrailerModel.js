const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TrailerSchema = new Schema({
	name: { type: String, required: true },
}, { timestamps: true });

// module.exports = mongoose.model("Trailer", TrailerSchema);
module.exports = TrailerSchema;
