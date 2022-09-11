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
const btnStart = document.getElementById("btnstart");
const chkAll = document.getElementById("chkAll");
const chkSimulate = document.getElementById("simulate");
let filePath = "";
let files = [];


window.api.Titel.then(t => document.querySelector("h2").innerText = t);


btnOpenFolder.addEventListener("click", async () => {
	filePath = await window.api.openPath();
	if (filePath) {
		result.value = filePath;
		for (let i = table.rows.length - 1; i >= 0; i--) {
			table.deleteRow(i);
		}
		files = await window.api.readFiles(filePath);
		files = files.map(x => x.toLowerCase()).sort();
		chkAll.disabled = files.length < 2;
		if (files && files.length > 0) {
			files.forEach((file, i) => {
				let row = table.insertRow(i);
				let cell1 = row.insertCell(0);
				cell1.innerHTML = `
					<label for="${i}">
						<input type="checkbox" id="${i}" data-filename="${file}">
					</label>`;
				let cell2 = row.insertCell(1);
				cell2.innerHTML = `<span data-oldname="${file}">${file}</span>`;
			});
			btnStart.disabled = false;
		} else {
			btnStart.disabled = true;
			table.insertRow(0).insertCell(0).innerText = "..";
		}

	}
});


btnStart.addEventListener("click", async () => {
	const nodes = Array.from(document.querySelectorAll("#filelist input[type=checkbox]:checked")).map(x => x.dataset.filename);
	if (nodes.length > 0) {
		const renamedFiles = await window.api.start({
			path: filePath,
			filenames: nodes,
			simulate: chkSimulate.checked
		});
		renamedFiles.forEach(x => document.querySelector(`#filelist span[data-oldname='${x.old}']`).innerText = x.new);
		document.querySelectorAll("#filelist input[type=checkbox]").forEach(x => x.checked = false);
		chkAll.checked = false;
	}
});


chkAll.addEventListener("change", () =>
	document.querySelectorAll("#filelist input[type=checkbox]").forEach(x => x.checked = chkAll.checked)
);
