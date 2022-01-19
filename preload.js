// Preload script
const { contextBridge, ipcRenderer } = require("electron")

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('config-reply', (event, arg) => {
    console.log(arg)
    var nrChannels = arg.nrChannels
    for(var i = 0; i<nrChannels; i++){
      var name = arg.channels[i].name
      
      
      if(i==0){
      document.getElementById("tab").innerHTML += "<button class=\"tablinks active\" onclick=\"openTab(event, '" + name + "')\" id=\"defaultOpen\">" + name + "</button>"
      document.getElementById("tabs").innerHTML += "<div id=" + name + " class='tabcontent' style=\"display: block;\"> </div>"
      } else {
        document.getElementById("tab").innerHTML += "<button class=\"tablinks\" onclick=\"openTab(event, '" + name + "')\">" + name + "</button>"
        document.getElementById("tabs").innerHTML += "<div id=" + name + " class='tabcontent'> </div>"
      }

      
      var nrPlates = arg.channels[i].nrPlates
      for(var j = 0; j< nrPlates; j++){
        plate = arg.channels[i].plate[j]
        document.getElementById(name).innerHTML += "<button onclick=\"window.electron.send('button-clicked', {text:'" + plate + "', channel: '" + name + "'})\" class='btn btn-lg'>" + plate + "</button>"
      }

    }
    
  })
  ipcRenderer.send('config-send', 'config')
  
  ipcRenderer.send('connected-send', 'connected')
  ipcRenderer.on('connected-reply', (event, arg) => {
    document.getElementById("connected").innerText = arg
})

})

contextBridge.exposeInMainWorld("electron", {
    send: (channel, payload) => ipcRenderer.send(channel, payload),
})




