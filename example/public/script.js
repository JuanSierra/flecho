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
}

function sendRegistration(){
    let login = document.getElementsByName('login')[0];
    let client = new FlechoClient("http://localhost:5000", "example");

    client.register(login.value);
}