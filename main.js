const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const tmi = require('tmi.js');
const Store = require('electron-store');

const store = new Store();

console.log(app.getPath('userData'))
require('electron-reload')(__dirname, {
  // Note that the path to electron may vary according to the main file
  electron: require(`${__dirname}/node_modules/electron`)
});


const tmiConf = store.get('tmi')
const channels = store.get('plates')

ipcMain.on('config-send', (event, arg) => { //sending config to renderer
  if(!store.has('tmi')){
    event.reply('config-reply', 'send-to-config')
  }
  event.reply('config-reply', store.get('plates'))
})
ipcMain.on('save-config', (event, arg) => {
  store.set("plates", arg)
})
ipcMain.on('set-tmi', (event, arg) => {
  store.set("tmi", arg)
  console.log("updated tmi config")
})
ipcMain.on('get-tmi', (event, arg) => {
  event.reply('get-tmi', tmiConf)
})

console.log("connecting as " + tmiConf.username)

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: tmiConf.username,
		password: tmiConf.OAuth
	},
	channels: [ 'maxbax0808' ]
});


client.connect()
ipcMain.on('connected-send', (event, arg) => {
  event.reply('connected-reply', "Connected")
})
// Add this in your main.js file to see when a user click on the button from main process
ipcMain.on("button-clicked", (event, data) => {
    client.say(data.channel, data.text)
})


client.on('message', (channel, tags, message, self) => {
	// Ignore echoed messages.
	if(self) return; 
});


const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  
    win.loadFile('html/index.html')
  }

  app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

