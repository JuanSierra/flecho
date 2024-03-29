import { FlechoClient } from "./flecho.js";

function verifyLogin(){
    let data = localStorage.getItem('user');
    let login = document.getElementById("login")
    let profile = document.getElementById("profile")
    let message = document.querySelector(".message h1")
      
    if(!data)
    {
        profile.style.display = "none";
        login.style.display = "block";
        message.innerText = "Proceed to login";
    }else{
        login.style.display = "none";
        profile.style.display = "block";
        message.innerText = "Welcome";
    }
}

function gotoLogin(){
    location.href = "/login.html"
}


function verified(data){
    if(data === undefined)
        console.log('no auth data')
    else
        console.log('token refreshed/verified')
}

function onFail(code){
    if(code == 401)
    {
        localStorage.removeItem('user');
        gotoLogin();
    }

    console.log('error on token validation')
}

function refreshToken(){
    let client = new FlechoClient("http://localhost:5000", "example");

    client.refresh(verified, onFail)
}

function validateToken(){
    let client = new FlechoClient("http://localhost:5000", "example");

    client.validate(verified, onFail)
}

window.onload = verifyLogin;
window.gotoLogin = gotoLogin;
window.refreshToken = refreshToken;
window.validateToken = validateToken;