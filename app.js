const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const moment = require("moment");
const app = express();
const cookieParser = require("cookie-parser");
var mysql = require('mysql');
var url = require("url");
var data = require("fs");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.set("view engine", "ejs");
app.use(express.static(__dirname+'/public'));
<<<<<<< HEAD
app.use(cookieParser());
=======
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
var con = mysql.createConnection({
    host: "localhost",
    user: "webkriti",
    password: "12345",
    database: "account"
});

var conn = mysql.createConnection({
    host: "localhost",
    user: "webkriti",
    password: "12345",
    database: 'Forum',
  //   port: "3306",
  //   insecureAuterh : true,
  });
<<<<<<< HEAD

  var conco = mysql.createConnection({
    host: "localhost",
    user: "webkriti",
    password: "12345",
    database: 'Forum',
  //   port: "3306",
  //   insecureAuterh : true,
  });


//   OBJjavascript = JSON.parse(JSON.stringify(objNullPrototype));

=======
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
con.connect(function (err){
    if (err) throw err;
    console.log("connected");
});

conn.connect(function(err) {
    if (err) throw err;
<<<<<<< HEAD
    console.log("Discussion Table Connected!");
    var sql = "CREATE TABLE IF NOT EXISTS `forum`.`Discussion` ( `dsc_id` INT NOT NULL auto_increment, `dsc_name` VARCHAR(45) NOT NULL, `usr_id` VARCHAR(45) NULL, `thanks` INT, `data` VARCHAR(450) NULL, `post_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, `total_posts` INT NOT NULL DEFAULT 0, PRIMARY KEY (`dsc_id`), UNIQUE INDEX `discussion_id_UNIQUE` (`dsc_id` ASC) VISIBLE);"
    conn.query(sql, function (err, result) {
      if (err) throw err;
      if(result.length > 0)
        console.log("Discussion Table created");
    });
  });

  conco.connect(function(err) {
    if (err) throw err;
    console.log("Comments Table Connected!");
    var sql="CREATE TABLE IF NOT EXISTS `forum`.`Comments` ( `idComments` INT NOT NULL, `usr_id` VARCHAR(45) NULL, `dsc_id` INT NULL, `cmt` VARCHAR(150) NULL, `post time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`idComments`), UNIQUE INDEX `idComments_UNIQUE` (`idComments` ASC) VISIBLE)";
    conco.query(sql, function (err, result) {
      if (err) throw err;
      if(result.length > 0)
        console.log("Comments Table created");
    });
  });


=======
    console.log("Connected!");
    var sql = "CREATE TABLE IF NOT EXISTS `forum`.`Discussion` ( `dsc_id` INT NOT NULL, `dsc_name` VARCHAR(45) NOT NULL, `usr_id` VARCHAR(45) NULL, `thanks` INT, `data` VARCHAR(450) NULL, `post time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`dsc_id`), UNIQUE INDEX `discussion_id_UNIQUE` (`dsc_id` ASC) VISIBLE)"
  //   var comments="CREATE TABLE IF NOT EXISTS `forum`.`Comments` ( `idComments` INT NOT NULL, `usr_id` VARCHAR(45) NULL, `dsc_id` INT NULL, `cmt` VARCHAR(150) NULL, `post time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`idComments`), UNIQUE INDEX `idComments_UNIQUE` (`idComments` ASC) VISIBLE)";
    conn.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });
  });

>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
app.get("/forgot-password", function(req, res){
    res.render("ForgotPassword", {
        "heading": "FORGOT PASSWORD",
        "subheading": "USERNAME",
        "input": "user",
        "display": "initial"
    });
});
app.post("/forgot-password/user", urlencodedParser, function(req, res){
    var qdata = {
        user: req.body.user
    };
    var sql = "select * from players where username = '" + qdata.user + "';"
    con.query(sql, function(err, result){
        if (err) throw err;
        if(result.length > 0){
            console.log(result);
            res.render("ForgotPassword", {
                "heading": result[0].username,
                "subheading": result[0].question,
                "input": "ans",
                "display": "initial"
            });
        }
        else{
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "USERNAME DOES NOT EXIST",
                "input": "nothing",
                "display": "none"
            });
        }
    });
});

app.post("/forgot-password/ans", urlencodedParser, function(req, res) {
    var qdata = {
        "user": req.body.extra_info,
        "ans": req.body.ans
    }
    var sql = "select * from players where username = '" + qdata.user + "' and ans = aes_encrypt('ans', unhex(sha2('" + qdata.ans + "', 256)));";
    con.query(sql, function(err, result){
        if (err) throw err;
        if(result.length > 0){
            res.render("NewPassword", {
                "username": qdata.user
            });
        }
        else{
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "INCORRECT ANSWER",
                "input": "nothing",
                "display": "none"
            });
        }
    })
});

app.post("/change-password", urlencodedParser, function(req, res){
    var qdata = {
        "user": req.body.user,
        "pass": req.body.pass,
        "repass": req.body.repass
    };
    if(qdata.pass == qdata.repass){
        var sql = "update players set password = aes_encrypt('" + qdata.pass + "', unhex(sha2('"+ qdata.pass + "', 256))) where username = '" + qdata.user + "';";
        con.query(sql, function(err, result){
            if (err) throw err;
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "PASSWORD CHANGED SUCCESSFULLY",
                "input": "nothing",
                "display": "none"
            });
        });
    }
    else{
        res.render("ForgotPassword", {
            "heading": "nothing",
            "subheading": "PASSWORD AND REPASSWORD DOES NOT MATCH",
            "input": "nothing",
            "display": "none"
        });
    }
})
app.post("/login", urlencodedParser, function(req, res) {
    var qdata = {
        user:req.body.user,
        pass:req.body.pass
    };
    var sql = "select * from players where username = '" + qdata.user + "' and password = aes_encrypt('" + qdata.pass + "', unhex(sha2('"+ qdata.pass + "', 256)));";
    con.query(sql, function(err, result){
        if(err) throw err;
        if(result.length > 0){
<<<<<<< HEAD
            res.cookie("userData", {
                user: qdata.user
            });
=======
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "LOGGED IN SUCCESSFULLY",
                "input": "nothing",
                "display": "none"
            });
        }
        else{
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "INVALID USERNAME OR PASSWORD",
                "input": "nothing",
                "display": "none"
            });
        }
    });
});

app.post("/signup", urlencodedParser, function(req, res) {
    var qdata = {
        user: req.body.user,
        pass: req.body.pass,
        repass: req.body.repass,
        email: req.body.email,
        name: req.body.name,
        ques: req.body.ques,
        ans: req.body.ans
    };
    if(qdata.pass != qdata.repass){
<<<<<<< HEAD
        res.render("ForgotPassword", {
            "heading": "nothing",
            "subheading": "PASSWORD AND REPASSWORD DOES NOT MATCH",
            "input": "nothing",
            "display": "none"
        });
=======
        res.send("password and re-password not matched");
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
        res.end(); 
        return;                                
    }
    var sql = "select * from players where username = '" + qdata.user +"';"; 
    console.log(qdata);
    con.query(sql, function(err, result){
        if(err) throw err;
<<<<<<< HEAD
        if(result.length > 0){
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "USERNAME ALREADY EXISTS",
                "input": "nothing",
                "display": "none"
            });
        }
=======
        if(result.length > 0)
            res.send("username already used");
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
        else{
            console.log("here");
            var query = "insert into players values ('"+ qdata.name + "', '" + qdata.email + "', '" + qdata.user + "', aes_encrypt('" + qdata.pass + "', unhex(sha2('" + qdata.pass + "', 256))), '" + qdata.ques + "', aes_encrypt('ans', unhex(sha2('" + qdata.ans + "', 256))));";
            con.query(query, function(err, result){
                if(err) throw err;
                console.log("added data successfully");
                res.render("ForgotPassword", {
                    "heading": "nothing",
                    "subheading": "ADDED DATA SUCCESSFULLY",
                    "input": "nothing",
                    "display": "none"
                });
            });
        }
    });
});

<<<<<<< HEAD
app.get("/logout", function(req, res) {
    res.clearCookie("userData");
    res.redirect("/");
})

app.get("/login", function(req, res) {
  res.render("LoginPage");
=======
app.get("/login", function(req, res) {
  res.render("LoginPage");
});

app.get("/signup", function(req, res) {
  res.render("SignUp");
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
});
  
var posts=[]

<<<<<<< HEAD
app.get("/signup", function(req, res) {
  res.render("SignUp");
});
=======
var test={
    title: "Faltu Title",
    body: "A 32 years old woman named Milo Moiré introduced “Mirror Box”; a public art performance. In the act complete strangers — both men and women — were invited to touch her breasts and lady bits through the opening in the boxes for maximum of 30 seconds — not a second more. More interesting thing is whole touchy-touchy act was being recorded every second by cameras within the boxes. Yes, really!",
    img: "",
    user: "my useless name",
    date: "Jan 12",
    disc_id: 12
};
posts.push(test);

test={
    title: "Next Faltu Title",
    body: "A variety of objects — roses, feather, chains, scissors and even a gun with bullets loaded — were placed on the table. In the beginning, people were gentle, kissing her, placing rose in her hand and feeding cakes. But soon, the act started turning wild. People took the scissors off the table and cut off all her clothes, one man tried to rape her, another loaded the pistol with the bullet and pointed it at her head. Another still cut her skin around the neck and drank her blood.",
    img: "",
    user: "Varun",
    date: "Feb 23",
    disc_id: 13
}
posts.push(test);
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/about", function(req, res){
    res.render("About Page");
});

app.get("/", function(req, res){
<<<<<<< HEAD
    res.cookie("dummy", {});
    var sql = "select * from discussion order by dsc_id desc limit 10;";
    var posts = [];
    conn.query(sql, function(err, result) {
        if(err) throw err;
        console.log("hye");
        if(result.length > 0){
            posts = [];
            for(var i = 0; i < result.length; i++){
                var post = {
                    title: result[i].dsc_name,
                    body: result[i].data,
                    img: "",
                    user: result[i].usr_id,
                    date: moment(result[i]).format('YYYY MMMM DD'),
                    disc_id: result[i].dsc_id
                };
                posts.push(post);
            }
            console.log(posts);
            console.log("here");
            res.render("home",{
                posts: posts
            });
        }
        else {
            res.render("home", {
                posts: posts
            });
        }
=======
    res.render("home",{
        posts: posts
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
    });
});

app.get("/dashboard", function(req, res){
    res.render("dashboard");
});

app.get("/compose", function(req, res){
<<<<<<< HEAD
    console.log(req.cookies);
    if(req.cookies.hasOwnProperty("userData"))
        res.render("compose");
    else
        res.redirect("http://localhost:8080/login");
});

app.post("/compose", function(req, res){
    var str = req.body.postBody;
    str = str.replace(/\r\n/g, 'char10');

    const post={
        title: req.body.postTitle,
        body: str,
        user: req.cookies.userData.user
    };
    console.log(post);
    var currTime=moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    var sql = 'insert into discussion (dsc_name, usr_id, thanks, data, post_time) values("' + post.title + '", "' + post.user + '", 0, "' + post.body + '", current_timestamp)';
    conn.query(sql, function(err, result) {
        if(err) throw err;
        console.log("discussion added successfully");
        res.render("ForgotPassword", {
            "heading": "nothing",
            "subheading": "DISCUSSION ADDED SUCCESSFULLY",
            "input": "nothing",
            "display": "none"
        });
    });
=======
    res.render("compose");
});

app.post("/compose", function(req, res){
    const post={
        title: req.body.postTitle,
        body: req.body.postBody,
        img: "",
        disc_id: 12
    };
    posts.push(post);
    res.redirect();
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
});

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  
<<<<<<< HEAD
  console.log("Example app listening at", host, port)
});
=======
  console.log("Server started at", host, port)
});
>>>>>>> parent of 79ec475... DISCUSSION PAGE (semi complete)
