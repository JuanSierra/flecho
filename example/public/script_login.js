import { FlechoClient } from "./flecho.js";
const $ = document.querySelector.bind(document);

function doLogin(){
    let url = new URL(window.location);
    let params = new URLSearchParams(url.search);

    if(localStorage.getItem('user'))
        window.location.href = "http://localhost:8080/index.html"

    if(params.has('email')){
        let email = params.get('email');
        let token = params.get('token');

        client.verify(email, token, storeAndRedirect);
    }
}

let client = new FlechoClient("http://localhost:5000", "example");

function sendRegistration(){
    let login = document.getElementsByName('login')[0];

    client.register(login.value, () => pass(1));
}

function pass(i) {
  $('#form' + i).style.display = 'none'
  $('#form' + (i + 1)).style.display = 'block'
}

function checkToken(){
    let email = $('#email').value;
    let token = $('#token').value;

    client.verify(email, token, storeAndRedirect);
}

function storeAndRedirect(data){
    localStorage.setItem('user', JSON.stringify(data));  
    console.log(data);
    window.location.href = "http://localhost:8080/index.html";
}

window.onload = doLogin;
window.checkToken = checkToken;
window.pass = pass;
window.sendRegistration = sendRegistration;