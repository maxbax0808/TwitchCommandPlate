// Preload script
const { contextBridge, ipcRenderer } = require("electron");
const commands = require("tmi.js/lib/commands");
const { channel } = require("tmi.js/lib/utils");

var plates;
var tmi;

window.addEventListener('DOMContentLoaded', () => {
  if(window.location.href.endsWith("index.html")){
    handleIndex()
  }
  if(window.location.href.endsWith("config.html")){
    handleConfig()
  }
  if(window.location.href.endsWith("edit.html")){
    handleEdit()
  }
})



contextBridge.exposeInMainWorld("electron", {
    send: (channel, payload) => ipcRenderer.send(channel, payload)
})
contextBridge.exposeInMainWorld("config", {
  getPlates: plates,
  deletePlate: (channelName, plate) => deletePlate(channelName, plate),
  buildEdit: () => buildEdit()
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
      if(plates.channels[i].nrPlates == 0){
        plates.channels[i].plate.push(plateName)
        plates.channels[i].nrPlates++
        break
      }
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
    if(arg=='send-to-config'){
      window.location.href = 'config.html'
    }
    console.log(arg)
    plates = arg
    buildUi()
  })
  ipcRenderer.send('config-send', 'config')
  document.getElementById('save').addEventListener("click", ()=>{
    save()
    window.location.href="index.html"
    
    
  })
  ipcRenderer.send('connected-send', 'connected')
  ipcRenderer.on('connected-reply', (event, arg) => {
      document.getElementById("connected").innerText = arg
  })
}

function handleEdit() {
  ipcRenderer.on('config-reply', (event, arg) => {
    console.log(arg)
    plates = arg
    buildEdit()
    document.getElementById("addChannelButton").addEventListener("click", ()=>{
      channelName = document.getElementById("addChannelName").value
      console.log(channelName)
      addChannel(channelName)
      buildEdit(channelName)
    })
    document.getElementById("addPlateButton").addEventListener("click", ()=>{
      command = document.getElementById("addPlateInput").value
      console.log(command)
      channelName = document.getElementsByClassName("active")[0].innerHTML
      console.log(channelName)
      addPlate(channelName, command)
      console.log(plates)
      buildEdit(channelName)
    })
    document.getElementById("deleteChannelButton").addEventListener("click", ()=>{
      channelName = document.getElementsByClassName("active")[0].innerHTML
      console.log(channelName)
      deleteChannel(channelName)
      console.log(plates)
      buildEdit()
    })
  })
  ipcRenderer.send('config-send', 'config')
  document.getElementById('save').addEventListener("click", ()=>{
    save()
    window.location.href="index.html"
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
    tmi.username = document.getElementById("config-username").value
    tmi.OAuth = document.getElementById("config-oauth").value
    
    ipcRenderer.send('set-tmi', tmi)
  })
}

function buildUi(active) {
  if(typeof active==='undefined'){
    active = plates.channels[0].name
  }
  document.getElementById("tab").innerHTML = ""
  document.getElementById("tabs").innerHTML = ""
  var nrChannels = plates.nrChannels
  for(var i = 0; i<nrChannels; i++){
    var name = plates.channels[i].name
    
    if(name==active){
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

function buildEdit(active){
  if(typeof active==='undefined'){
    active = plates.channels[0].name
  }
  document.getElementById("tab").innerHTML = ""
  document.getElementById("tabs").innerHTML = ""
  var nrChannels = plates.nrChannels
  for(var i = 0; i<nrChannels; i++){
    var name = plates.channels[i].name
    
    if(name==active){
    document.getElementById("tab").innerHTML += "<button class=\"tablinks active\" onclick=\"openTab(event, '" + name + "')\" id=\"defaultOpen\">" + name + "</button>"
    document.getElementById("tabs").innerHTML += "<div id=" + name + " class='tabcontent' style=\"display: block;\"> </div>"
    } else {
      document.getElementById("tab").innerHTML += "<button class=\"tablinks\" onclick=\"openTab(event, '" + name + "')\">" + name + "</button>"
      document.getElementById("tabs").innerHTML += "<div id=" + name + " class='tabcontent'> </div>"
    }

    
    var nrPlates = plates.channels[i].nrPlates
    for(var j = 0; j< nrPlates; j++){
      plate = plates.channels[i].plate[j]
      document.getElementById(name).innerHTML += "<button class='btn btn-lg' onclick=\"window.config.deletePlate('"+ name +"', '" + plate + "'); window.config.buildEdit() \">" + plate + "</button>"
    }
    

  }
  document.getElementById("tab").innerHTML += "<button class=\"tablinks\" onclick=\"openTab(event, 'addTab')\">+</button>"
  document.getElementById("tabs").innerHTML += "<div id='addTab' class='tabcontent'> Channelname to add: <input type='text' id='addChannelName' class='btn btn-lg command'><button id='addChannelButton' class='btn btn-lg'>Add</button></div>"
  document.getElementById("addPlate").innerHTML = "<br/><p>Add Plate:</p><p><input type='text' id='addPlateInput' class='btn btn-lg command' ><button id='addPlateButton' class='btn btn-lg'>+</button></p>"
  document.getElementById("addPlate").innerHTML += "<p><button id='deleteChannelButton' class='btn btn-lg' style='background-color: red;'>DELTE CHANNEL</button></p><br/>"
}



