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
const version = document.getElementById("version");
const spinner = document.getElementById("pause");
const totop = document.getElementById("totop");
const placeholder = document.getElementById("placeholder");
const dragDropOverlay = document.getElementById("drag-drop-overlay");
const containerOuter = document.getElementById("container-outer");
let filePath = "";
let files = [];
let dragLeaveCounter = 0;


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
	const checkBoxes = document.querySelectorAll("#filelist input[type=checkbox]");
	const checkedBoxes = document.querySelectorAll("#filelist input[type=checkbox]:checked");
	if (checkedBoxes.length > 0) {
		btnStart.disabled = false;
		btnStart.classList.remove("btn-outline-secondary");
		btnStart.classList.add("btn-success");
	} else {
		btnStart.disabled = true;
		btnStart.classList.add("btn-outline-secondary");
		btnStart.classList.remove("btn-success");
	}
	chkAll.checked = checkBoxes.length === checkedBoxes.length && checkedBoxes.length > 0;
}


function presentFiles(files) {
	counter.innerText = files.length;
	if (files.length > 10) {
		placeholder.classList.add("d-none");
		totop.classList.remove("d-none");
	} else {
		placeholder.classList.remove("d-none");
		totop.classList.add("d-none");
	}
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
	spinner.classList.add("d-none");
}


async function readFolder(filePath) {
	if (filePath) {
		spinner.classList.remove("d-none");
		result.value = filePath;
		for (let i = table.rows.length - 1; i >= 0; i--) {
			table.deleteRow(i);
		}
		files = await window.api.readFiles(filePath);
		presentFiles(files);
	}
}


btnRefresh.addEventListener("click", async () => readFolder(filePath));


btnOpenFolder.addEventListener("click", async () => {
	filePath = await window.api.openPath(filePath);
	readFolder(filePath);
});


btnStart.addEventListener("click", async () => {
	const simulation = chkSimulate.checked;
	const nodes = Array.from(document.querySelectorAll("#filelist input[type=checkbox]:checked")).map(x => x.dataset.filename);
	if (nodes.length > 0) {
		spinner.classList.remove("d-none");
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
				// console.assert(document.querySelector(`#filelist input[type=checkbox][data-filename='${old}']`), "checkbox not found");
				// console.assert(document.querySelector(`#filelist span[data-filename='${old}']`), "span not found");
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
		chkAll.checked = false;
		btnStart.disabled = true;
		spinner.classList.add("d-none");
	}
	checkStartButtonAndchkAll();
});


chkAll.addEventListener("change", () => {
	document.querySelectorAll("#filelist input[type=checkbox]").forEach(x => x.checked = chkAll.checked);
	checkStartButtonAndchkAll();
});


// Möglichkeit (2)
window.api.onSetVersion((_event, value) => version.innerText = `v${value}`);


totop.addEventListener("click", () =>
	containerOuter.scroll({ top: 0, left: 0, behavior: "smooth" })
);


document.addEventListener("drop", async event => {
	event.preventDefault();
	event.stopPropagation();
	dragDropOverlay.style.display = "none";
	containerOuter.style.display = "block";

	if (event.dataTransfer.files.length > 0) {
		let files = [];
		for (const f of event.dataTransfer.files) {
			// Using the path attribute to get absolute file path
			files.push(f.name);
		}
		const dir = await window.api.getPath(event.dataTransfer.files[0].path);
		filePath = dir;
		result.value = filePath;
		for (let i = table.rows.length - 1; i >= 0; i--) {
			table.deleteRow(i);
		}
		presentFiles(files);
		document.querySelectorAll("#filelist input[type=checkbox]").forEach(x => x.checked = true);
		checkStartButtonAndchkAll();
	}
});


document.addEventListener("dragover", event => {
	// console.log("::drag over");
	event.preventDefault();
	event.stopPropagation();
    return false;
});


document.addEventListener("dragenter", () => {
	// console.log("::drag enter");
	dragLeaveCounter++;
	dragDropOverlay.style.display = "flex";
	containerOuter.style.display = "none";
});


document.addEventListener("dragleave", () => {
	// console.log("::drag leave");
	dragLeaveCounter--;
	if (dragLeaveCounter === 0) {
		dragDropOverlay.style.display = "none";
		containerOuter.style.display = "block";
	}
});
