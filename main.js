const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const url = require('url')
const path = require('path')

// require('electron-reload')(__dirname)

let win

function createWindow () {
	const Layar = {
	  width: 800,
	  minWidth: 800,
	  height: 600,
		icon: `${__dirname}/icon.png`,
	  webPreferences: {
	    nodeIntegration: true
	  }
	}

	mainWindow = new BrowserWindow(Layar)
    mainWindow.loadURL(path.join('file://', __dirname, '/renderer/main.html'))
    mainWindow.on('closed', () => {
      mainWindow = null
    })
}

// Menu.setApplicationMenu(null);
app.on('ready', () => {
	createWindow()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (mainWindow === null) {
	  createWindow()
	}
})
