const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: "nenadstupar8@gmail.com",
		pass: "Rockstar1993!!!"
	}
});

exports.send = function (from, to, subject, html, filename, fileContent)
{
	// send mail with defined transport object
	// visit https://nodemailer.com/ for more options
	return transporter.sendMail({
		from: from, // sender address e.g. no-reply@xyz.com or "Fred Foo 👻" <foo@example.com>
		to: to, // list of receivers e.g. bar@example.com, baz@example.com
		subject: subject, // Subject line e.g. 'Hello ✔'
		//text: text, // plain text body e.g. Hello world?
		html: html,
		attachments: [{
			filename: filename,
			content: fileContent
		}]// html body e.g. '<b>Hello world?</b>'
	});
};
