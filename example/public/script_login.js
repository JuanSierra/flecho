function doLogin(){
    let params = window.location.search;

    fetch("http://localhost:5000/auth/tok"+params, {
        method: "GET",
        credentials: 'include'
    })
    .then((response) => {
        if (response.status == 200) {
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
    });
}