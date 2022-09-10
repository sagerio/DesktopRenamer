const { app, BrowserWindow, dialog, globalShortcut, ipcMain, Notification, Tray, Menu, nativeImage, Input } = require("electron");
try { require("electron-reloader")(module); } catch (_) { }
const { readdir } = require("fs-extra");
const { join } = require("path");
const { v4 } = require("uuid");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line global-require
if (require("electron-squirrel-startup")) {
	app.quit();
}


/**********
THE MAIN PROCESS
can access the Node.js APIs directly
can"t access the  HTML Document Object Model (DOM)
**********/

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


async function openPath() {
	const { canceled, filePaths } = await dialog.showOpenDialog(window, {
		properties: ["openDirectory"],
		buttonLabel: "Choose this folder",
		title: "Choose folder",
		// UNDO defaultPath: __dirname
		defaultPath: "C:\\Users\\robert\\Downloads\\__TEST__"
	});
	return canceled ? "" : filePaths[0];
}


async function readFiles(event, path) {
	try {
		window.setProgressBar(0, { mode: "normal" });
		const files = await readdir(path);
		return files;
	} catch (error) {
		window.setProgressBar(0, { mode: "error" });
		dialog.showErrorBox(TITEL, `Hoppla, da ist etwas schief gelaufen...\n\n${error}`);
	}
}


async function runStart(event, data) {
	// dialog.showMessageBox(window, { title: TITEL, message: `UUID: ${v4()}` });
	// return;
	try {
		app.badgeCount = data.filenames.length;
		const percent = 1 / data.filenames.length;
		window.setProgressBar(0, { mode: "normal" });
		for (let i = 0; i < data.filenames.length; i++) {
			const fullPath = join(data.path, data.filenames[i]);

			window.setProgressBar(percent * i, { mode: "normal" });
			app.badgeCount--;
		}

		// 	const stats = statSync(path);
		// 	if (stats.isFile()) {
		// 		const size = stats.size;
		// 		const content = readFileSync(path, { encoding: "utf8" });
		// 		const hash = createHash("md5").update(content, "utf8").digest("hex");
		// 		result.files.push({ name, size, hash });
		// 		const percent = ((index + 1) / files.length);
		// 	}
		window.setProgressBar(1, { mode: "normal" });

		// if (folderBrowserDialog.ShowDialog(this) == DialogResult.OK)
		// {
		// 	dataGrid.Rows.Clear();
		// 	progressBar.Value = 0;
		// 	folder = txtFolder.Text = folderBrowserDialog.SelectedPath;
		// 	files = new List<string>(Directory.GetFiles(folder, "*", SearchOption.TopDirectoryOnly));
		// 	if (files.Count > 0)
		// 	{
		// 		statusText.Text = $"{files.Count} Dateien";
		// 		progressBar.Maximum = files.Count;
		// 		btnStart.Enabled = grpOptions.Enabled = true;
		// 	}
		// 	else
		// 	{
		// 		statusText.Text = "keine Dateien";
		// 		btnStart.Enabled = false;
		// 	}
		// }

		// bool simulate = chkSimulate.Checked;
		// grpOptions.Enabled = false;
		// foreach (string file in files)
		// {
		// 	// 1. RENAME TO HASH
		// 	string guid = Guid.NewGuid().ToString();
		// 	string ext = Path.GetExtension(file);
		// 	string newName = Path.Combine(folder, string.Concat(guid, ext));
		// 	if (radUmbenennen.Checked) {
		// 		dataGrid.Rows.Add(Path.GetFileName(file), Path.GetFileName(newName));
		// 	}
		// 	if (!simulate)
		// 	{
		// 		File.Move(file, newName);
		// 	}
		// 	if (radVerschieben.Checked)
		// 	{
		// 		// 2. get first char and check if folder exists
		// 		string c = Path.GetFileName(newName)[0].ToString().ToUpper();
		// 		string folderPath = Path.Combine(folder, c);

		// 		// 3. if not, create
		// 		if (!Directory.Exists(folderPath))
		// 		{
		// 			if (!simulate)
		// 			{
		// 				Directory.CreateDirectory(folderPath);
		// 			}
		// 		}
		// 		// 4. move file to folder
		// 		string targetPath = Path.Combine(folderPath, Path.GetFileName(newName));
		// 		dataGrid.Rows.Add(Path.GetFileName(file), Path.Combine(c, Path.GetFileName(newName)));
		// 		if (!simulate)
		// 		{
		// 			File.Move(newName, targetPath);
		// 		}
		// 	}
		// 	progressBar.PerformStep();
		// 	Application.DoEvents();
		// }
		// statusText.Text = "fertig";
		// btnStart.Enabled = false;
		// btnReset.Enabled = true;

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
