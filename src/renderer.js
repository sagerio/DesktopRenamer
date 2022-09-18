// This file is required by the index.html file and will be executed in the renderer process for that window.
// No Node.js APIs are available in this process because `nodeIntegration` is turned off.
// Use `preload.js` to selectively enable features needed in the rendering process.

// THE RENDERER PROCESS
// can't access the Node.js APIs directly
// can access the  HTML Document Object Model (DOM)


const result = document.getElementById("result");
const table = document.getElementById("filelist");
const btnOpenFolder = document.getElementById("btnopenfolder");
const btnRefresh = document.getElementById("btnrefresh");
const btnStart = document.getElementById("btnstart");
const chkAll = document.getElementById("chkAll");
const chkSimulate = document.getElementById("simulate");
const chkMoveToFolder = document.getElementById("movetofolder");
const counter = document.getElementById("counter");
let filePath = "";
let files = [];


window.api.Titel.then(t => document.querySelector("h2").innerText = t);


// change checkbox also on span click
function change(e) {
	const el = document.querySelector(`input[type=checkbox][data-filename='${e.target.dataset.filename}']`);
	if (el) {
		el.checked = !el.checked;
	}
	checkStartButtonAndchkAll();
}


// fired when a single checkbox or chAll is ticked/unticked
function checkStartButtonAndchkAll() {
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
	chkAll.checked = checkboxes.every(x => x.checked === true);
}


async function readFolder(filePath) {
	if (filePath) {
		result.value = filePath;
		for (let i = table.rows.length - 1; i >= 0; i--) {
			table.deleteRow(i);
		}
		files = await window.api.readFiles(filePath);
		counter.innerText = files.length;
		files = files.map(x => x.toLowerCase()).sort();
		chkAll.disabled = files.length < 2;
		if (files && files.length > 0) {
			files.forEach((file, i) => {
				const row = table.insertRow(i);
				const cell1 = row.insertCell(0);
				cell1.innerHTML = `
					<label for="${i}">
						<input type="checkbox" id="${i}" data-filename="${file}">
					</label>`;
				const cell2 = row.insertCell(1);
				cell2.innerHTML = `<span data-filename="${file}">${file}</span>`;
			});
			document.querySelectorAll("#filelist span").forEach(e =>{
				e.addEventListener("click", change);
			});
			document.querySelectorAll("#filelist input[type=checkbox]").forEach(element =>
				element.addEventListener("click", () => checkStartButtonAndchkAll())
			);
		} else {
			table.insertRow(0).insertCell(0).innerText = "..";
		}
		btnRefresh.disabled = false;
		btnRefresh.classList.add("btn-outline-dark");
		btnRefresh.classList.remove("btn-outline-secondary");
	}
}


btnRefresh.addEventListener("click", async () => readFolder(filePath));


btnOpenFolder.addEventListener("click", async () => {
	filePath = await window.api.openPath();
	readFolder(filePath);
});


btnStart.addEventListener("click", async () => {
	const simulation = chkSimulate.checked;
	const nodes = Array.from(document.querySelectorAll("#filelist input[type=checkbox]:checked")).map(x => x.dataset.filename);
	if (nodes.length > 0) {
		const renamedFiles = await window.api.start({
			path: filePath,
			filenames: nodes,
			simulate: simulation,
			movetofolder: chkMoveToFolder.checked
		});
		if (renamedFiles) {
			renamedFiles.forEach(x => {
				const old = x.old.replace("\\", "/");
				const neu = x.new.replace("\\", "/");
				console.assert(document.querySelector(`#filelist input[type=checkbox][data-filename='${old}']`), "checkbox not found");
				console.assert(document.querySelector(`#filelist span[data-filename='${old}']`), "span not found");
				if (!simulation) {
					// attribute checkbox
					document.querySelector(`#filelist input[type=checkbox][data-filename='${old}']`).dataset.filename = neu;
				}
				// innerText span first
				document.querySelector(`#filelist span[data-filename='${old}']`).innerText = neu;
				if (!simulation) {
					// attribute span
					document.querySelector(`#filelist span[data-filename='${old}']`).dataset.filename = neu;
				}
			});
			if (!simulation) {
				readFolder(filePath);
			}
		}
		document.querySelectorAll("#filelist input[type=checkbox]").forEach(x => x.checked = false);
		chkAll.checked = btnStart.disabled = false;
	}
});


chkAll.addEventListener("change", () => {
	document.querySelectorAll("#filelist input[type=checkbox]").forEach(x => x.checked = chkAll.checked);
	checkStartButtonAndchkAll();
});


// window.api.handleCounter((event, value) => {
// 	counter.innerText = value;
// 	event.sender.send("counter-value", value);
// });
