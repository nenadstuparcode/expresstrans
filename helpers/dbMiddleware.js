const { getDbConnection } = require("./dbManager");

async function dbMiddleware(req, res, next) {
	const dbId = req.headers["x-db-id"];
	if (!dbId) {
		return res.status(400).send("Missing X-Db-Id header");
	}

	try {
		// eslint-disable-next-line require-atomic-updates
		req.db = await getDbConnection(dbId);
		next();
	} catch (err) {
		console.error("DB connection error:", err);
		res.status(500).send("DB error");
	}
}

module.exports = dbMiddleware;
