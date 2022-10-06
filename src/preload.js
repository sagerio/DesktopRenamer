// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");


// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
	Titel: ipcRenderer.invoke("titel"),
	openPath: path => ipcRenderer.invoke("openPath", path),
	readFiles: path => ipcRenderer.invoke("readFiles", path),
	start: data => ipcRenderer.invoke("start", data),
	getPath: path => ipcRenderer.invoke("getPath", path),
	// Möglichkeit (2)
	onSetVersion: callback => ipcRenderer.on("set-version", callback),
});


// Möglichkeit (1)
// window.addEventListener("DOMContentLoaded", () => {
// 	const version = document.getElementById("version");
// 	ipcRenderer.on("set-version", (event, value) => {
// 		version.innerText = value;
// 	});
// });
