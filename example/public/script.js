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

function verified(){
    console.log('token refreshed')
}

function refreshToken(){
    let client = new FlechoClient("http://localhost:5000", "example");

    client.verify(verified)
}

window.onload = verifyLogin;
window.gotoLogin = gotoLogin;
window.refreshToken = refreshToken;