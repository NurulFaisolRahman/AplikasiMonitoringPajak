const {app, BrowserWindow, Tray} = require('electron')
const url = require('url')
const path = require('path')

let mainWindow
let tray

function createWindow () {
	const Layar = {
	  width: 820,
	  height: 620,
	  // show:false,
	  icon: `${__dirname}/icon.png`
	}

	mainWindow = new BrowserWindow(Layar)
	let mainSession = mainWindow.webContents.session
    mainWindow.loadURL(path.join('file://', __dirname, '/renderer/main.html'))
    const IconTray = path.join(__dirname, 'icon.png')
    tray = new Tray(IconTray)
    tray.on('click', () => {
    	if (mainWindow.isVisible()) {
    		mainWindow.hide()
    	} else {
    		mainWindow.show()
    	}
    })

	mainWindow.on('closed', () => {
      mainWindow = null
    })
}

app.on('ready', () => {
	createWindow()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})