document.querySelector(".signIn_button").addEventListener("click",function(){
    // alert("i am pressed");
    var activeButton=document.querySelector(".signIn_button");
    document.querySelector(".signIn_button").classList.add("pressed");
    setTimeout(function(){
        document.querySelector(".signIn_button").classList.remove("pressed"),150
    })
})
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
