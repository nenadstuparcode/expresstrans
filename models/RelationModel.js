const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const RelationSchema = new Schema({
	name: { type: String, required: true },
}, { timestamps: true });

// module.exports = mongoose.model("Relation", RelationSchema);
module.exports = RelationSchema;
