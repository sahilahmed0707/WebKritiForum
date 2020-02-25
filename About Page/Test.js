var temp_left = 0, temp_top = 0;
var elem = [];
var food = document.getElementById("food");
var elem_to_add = 0;
var delay = 50;
// document.getElementById("Sahil_info").innerHTML = "huun na mai chutiya 0";
food.style.left = Math.floor(Math.random() * Math.floor(100 / parseInt(food.style.width))) * parseInt(food.style.width) + "%";
food.style.top = Math.floor(Math.random() * Math.floor(100 / parseInt(food.style.height))) * parseInt(food.style.height) + "%";
// document.getElementById("Sahil_info").innerHTML = food.style.left + " " + food.style.top + " " + food.style.width + " " + food.style.height;
elem.push(document.getElementById("test_player"));
function insert_elem(){
  if(elem_to_add > 0){
    elem_to_add--;
    // document.getElementById("Sahil_info").innerHTML = "Hye " + elem.length;
    elem.push(document.createElement("DIV"));
    document.body.appendChild(elem[elem.length - 1]);
    elem[elem.length - 1].classList.add("player");
    // document.getElementById("Sahil_info").innerHTML = "Hye " + elem.length;
  }
}
function process_elem(){
  for(j = elem.length - 1; j > 0; j--){
    elem[j].style.left = elem[j - 1].style.left;
    elem[j].style.top = elem[j - 1].style.top;
  }
}
function new_food_coord(){
  first: while(true){
    food.style.left = Math.floor(Math.random() * Math.floor(100 / parseInt(food.style.width))) * parseInt(food.style.width) + "%";
    food.style.top = Math.floor(Math.random() * Math.floor(100 / parseInt(food.style.height))) * parseInt(food.style.height) + "%";
    for(i = 0; i < elem.length; i++)
      if(elem[i].style.left == food.style.left && elem[i].style.top == food.style.top)
        continue first;
    break;
  }
}
function check_food(){
  if(food.style.left == elem[0].style.left && food.style.top == elem[0].style.top){
    new_food_coord();
    if(delay > 30)
      delay -= 2;
    elem_to_add += Math.ceil(elem.length / 3);
    // document.getElementById("Sahil_info").innerHTML = "Hye " + elem.length;
  }
}
function check_collision(){
  for(i = 1; i < elem.length; i++)
    if(elem[0].style.left == elem[i].style.left && elem[0].style.top == elem[i].style.top)
      window.location.reload();
}
var lastKeyCode = 0;
var nextInterval = false;
setInterval(function(){
  nextInterval = true;
  // document.getElementById("Sahil_info").innerHTML = "Hye " + elem.length;
  // document.getElementById("Sahil_info").innerHTML = food.style.left + " " + food.style.top + " " + Math.random();
  document.onkeydown = function(event){
    for(var i = 0; i < 4; i++){
      if(i == event.keyCode - 37 && ((lastKeyCode - 37) % 2) != (i % 2) && nextInterval == true){
        nextInterval = false;
        // document.getElementById("Sahil_info").innerHTML = ((lastKeyCode - 37) % 2) + " " + i;
        lastKeyCode = event.keyCode;
        temp_left = (1 - (i % 2))*(i + -1);
        temp_top = (i % 2)*(2 * i - 4);
      }
    }   
  };
  var left = parseInt(elem[0].style.left);
  var top = parseInt(elem[0].style.top);
  var width = parseInt(elem[0].style.width);
  var height = parseInt(elem[0].style.height);
  left = (left + temp_left) % 100;
  if(left < 0)
    left = 100 - width - 1;
  top = (top + temp_top) % 100;
  if(top < 0)
    top = 100 - height;
  check_food();
  check_collision();
  insert_elem();
  process_elem();
/*   document.getelem[0]entById("Sahil_info").innerHTML = temp_left + " " + temp_top + " " + left + " " + top; */
  elem[0].style.left = left + "%";
  elem[0].style.top = top + "%";
}, delay);