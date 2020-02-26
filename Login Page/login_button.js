function login(){
    var user = document.getElementById("Username-Input");
    var pass = document.getElementById("Password-Input");
    // document.getElementById("test").innerHTML = user.value + " " + pass.value + " " + user.required + " " + pass.required;
    if(user.required && pass.required){
        window.open("http://localhost:8080/?user=" + user.value +  "&password=" + pass.value, "_self");
    }
    else
        document.getElementById("test").innerHTML = "Please complete all fields";
}