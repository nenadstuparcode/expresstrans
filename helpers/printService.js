const puppeteer = require("puppeteer");
exports.pdfPrintConfig = {
	format: "A4",
	headerTemplate: "<p></p>",
	footerTemplate: "<p></p>",
	displayHeaderFooter: false,
	margin: {
		top: "0px",
		bottom: "0px"
	},
	printBackground: true,
};

exports.pdfPrintConfig2 = {
	format: "A4",
	headerTemplate: "<p></p>",
	footerTemplate: "<p></p>",
	displayHeaderFooter: false,
	margin: {
		top: "0px",
		bottom: "0px"
	},
	printBackground: true,
};

exports.pdfGenerateBuffer = async (finalHtml, options) => {
	let pdfBuffer;
    
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--use-gl=egl"],
	});
	const page = await browser.newPage();
	await page.setContent(finalHtml);
	await page.setViewport({ width: 1000, height: 420});
	await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
		waitUntil: "networkidle0"
	});
    
	pdfBuffer = await page.pdf(options);
	await page.close();
	await browser.close();
    
	return pdfBuffer;
};

exports.pdfGenerateBuffer2 = async (finalHtml, options) => {
	let pdfBuffer;

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--use-gl=egl"],
	});
	const page = await browser.newPage();
	await page.setViewport({ width: 1000, height: 420});
	await page.setContent(finalHtml);
	await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
		waitUntil: "networkidle0"
	});

	pdfBuffer = await page.pdf(options);
	await page.close();
	await browser.close();

	return pdfBuffer;
};