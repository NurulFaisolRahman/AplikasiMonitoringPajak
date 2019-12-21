const {app, BrowserWindow, Tray, ipcMain} = require('electron')
const url = require('url')
const path = require('path')
const Store = require('./renderer/store.js')

let mainWindow
let tray

// First instantiate the class
const store = new Store({
  configName: 'user-preferences',
  defaults: {}
});

console.log(store.get('NPWPD'));

function createWindow () {
	const Layar = {
	  width: 800,
	  height: 600,
	  show:false,
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

    ipcMain.on('Sesi', (event, arg) => {
    	store.set('NPWPD', 'Faisol');
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