// electron-packager . --platform=win32 --electron-version=1.4.13 --asar=true --icon=icon.ico --overwrite
const {app, BrowserWindow, Tray} = require('electron')
const url = require('url')
const path = require('path')

let mainWindow
let tray

function createWindow () {
	const Layar = {
	  width: 800,
	  height: 640,
	  icon: `${__dirname}/favicon.png`,
	}

	mainWindow = new BrowserWindow(Layar)
    mainWindow.loadURL(path.join('file://', __dirname, '/renderer/main.html'))
    const IconTray = path.join(__dirname, 'favicon.png')
    tray = new Tray(IconTray)
    tray.on('click', () => {
    	if (mainWindow.isVisible()) {
    		mainWindow.hide()
    	} else {
    		mainWindow.show()
    	}
    })

    mainWindow.on('minimize',function(event){
        event.preventDefault();
        mainWindow.hide();
    });
}

app.on('ready', () => {
	createWindow()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})