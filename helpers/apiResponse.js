exports.successResponse = function (res, msg) {
	const data = {
		status: 1,
		message: msg
	};
	return res.status(200).json(data);
};

exports.successResponseWithData = function (res, msg, data) {
	const resData = {
		status: 1,
		message: msg,
		data: data,
		count: res.count,
	};
	return res.status(200).json(resData);
};

exports.successResponseWithMetaData = function (res, msg, data) {
	const resData = {
		status: 1,
		message: msg,
		data: [data.data],
		meta: [data.meta],
	};

	const response = { ...resData, ...data};
	return res.status(200).json(response);
};

exports.successResponseWithMetaDataEmpty = function (res,msg) {
	const resData = {
		status: 1,
		message: msg,
		data: [],
		meta: {
			count: 0,
		},
	};

	return res.status(200).json(resData);
};

exports.successResponseWithPdf = function (res,msg, data) {
	const resData = {
		status: 1,
		message: msg,
		data: data,
		count: res.count,
	};

	return res.status(200).json(resData);
};

exports.ErrorResponse = function (res, msg) {
	const data = {
		status: 0,
		message: msg,
	};
	return res.status(500).json(data);
};

exports.notFoundResponse = function (res, msg) {
	const data = {
		status: 0,
		message: msg,
	};
	return res.status(404).json(data);
};

exports.validationErrorWithData = function (res, msg, data) {
	const resData = {
		status: 0,
		message: msg,
		data: data
	};
	return res.status(400).json(resData);
};

exports.unauthorizedResponse = function (res, msg) {
	const data = {
		status: 0,
		message: msg,
	};
	return res.status(401).json(data);
};
