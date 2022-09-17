// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");


// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
	Titel: ipcRenderer.invoke("titel"),
	openPath: () => ipcRenderer.invoke("openPath"),
	readFiles: path => ipcRenderer.invoke("readFiles", path),
	start: data => ipcRenderer.invoke("start", data),
	handleCounter: callback => ipcRenderer.on("update-counter", callback),
});
