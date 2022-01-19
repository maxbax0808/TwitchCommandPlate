// index.js
const hellobtn = document.getElementById("hello")
const testbtn = document.getElementById("test")


hellobtn.onclick = function () {
    window.electron.send("button-clicked", {text: hellobtn.textContent, channel: "maxbax0808"})
}
testbtn.onclick = function () {
    window.electron.send("button-clicked", {text: testbtn.textContent, channel: "maxbax0808"})
}


/*var buttons = document.getElementsByName("button")

for(var i = 0; i<= buttons.length-1; i++){
    buttons[i].onclick = function () {
        buttons[i].addEventListener('click', function () {
            console.log("hallo")
        })
    }
    console.log(buttons[i].textContent)
    
}*/