
function doLogin(){
    fetch(this.server+"/auth/tok", {
        method: "GET"
    })
    .then(response => response.json())
    .then(json => console.log(json));
}