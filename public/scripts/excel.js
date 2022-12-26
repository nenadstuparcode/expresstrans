
let selectedFile;
document.getElementById("input").addEventListener("change", (event) => {
	selectedFile = event.target.files[0];
});
document.getElementById("date").addEventListener("change", (event) => {
	console.log(event.target.value);
	console.log(moment(event.target.value).format("YYYY-MM-DDTHH:mm:ss UTC"));
});

document.getElementById("button").addEventListener("click", () => {
	if(selectedFile){
		let fileReader = new FileReader();
		fileReader.readAsBinaryString(selectedFile);
		fileReader.onload = (event)=>{
			let data = event.target.result;
			let workbook = XLSX.read(data,{type:"binary"});

				let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[0]);
				console.log(rowObject);
				document.getElementById("jsondata").innerHTML = JSON.stringify(rowObject,undefined,4);
		};
	}
});