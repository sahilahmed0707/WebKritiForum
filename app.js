const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
var mysql = require('mysql');
app.use(express.static(__dirname+'/public'));
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'Forum',
//   port: "3306",
//   insecureAuterh : true,
});


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE IF NOT EXISTS `forum`.`Discussion` ( `dsc_id` INT NOT NULL, `dsc_name` VARCHAR(45) NOT NULL, `usr_id` VARCHAR(45) NULL, `thanks` INT, `data` VARCHAR(450) NULL, `post time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`dsc_id`), UNIQUE INDEX `discussion_id_UNIQUE` (`dsc_id` ASC) VISIBLE)"
//   var comments="CREATE TABLE IF NOT EXISTS `forum`.`Comments` ( `idComments` INT NOT NULL, `usr_id` VARCHAR(45) NULL, `dsc_id` INT NULL, `cmt` VARCHAR(150) NULL, `post time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`idComments`), UNIQUE INDEX `idComments_UNIQUE` (`idComments` ASC) VISIBLE)";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});
  

// app.set = express();

var posts=[]

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/", function(req, res){
    res.render("home");
});

app.get("/dashboard", function(req, res){
    res.render("dashboard");
});

app.get("/compose", function(req, res){
    res.render("compose");
});


app.post("/compose", function(req, res){
    const post={
        title: req.body.postTitle,
        body: req.body.postBody
    };
    posts.push(post);
    res.redirect();
});


app.listen(3333, function () {
    console.log("Server started on port 3333");
});