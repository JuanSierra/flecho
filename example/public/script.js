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

window.onload = verifyLogin;