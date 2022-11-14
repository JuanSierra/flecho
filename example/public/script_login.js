class FlechoClient {
    constructor(server, app){
        this.server = server;
        this.app = app;
    }

    register(email){
        fetch(this.server+"/auth/tok", {
            method: "POST",
            body: JSON.stringify({
                email: email
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(json => console.log(json));
    }

    verify(){
        fetch(this.server+"/auth/tok", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => console.log(response));
    }
}

function doLogin(){
    let url = new URL(window.location);
    let params = new URLSearchParams(url.search);

    if(localStorage.getItem('user'))
        window.location.href = "http://localhost:8080/index.html"

    /// if there is user then verify
    /*
        let client = new FlechoClient("http://localhost:5000", "example");

        client.verify();
    */
    if(params.has('email')){
        fetch("http://localhost:5000/auth/tok?" + params, {
            method: "GET",
            credentials: 'include'
        })
        .then((response) => {
            if (response.status == 200) {
                /*let json = ;
                console.log(json)
*/
                return response.json();
            }
            else
            {
                throw `error with status ${response.status}`;
            }

            /*fetch("http://localhost:5000/auth/tok", {
                method: "GET",
                credentials: 'include'
            })*/
        })
        .then((data) => {
            localStorage.setItem('user', data);  console.log(data)
            window.location.href = "http://localhost:8080/index.html";
        });
    }
}

function sendRegistration(){
    let login = document.getElementsByName('login')[0];
    let client = new FlechoClient("http://localhost:5000", "example");

    client.register(login.value);
}

window.onload = doLogin;