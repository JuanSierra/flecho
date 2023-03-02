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

    refresh(callback){

        fetch(this.server + "/auth/tok", {
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

export { FlechoClient };