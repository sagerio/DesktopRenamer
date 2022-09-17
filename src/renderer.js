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
const btnRefresh = document.getElementById("btnrefresh");
const btnStart = document.getElementById("btnstart");
const chkAll = document.getElementById("chkAll");
const chkSimulate = document.getElementById("simulate");
const counter = document.getElementById("counter");
let filePath = "";
let files = [];


window.api.Titel.then(t => document.querySelector("h2").innerText = t);


// fired when a single checkbox or chAll is ticked/unticked
function checkStartButton() {
	const checkboxes = Array.from(document.querySelectorAll("#filelist input[type=checkbox]"));
	const enabled = checkboxes.some(x => x.checked === true);
	btnStart.disabled = !enabled;
	if (enabled) {
		btnStart.classList.remove("btn-outline-secondary");
		btnStart.classList.add("btn-success");
	} else {
		btnStart.classList.add("btn-outline-secondary");
		btnStart.classList.remove("btn-success");
	}
	if (checkboxes.every(x => x.checked === true)) {
		chkAll.checked = true;
	}
	if (checkboxes.every(x => x.checked === false)) {
		chkAll.checked = false;
	}
}


async function readFolder(filePath) {
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
				cell2.innerHTML = `<span data-filename="${file}">${file}</span>`;
			});
			btnRefresh.disabled = false;
			btnRefresh.classList.add("btn-outline-dark");
			btnRefresh.classList.remove("btn-outline-secondary");
			document.querySelectorAll("#filelist input[type=checkbox]").forEach(element =>
				element.addEventListener("click", () => checkStartButton())
			);
		} else {
			btnStart.disabled = true;
			table.insertRow(0).insertCell(0).innerText = "..";
		}
	}
}


btnRefresh.addEventListener("click", async () => readFolder(filePath));


btnOpenFolder.addEventListener("click", async () => {
	filePath = await window.api.openPath();
	readFolder(filePath);
});


btnStart.addEventListener("click", async () => {
	const nodes = Array.from(document.querySelectorAll("#filelist input[type=checkbox]:checked")).map(x => x.dataset.filename);
	if (nodes.length > 0) {
		const renamedFiles = await window.api.start({
			path: filePath,
			filenames: nodes,
			simulate: chkSimulate.checked
		});
		renamedFiles.forEach(x => {
			console.assert(document.querySelector(`#filelist input[type=checkbox][data-filename='${x.old}']`), "checkbox not found");
			console.assert(document.querySelector(`#filelist span[data-filename='${x.old}']`), "span not found");
			// attribute checkbox
			document.querySelector(`#filelist input[type=checkbox][data-filename='${x.old}']`).dataset.filename = x.new;
			// innerText span first
			document.querySelector(`#filelist span[data-filename='${x.old}']`).innerText = x.new;
			// attribute span
			document.querySelector(`#filelist span[data-filename='${x.old}']`).dataset.filename = x.new;
		});
		document.querySelectorAll("#filelist input[type=checkbox]").forEach(x => x.checked = false);
		chkAll.checked = false;
		btnStart.classList.add("btn-outline-secondary");
		btnStart.classList.remove("btn-success");
	}
});


chkAll.addEventListener("change", () => {
	document.querySelectorAll("#filelist input[type=checkbox]").forEach(x => x.checked = chkAll.checked);
	checkStartButton();
});


window.api.handleCounter((event, value) => {
	counter.innerText = value;
	event.sender.send('counter-value', value)
});
