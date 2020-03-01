function submit(){
    var user = document.getElementById("username_input");
    var pass = document.getElementById("password_input");
    if(user.required && pass.required){
        window.open("http://localhost:8081/?user=" + user.value + "&pass=" + pass.value, "_self");
    }
    else
        user.value = "notcomplete";
}