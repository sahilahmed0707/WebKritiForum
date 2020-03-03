var error = document.getElementById("error_label");
// error.innerHTML = "I am here";
error.innerHTML = "hello";
var user = document.getElementById("username_input");
var pass = document.getElementById("password_input");
var repass = document.getElementById("password_input_1");
var form = document.getElementById("input_form");
form.action = "";
if(pass.value == repass.value)
    form.action = "http://localhost:8000/";
else
    error.innerHTML = "please fill all fields";