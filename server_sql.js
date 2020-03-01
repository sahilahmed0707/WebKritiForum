var http = require("http");
var mysql = require("mysql");
var url = require("url");
var data = require("fs");
var con = mysql.createConnection({
    host: "localhost",
    user: "vishnu",
    password: "",
    database: "account"
});
http.createServer(function(req, res){
    console.log("hye");
    var q = url.parse(req.url, true);
    var qdata = q.query;
    console.log("bye");
    console.log(qdata);
    
    con.connect(function (err){
        if (err) throw err;
        console.log("connected");
        var sql = "select * from players where username = '" + qdata.user + "' and password = '" + qdata.password + "';";
        con.query(sql, function(err, result){
            if(err) throw err;
            res.writeHead(200, {"Content-type": "text/html"});
            if(result.length > 0)
                res.write("Hello World");
            else
                res.write("invalid Username or password");
            res.end();
        });
    });
    console.log("Hye");
}).listen(8080);

http.createServer(function(req, res){
    console.log("hye");
    var q = url.parse(req.url, true);
    var qdata = q.query;
    var sql = "select * from players where username = '" + qdata.user +"';"; 
    con.query(sql, function(err, result){
        if(err) throw err;
        res.writeHead(200, {"Content-type" : "text/html"});
        if(result.length > 0)
            res.write("username already used");
        else{
            console.log("here");
            var query = "insert into players value ('" + qdata.user + "', '" + qdata.pass + "');";
            con.query(query, function(err, result){
                if(err) throw err;
                console.log("added data successfully");
            });
        }
        res.end();
    });
}).listen(8081);