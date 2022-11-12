function verifyLogin(){
    let data = localStorage.getItem('user');
    
    if(!data)
    {
        window.location.href = "http://localhost:8080/login.html"
    }else{
        let login = document.getElementById("login")
        let profile = document.getElementById("profile")
        
        login.classList.add("hide");
        profile.classList.remove("hide");
        profile.value = data;
    }
}

window.onload = verifyLogin;