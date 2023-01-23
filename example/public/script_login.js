class FlechoClient {
    constructor(server, app){
        this.server = server;
        this.app = app;
    }

    register(email, done){
        fetch(this.server + "/auth/tok", {
            method: "POST",
            body: JSON.stringify({
                email: email
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => {
            if (response.status == 200) {
                done();
            }else{
                throw `error with status ${response.status}`;
            }
        });
    }

    verify(email, token, callback){

        fetch(this.server + "/auth/tok?email=" + email + "&token=" + token, {
            method: "GET",
            credentials: 'include'
        })
        .then((response) => {
            if (response.status == 200) {
                return response.json();
            }else{
                throw `error with status ${response.status}`;
            }
        })
        .then((data) => {
            callback(data);
        });
    }
}

function doLogin(){
    let url = new URL(window.location);
    let params = new URLSearchParams(url.search);

    if(localStorage.getItem('user'))
        window.location.href = "http://localhost:8080/index.html"

    if(params.has('email')){
        let email = params.get('email');
        let token = params.get('token');

        client.verify(email, token, storeAndRedirect);
        /*
        fetch("http://localhost:5000/auth/tok?" + params, {
            method: "GET",
            credentials: 'include'
        })
        .then((response) => {
            if (response.status == 200) {
                return response.json();
            }else{
                throw `error with status ${response.status}`;
            }
        })
        .then((data) => {
            localStorage.setItem('user', JSON.stringify(data));  
            console.log(data)
           // window.location.href = "http://localhost:8080/index.html";
        });
        */
    }
}

let client = new FlechoClient("http://localhost:5000", "example");

function sendRegistration(){
    let login = document.getElementsByName('login')[0];

    client.register(login.value, () => pass(1));
}

const $ = document.querySelector.bind(document);
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