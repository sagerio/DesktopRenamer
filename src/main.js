const { readdir, renameSync, statSync, existsSync, mkdirSync } = require("fs-extra");
const { app, BrowserWindow, dialog, globalShortcut, ipcMain } = require("electron");
const { join, extname, dirname, basename } = require("path");
try { require("electron-reloader")(module); } catch (ex) { console.error(ex); }
const { v4 } = require("uuid");

// THE MAIN PROCESS
// can access the Node.js APIs directly
// can't access the  HTML Document Object Model (DOM)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

// Keep a global reference of the window object, if you don"t, the window will be closed automatically when the JavaScript object is garbage collected
let window;
const TITEL = "Desktop Renamer";


// process.on("uncaughtException", error => {});

// new Notification({ title: TITEL, body: files.length }).show();

// const options = {
// 	type: "question",
// 	buttons: ["Cancel", "Yes, please", "No, thanks"],
// 	defaultId: 2,
// 	title: "Question",
// 	message: "Do you want to do this?",
// 	detail: "It does not really matter",
// 	checkboxLabel: "Remember my answer",
// 	checkboxChecked: true,
// };
// const answer = await dialog.showMessageBox(window, options);
// return answer.response;

// TODO https://github.com/sindresorhus/awesome-electron#tools
// TODO Auto-Updater: https://www.electronjs.org/de/docs/latest/tutorial/updates

async function openPath() {
	const { canceled, filePaths } = await dialog.showOpenDialog(window, {
		title: "Choose folder",
		defaultPath: __dirname,
		buttonLabel: "Choose this folder",
		properties: ["openDirectory"],
	});
	return canceled ? "" : filePaths[0];
}


async function readFiles(event, path) {
	try {
		window.setProgressBar(0, { mode: "normal" });
		const files = await readdir(path);
		return files.filter(file => {
			const stat = statSync(join(path, file));
			return !stat.isDirectory();
		});
	} catch (error) {
		window.setProgressBar(0, { mode: "error" });
		dialog.showErrorBox(TITEL, `Hoppla, da ist etwas schief gelaufen...\n\n${error}`);
	}
}


async function runStart(event, data) {
	// dialog.showMessageBox(window, { title: TITEL, message: data.movetofolder });
	// return;
	try {
		const simulation = data.simulate === true;
		const movetofolder = data.movetofolder === true;
		const filePairs = [];
		window.setEnabled(false);
		app.badgeCount = data.filenames.length;
		const percent = 1 / data.filenames.length;
		window.setProgressBar(0, { mode: "normal" });
		for (let i = 0; i < data.filenames.length; i++) {
			const oldFullName = join(data.path, data.filenames[i]);
			const newFullName = join(
				dirname(oldFullName),
				`${v4()}${extname(oldFullName)}`,
			);
			if (!simulation) {
				renameSync(oldFullName, newFullName);
			}
			let neu = "";
			if (movetofolder) {
				// get first char and check if folder exists
				const firstChar = basename(newFullName)[0].toUpperCase();
				const folderPath = join(data.path, firstChar);
				// if not, create if not simulation
				if (!simulation && !existsSync(folderPath))
				{
					mkdirSync(folderPath);
				}
				// 	move file to folder
				const targetPath = join(folderPath, basename(newFullName));
				if (!simulation)
				{
					renameSync(join(data.path, basename(newFullName)), targetPath);
				}
				neu = join(firstChar, basename(newFullName));
			} else {
				neu = basename(newFullName);
			}
			filePairs.push({
				old: basename(oldFullName),
				new: neu,
			});

			window.setProgressBar(percent * (i + 1), { mode: "normal" });
			app.badgeCount--;
		}

		// window.webContents.send("update-counter", 100);
		window.setProgressBar(1, { mode: "normal" });
		window.setEnabled(true);
		return filePairs;
	} catch (error) {
		window.setProgressBar(0, { mode: "error" });
		dialog.showErrorBox(TITEL, `Hoppla, da ist etwas schief gelaufen...\n\n${error}`);
	}
}


app.whenReady().then(() => {
	window = new BrowserWindow({
		width: 1024,
		height: 768,
		icon: `${__dirname}/rename.ico`,
		alwaysOnTop: false,
		autoHideMenuBar: true,
		transparent: false,
		frame: true,
		center: true,
		resizable: false,
		title: TITEL,
		skipTaskbar: false,
		minimizable: true,
		maximizable: false,
		show: false,
		darkTheme: true,
		webPreferences: {
			nodeIntegration: false, // is default value after Electron v5
			contextIsolation: true, // protect against prototype pollution
			backgroundThrottling: false,
			enableRemoteModule: false, // turn off remote
			preload: join(__dirname, "preload.js") // use a preload script
		},
	});

	// window.setProgressBar(0.5, { mode: "normal" });
	ipcMain.handle("titel", () => TITEL);
	ipcMain.handle("openPath", openPath);
	ipcMain.handle("readFiles", readFiles);
	ipcMain.handle("start", runStart);
	ipcMain.on("counter-value", (event, value) => {
		console.log(value); // will print value to Node console
	});

	// 	mainWindow.setProgressBar(0, { mode: "normal" });

	window.loadFile(join(__dirname, "index.html"));

	window.on("ready-to-show", () => {
		// mainWindow.setTitle("TinyPGP");
		window.webContents.openDevTools({ mode: "left" });
		// window.maximize();
		window.show();

		globalShortcut.register("CommandOrControl+r", () => {
			console.log("::reloading");
			window.reload();
		});

		window.on("minimize", event => {
			console.log("::minimize");
			// window.hide();
			event.preventDefault();
		});
	});

	// app.on("activate", () => {
	// 	if (BrowserWindow.getAllWindows().length === 0) {
	// 		createWindow();
	// 	}
	// });
});


app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});


// In this file you can include the rest of your app"s specific main process code.
// You can also put them in separate files and require them here.
