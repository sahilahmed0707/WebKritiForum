var http = require("http");
var mysql = require("mysql");
var url = require("url");
var data = require("fs");

http.createServer(function(req, res){
    console.log("hye");
    var q = url.parse(req.url, true);
    var qdata = q.query;
    console.log("bye");
    console.log(qdata);
    var con = mysql.createConnection({
        host: "localhost",
        user: "vishnu",
        password: "",
        database: "account"
    });
    
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