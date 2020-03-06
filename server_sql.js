var mysql = require("mysql");
var url = require("url");
var data = require("fs");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var con = mysql.createConnection({
    host: "localhost",
    user: "vishnu",
    password: "",
    database: "account"
});
con.connect(function (err){
    if (err) throw err;
    console.log("connected");
});

app.post("/login", urlencodedParser, function(req, res) {
    var qdata = {
        user:req.body.user,
        pass:req.body.pass
    };
    var sql = "select * from players where username = '" + qdata.user + "' and password = '" + qdata.pass + "';";
    con.query(sql, function(err, result){
        if(err) throw err;
        if(result.length > 0)
            res.send("Hello World");
        else
            res.send("invalid Username or password");
    });
});

app.post("/signup", urlencodedParser, function(req, res) {
    var qdata = {
        user: req.body.user,
        pass: req.body.pass,
        repass: req.body.repass
    };
    if(qdata.pass != qdata.repass){
        res.send("password and re-password not matched");
        res.end(); 
        return;                                
    }
    var sql = "select * from players where username = '" + qdata.user +"';"; 
    console.log(qdata);
    con.query(sql, function(err, result){
        if(err) throw err;
        if(result.length > 0)
            res.send("username already used");
        else{
            console.log("here");
            var query = "insert into players value ('" + qdata.user + "', '" + qdata.pass + "');";
            con.query(query, function(err, result){
                if(err) throw err;
                console.log("added data successfully");
                res.send("added data successfully");
            });
        }
    });
});

var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 });