var xlsx = require("node-xlsx");

const workSheetsFromFile = xlsx.parse(process.cwd() + "/public/rezervacije.xlsx");

console.log(workSheetsFromFile);