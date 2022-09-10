// This file is required by the index.html file and will be executed in the renderer process for that window.
// No Node.js APIs are available in this process because `nodeIntegration` is turned off.
// Use `preload.js` to selectively enable features needed in the rendering process.

/**********
THE RENDERER PROCESS
can't access the Node.js APIs directly
can access the  HTML Document Object Model (DOM)
**********/

const result = document.getElementById("result");
const table = document.getElementById("filelist");
const btnOpenFolder = document.getElementById("btnopenfolder");
const btnReadFiles = document.getElementById("btnreadfiles");
const btnStart = document.getElementById("btnstart");
let filePath = "";


window.api.Titel.then(t => document.querySelector("h2").innerText = t);

btnOpenFolder.addEventListener("click", async () => {
	filePath = await window.api.openPath();
	if (filePath) {
		result.value = filePath;
		btnReadFiles.disabled = false;
	}
});


btnReadFiles.addEventListener("click", async () => {
	if (filePath) {
		let files = await window.api.readFiles(filePath);
		files = files.map(x => x.toLowerCase()).sort();
		for (let i = table.rows.length - 1; i >= 0; i--) {
			table.deleteRow(i);
		}
		if (files && files.length > 0) {
			files.forEach((file, i) => {
				let row = table.insertRow(i);
				let cell1 = row.insertCell(0);
				cell1.innerHTML = `
					<label for="${i}">
						<input type="checkbox" id="${i}">
					</label>`;
				let cell2 = row.insertCell(1);
				cell2.innerText = file;
			});
			btnStart.disabled = false;
		} else {
			btnStart.disabled = true;
		}
	} else {
		result.value = "-- no path --";
	}
});