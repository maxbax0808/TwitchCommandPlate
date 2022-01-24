const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const tmi = require('tmi.js');
const Store = require('electron-store');
const { platform } = require('os');

const store = new Store();
store.set('','')

console.log(app.getPath('userData'))
require('electron-reload')(__dirname, {
  // Note that the path to electron may vary according to the main file
  electron: require(`${__dirname}/node_modules/electron`)
});


var tmiConnected = false
var hasTMIConfig = false
if(store.has('tmi')){
      hasTMIConfig = true
}
if(!store.has('plates')){
  store.set('plates', {
		"nrChannels": 0,
		"channels":[]})
}
var tmiConf = store.get('tmi')
var channels = store.get('plates')

ipcMain.on('config-send', (event, arg) => {
  event.reply('config-reply', store.get('plates'))
})
ipcMain.on('save-config', (event, arg) => {
  store.set("plates", arg)
})

ipcMain.on('set-tmi', (event, arg) => {
  store.set("tmi", arg)
  tmiConf = arg
  console.log("updated tmi config")
  hasTMIConfig = true
  loadTMI()
})
ipcMain.on('get-tmi', (event, arg) => {
  if(hasTMIConfig){
    event.reply('get-tmi', tmiConf)
  } else {
    event.reply('get-tmi', {"username": "", "OAuth": ""})
  }
})
ipcMain.on('has-tmi', (event, arg) =>{
  event.reply('has-tmi', hasTMIConfig)
})

var client = new tmi.Client({
  options: { debug: true },
  channels: []
});

if(hasTMIConfig){
  loadTMI()
}
ipcMain.on('connected-send', (event, arg) => {
  event.reply('connected-reply', client.readyState())
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

function loadTMI(){
  console.log("connecting as " + tmiConf.username)
  client = new tmi.Client({
    options: { debug: true },
    identity: {
      username: tmiConf.username,
      password: tmiConf.OAuth
    },
    channels: []
  });

  client.connect()
  tmiConnected = true
}