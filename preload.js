// Preload script
const { contextBridge, ipcRenderer } = require("electron")

var plates;
var tmi;

window.addEventListener('DOMContentLoaded', () => {
  if(window.location.href.endsWith("index.html")){
    handleIndex()
  }
  if(window.location.href.endsWith("config.html")){
    handleConfig()
  }
})



contextBridge.exposeInMainWorld("electron", {
    send: (channel, payload) => ipcRenderer.send(channel, payload),
})

function addChannel(channelName) {
  if(!plates.channels.find(({name}) => name === channelName)){
    plates.channels.push({"name":channelName,
    "nrPlates": 0,
    "plate":[
    ]})
    plates.nrChannels++
  } else {  
    console.log("alredy found")
  }
}

function addPlate(channelName, plateName) {
  for(var i = 0; i<plates.nrChannels; i++){
    if(plates.channels[i].name == channelName){
      if(!plates.channels[i].plate.find(element => element === plateName)){
        plates.channels[i].plate.push(plateName)
        plates.channels[i].nrPlates++
        break
      }      
    }
  }
}


function deletePlate(channelName, plateName){
  for(var i = 0; i<plates.nrChannels; i++){
    if(plates.channels[i].name == channelName){
      if(plates.channels[i].plate.find(element => element === plateName)){
        plates.channels[i].plate = plates.channels[i].plate.filter(name => name!=plateName);
        plates.channels[i].nrPlates--
        break
      }      
    }
  }
}

function deleteChannel(channelName){
  for(var i = 0; i<plates.nrChannels; i++){
    if(plates.channels[i].name == channelName){
      console.log("found channel to delete")
      plates.channels = plates.channels.filter(e => e.name!=channelName)
      plates.nrChannels--
      break
    }
  }
}


function save(){
  ipcRenderer.send('save-config', plates)
}

function handleIndex() {
  ipcRenderer.on('config-reply', (event, arg) => {
    if(arg=='send-to-config' && !window.location.href.endsWith("config.html")){
      window.location.href = 'config.html'
    }
    console.log(arg)
    plates = arg
    buildUi()
    //deleteChannel("maxbax0808")
    buildUi()
  })
  ipcRenderer.send('config-send', 'config')
  document.getElementById('save').addEventListener("click", ()=>{
    buildUi()
    save()
  })
  ipcRenderer.send('connected-send', 'connected')
  ipcRenderer.on('connected-reply', (event, arg) => {
      document.getElementById("connected").innerText = arg
  })
}

function handleConfig() {
  ipcRenderer.on("get-tmi", (ev, arg) =>{
    tmi = arg
    document.getElementById("username").innerHTML = "<p>Username:<input type=\"text\" id=\"config-username\" ></input></p>"
    document.getElementById("config-username").value = tmi.username
    document.getElementById("oauth").innerHTML = "<p>OAuth:<input type=\"password\" id=\"config-oauth\"></input></p>"
    document.getElementById("config-oauth").value = tmi.OAuth
  })
  ipcRenderer.send('get-tmi', "get")

  document.getElementById("config-save").addEventListener("click", ()=>{
    const form  = document.querySelector('form');
    form.onsubmit = (event) =>{
      event.preventDefault()
      tmi.username = document.getElementById("config-username").value
      tmi.OAuth = document.getElementById("config-oauth").value
    }
    ipcRenderer.send('set-tmi', tmi)
  })
}

function buildUi() {
  document.getElementById("tab").innerHTML = ""
  document.getElementById("tabs").innerHTML = ""
  var nrChannels = plates.nrChannels
  for(var i = 0; i<nrChannels; i++){
    var name = plates.channels[i].name
    
    if(i==0){
    document.getElementById("tab").innerHTML += "<button class=\"tablinks active\" onclick=\"openTab(event, '" + name + "')\" id=\"defaultOpen\">" + name + "</button>"
    document.getElementById("tabs").innerHTML += "<div id=" + name + " class='tabcontent' style=\"display: block;\"> </div>"
    } else {
      document.getElementById("tab").innerHTML += "<button class=\"tablinks\" onclick=\"openTab(event, '" + name + "')\">" + name + "</button>"
      document.getElementById("tabs").innerHTML += "<div id=" + name + " class='tabcontent'> </div>"
    }

    
    var nrPlates = plates.channels[i].nrPlates
    for(var j = 0; j< nrPlates; j++){
      plate = plates.channels[i].plate[j]
      document.getElementById(name).innerHTML += "<button onclick=\"window.electron.send('button-clicked', {text:'" + plate + "', channel: '" + name + "'})\" class='btn btn-lg'>" + plate + "</button>"
    }

  }
}

document.getElementById
