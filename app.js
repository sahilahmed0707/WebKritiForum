const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const moment = require('moment');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const url = require('url');
const data = require('fs');
const logger = require('morgan');
const _ = require("lodash");
const urlencodedParser = bodyParser.urlencoded({
  extended: false
});
const ejsLint = require('ejs-lint');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const app = express();

app.use(helmet());
app.use(helmet.noCache());

// Preventing DOS Attacks
app.use(express.json({ limit: '10kb' })); // Body limit is 10

// express-rate-limit dependency
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message:
    "Too many login/signup request from this IP, please try again after an hour"
});


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
String.prototype.replaceAt = function (index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

var con = mysql.createConnection({
  host: 'localhost',
  user: 'webkriti',
  password: '12345',
  database: 'forum'
});

var conn = mysql.createConnection({
  host: 'localhost',
  user: 'webkriti',
  password: '12345',
  database: 'Forum',
});

var conco = mysql.createConnection({
  host: 'localhost',
  user: 'webkriti',
  password: '12345',
  database: 'Forum',
});


app.use(logger('dev'));

con.connect(function (err) {
  if (err) throw err;
  console.log('User Table Connected!');
  var sql =
    'CREATE TABLE IF NOT EXISTS `forum`.`users` ( `name` varchar(50) NOT NULL, `email` varchar(50) NOT NULL, `username` varchar(30) NOT NULL, `password` blob NOT NULL, `question` varchar(100) NOT NULL, `ans` blob NOT NULL, PRIMARY KEY (`username`) )'
  con.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) console.log('User Table created');
  });
});

conn.connect(function (err) {
  if (err) throw err;
  console.log('Discussion Table Connected!');
  var sql =
    'CREATE TABLE IF NOT EXISTS `forum`.`Discussion` ( `dsc_id` INT NOT NULL auto_increment,`dsc_namekebab` VARCHAR(45) NOT NULL, `dsc_name` VARCHAR(45) NOT NULL, `usr_id` VARCHAR(45) NULL, `thanks` INT, `data` VARCHAR(450) NULL, `post_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, `total_posts` INT NOT NULL DEFAULT 0, PRIMARY KEY (`dsc_id`), UNIQUE INDEX `discussion_id_UNIQUE` (`dsc_id` ASC) VISIBLE);'
  conn.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) console.log('Discussion Table created');
  });
});

conco.connect(function (err) {
  if (err) throw err;
  console.log('Comments Table Connected!');
  var sql =
    'CREATE TABLE if not exists `forum`.`comments` ( `idComments` int NOT NULL AUTO_INCREMENT, `usr_id` varchar(45) DEFAULT NULL, `dsc_id` int DEFAULT NULL, `cmt` varchar(150) DEFAULT NULL, `post_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `upvote` int NOT NULL DEFAULT "0", PRIMARY KEY (`idComments`), UNIQUE KEY `idComments_UNIQUE` (`idComments`) )';
  conco.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) console.log('Comments Table created');
  });

  var sql ='CREATE TABLE if not exists `forum`.`comment_thanks` (`user_id` varchar(50) NOT NULL,`idCmt` int NOT NULL);';
  conco.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) console.log('Comments Thanks Table created');
  });
  
  var sql ='CREATE TABLE if not exists `forum`.`discussion_thanks` (`user_id` varchar(50) NOT NULL,`dsc_id` int NOT NULL) ;';
  conco.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) console.log('Discussion Thanks Table created');
  });
});



app.get('/forgot-password', function (req, res) {
  res.render('ForgotPassword', {
    'heading': 'FORGOT PASSWORD',
    'subheading': 'USERNAME',
    'user': req.cookies.userData.user,
    'input': 'user',
    'display': 'initial'
  });
});

app.post('/forgot-password/user', urlencodedParser, function (req, res) {
  var qdata = {
    user: req.body.user
  };
  var sql = 'select * from users where username = \'' + qdata.user + '\';'
  con.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      console.log(result);
      res.render('ForgotPassword', {
        'heading': result[0].username,
        'subheading': result[0].question,
        'user': req.cookies.userData.user,
        'input': 'ans',
        'display': 'initial'
      });
    } else {
      res.render('ForgotPassword', {
        'heading': 'nothing',
        'subheading': 'USERNAME DOES NOT EXIST',
        'user': req.cookies.userData.user,
        'input': 'nothing',
        'display': 'none'
      });
    }
  });
});

app.post('/forgot-password/ans', urlencodedParser, function (req, res) {
  var qdata = {
    'user': req.body.extra_info,
    'ans': req.body.ans
  };
  var sql = 'select * from users where username = \'' + qdata.user +
    '\' and ans = aes_encrypt(\'ans\', unhex(sha2(\'' + qdata.ans +
    '\', 256)));';
  con.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.render('NewPassword', {
        'username': qdata.user,
        'user': req.cookies.userData.user,
      });
    } else {
      res.render('ForgotPassword', {
        'heading': 'nothing',
        'subheading': 'INCORRECT ANSWER',
        'user': req.cookies.userData.user,
        'input': 'nothing',
        'display': 'none'
      });
    }
  })
});

app.post('/change-password', urlencodedParser, function (req, res) {
  var qdata = {
    'user': req.body.user,
    'pass': req.body.pass,
    'repass': req.body.repass
  };
  if (qdata.pass == qdata.repass) {
    var sql = 'update users set password = aes_encrypt(\'' + qdata.pass +
      '\', unhex(sha2(\'' + qdata.pass + '\', 256))) where username = \'' +
      qdata.user + '\';';
    con.query(sql, function (err, result) {
      if (err) throw err;
      //       res.render('ForgotPassword', {
      //         'heading': 'nothing',
                  // 'user': req.cookies.userData.user
      //         'subheading': 'PASSWORD CHANGED SUCCESSFULLY',
      //         'input': 'nothing',
      //         'display': 'none'
      //       });
      res.redirect('/login');
    });
  } else {
    res.render('ForgotPassword', {
      'heading': 'nothing',
      'subheading': 'PASSWORD AND REPASSWORD DOES NOT MATCH',
      'input': 'nothing',
      'user': req.cookies.userData.user,
      'display': 'none'
    });
  }
})
app.post("/login",createAccountLimiter, urlencodedParser, function (req, res) {
  var qdata = {
    user: req.body.user,
    pass: req.body.pass
  };
  var sql = "select * from users where username = '" + qdata.user + "' and password = aes_encrypt('" + qdata.pass + "', unhex(sha2('" + qdata.pass + "', 256)));";
  con.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.cookie("userData", {
        user: qdata.user
      });

      res.redirect('http://localhost:8080/');

    } else {
      res.render("ForgotPassword", {
        "heading": "nothing",
        "subheading": "INVALID USERNAME OR PASSWORD",
        'user': req.cookies.userData.user,
        "input": "nothing",
        "display": "none"
      });
    }
  });
});

app.post('/signup',createAccountLimiter, urlencodedParser, function (req, res) {
  var qdata = {
    user: req.body.user,
    pass: req.body.pass,
    repass: req.body.repass,
    email: req.body.email,
    name: req.body.name,
    ques: req.body.ques,
    ans: req.body.ans
  };
  if (qdata.pass != qdata.repass) {
    res.render('ForgotPassword', {
      'heading': 'nothing',
      'subheading': 'PASSWORD AND REPASSWORD DOES NOT MATCH',
      'user': req.cookies.userData.user,
      'input': 'nothing',
      'display': 'none',
    });
    res.end();
    return;
  }
  var sql = 'select * from users where username = \'' + qdata.user + '\';';
  console.log(qdata);
  con.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.render('ForgotPassword', {
        'heading': 'nothing',
        'user': req.cookies.userData.user,
        'subheading': 'USERNAME ALREADY EXISTS',
        'input': 'nothing',
        'display': 'none'
      });
    } else {
      console.log('here');
      var query = 'insert into users values (\'' + qdata.name + '\', \'' +
        qdata.email + '\', \'' + qdata.user + '\', aes_encrypt(\'' +
        qdata.pass + '\', unhex(sha2(\'' + qdata.pass + '\', 256))), \'' +
        qdata.ques + '\', aes_encrypt(\'ans\', unhex(sha2(\'' + qdata.ans +
        '\', 256))));';
      con.query(query, function (err, result) {
        if (err) throw err;
        console.log('added data successfully');
        res.redirect('/login');
      });
    }
  });
});

app.get('/logout', function (req, res) {
  res.cookie("userData", {
    'user': "NULL"
  });
  res.redirect('/');
})

app.get('/login', function (req, res) {
  res.render('LoginPage', {
      'user': req.cookies.userData.user
  });
});

app.get('/signup', function (req, res) {
  res.render('SignUp', {
      'user': req.cookies.userData.user
  });
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

app.get('/about', function (req, res) {
  res.render('About Page', {
      'user': req.cookies.userData.user
  });
});

function home_query(req, res, sql, current_page) {
  
  var response = {
    posts: [],
    total_rows: 0,
    'user': req.cookies.userData.user,
    current_page: current_page
  }
  console.log(response);
  var total_rows = 0;
  conn.query("select count(*) from discussion;", function (err, result) {
    if (err) throw err;
    response.total_rows = result[0]["count(*)"];
    console.log(result[0]);
  });
  var posts = [];
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log("hye");
    console.log(result);
    if (result.length > 0) {
      response.posts = [];
      for (var i = 0; i < result.length; i++) {
        var tempTitle = result[i].dsc_name;
        var first_letter = "";
        first_letter = tempTitle.charAt(0);
        first_letter = first_letter.toUpperCase();
        // console.log(moment(result[i]).tz('Asia/Kolkata').format('YYYY MMMM DD HH:mm:ss'));

        var post = {
          title: tempTitle.replaceAt(0, first_letter),
          body: result[i].data,
          img: "",
          user: result[i].usr_id,
          date: moment(result[i]).format('YYYY MMMM DD'),
          disc_id: result[i].dsc_id,
          numberOfUpvotes: result[i].thanks,
          total_posts: result[i].total_posts
        };
        response.posts.push(post);
      }
      console.log(response);
      console.log(total_rows + " " + current_page);
      res.cookie("current_page", current_page);
      res.render("home", response);
    } else {
      res.cookie("current_page", current_page);
      res.render("home", response);
    }
  });
}

app.get("/dscthanks/:dscid",function (req, res) {
  dscid=req.params.dscid;
  console.log("dsc");
  
  console.log(req.cookies);
  
  user= req.cookies.userData.user;
  conn.query("insert into forum.discussion_thanks (user_id, dsc_id) SELECT * FROM ( SELECT '" + user + "','" + dscid + "' ) AS tmp WHERE NOT EXISTS ( SELECT * FROM discussion_thanks WHERE user_id = '" + user + "' AND dsc_id = '" + dscid + "' ) LIMIT 1;", function (err, result) {
    if (err) throw err;
  });
  con.query("UPDATE discussion SET thanks = ( SELECT COUNT(user_id) FROM discussion_thanks WHERE discussion_thanks.dsc_id = discussion.dsc_id);", function (err, ans) {
    if (err) throw err; 
  });
  res.redirect(req.get('referer'));
});

app.get("/home", function (req, res) {
  var sql = "";
  var change = -1;
  var current_page = parseInt(req.query.current_page);
  var total_rows = 0;
  conn.query("select count(*) from discussion", function (err, result) {
    if (err) throw err;
    total_rows = result[0]["count(*)"];
    console.log("answer: " + result[0]["count(*)"] + " " + total_rows);
    if (req.query.button == "Next") {
      change = 1;
      sql = "select * from discussion where dsc_id <= " + (total_rows - (current_page * 10)) + " and dsc_id > " + (total_rows - ((current_page + 1) * 10)) + " order by dsc_id desc;";
    } else
      sql = "select * from discussion where dsc_id > " + (total_rows - ((current_page - 1) * 10)) + " and dsc_id <= " + (total_rows - ((current_page - 2) * 10)) + " order by dsc_id desc;";
    console.log(sql);
    console.log("total_rows:" + total_rows);
    home_query(req, res, sql, current_page + change)
  });
});

app.get("/", function (req, res) {
  console.log(req.cookies);
  
  // ||req.cookies.userData.user == null
  if (req.cookies == undefined ){
      res.cookie("userData", {
      'user': null  ,
    });
  }
  conco.query("UPDATE discussion SET thanks = ( SELECT COUNT(user_id) FROM discussion_thanks WHERE discussion_thanks.dsc_id = discussion.dsc_id);", function (err, ans) {
    if (err) throw err; 
  });
  var sql = "select * from discussion order by dsc_id desc limit 10;";
  var current_page = 1;
  res.cookie("current_page", current_page);
  home_query(req, res, sql, current_page);
});

app.get('/dashboard/:user', function (req, res) {
  if (req.cookies.userData.user != "NULL") {
    res.cookie('dummy', {});
  const requestedUser = req.params.user;
  console.log(requestedUser);
    var sql = 'select * from discussion where usr_id = "' +
    requestedUser + '";';
    var posts = [];
    conn.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        posts = [];
        for (var i = 0; i < result.length; i++) {
          // console.log(moment(result[i]).tz(Asia/Kolkata).format('YYYY MMMM DD HH:mm:ss'));
          var post = {
            title: result[i].dsc_name,
            body: result[i].data,
            img: '',
            user: result[i].usr_id,
            date: moment(result[i]).format('YYYY MMMM DD'),
           
            disc_id: result[i].dsc_id
          };
          posts.push(post);
        }
        console.log(posts);
        var dash_name;
        var dash_user;
        var dash_email;
        con.query(
          'select * from users where username = "' +
          requestedUser + '";',
          function (err, details) {
            if (err) throw err;
            console.log('userdetails read');
            setdashvals(
              details[0].name, details[0].username, details[0].email);
          },
        );

        function setdashvals(vn, vu, ve) {
          dash_name = vn;
          dash_user = vu;
          dash_email = ve;
          res.render('dashboard', {
            posts: posts,
            dash_name: dash_name,
            dash_email: dash_email,
            'user': req.cookies.userData.user,
            dash_user: dash_user
          });
        }
        console.log('here');
      }
    });
  }
});


app.get('/dashboard', function (req, res) {
  console.log(req.cookies);
  if (req.cookies.userData.user != 'NULL') {
    res.cookie('dummy', {});
    var sql = 'select * from discussion where usr_id = "' +
      req.cookies.userData.user + '";';
    var posts = [];
    conn.query(sql, function (err, result) {
      if (err) throw err;
      console.log('hye');
      if (result.length > 0) {
        posts = [];
        for (var i = 0; i < result.length; i++) {
          var post = {
            title: result[i].dsc_name,
            body: result[i].data,
            img: '',
            user: result[i].usr_id,
            date: moment(result[i]).format('YYYY MMMM DD'),
            disc_id: result[i].dsc_id
          };
          posts.push(post);
        }
        console.log(posts);
        var dash_name;
        var dash_user;
        var dash_email;
        con.query(
          'select * from users where username = "' +
          req.cookies.userData.user + '";',
          function (err, details) {
            if (err) throw err;
            console.log('userdetails read');
            setdashvals(
              details[0].name, details[0].username, details[0].email);
          },
        );

        function setdashvals(vn, vu, ve) {
          dash_name = vn;
          dash_user = vu;
          dash_email = ve;
          res.render('dashboard', {
            posts: posts,
            dash_name: dash_name,
            dash_email: dash_email,
            'user': req.cookies.userData.user,
            dash_user: dash_user
          });
        }
        console.log('here');
      }
    });
  } else
    res.redirect('http://localhost:8080/login');
});

app.get('/compose', function (req, res) {
  console.log(req.cookies);
  if (req.cookies.userData.user != "NULL")
    res.render('compose', {
        'user': req.cookies.userData.user
    });
  else
    res.redirect('http://localhost:8080/login');
});

app.post('/compose', function (req, res) {
  var str = req.body.postBody;
  str = str.replace(/\r\n/g, 'char10');

  const post = {
    title: req.body.postTitle,
    titlekebab: _.kebabCase(req.body.postTitle),
    body: str,
    user: req.cookies.userData.user
  };
  console.log(post);
  var currTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  var sql =
    'insert into discussion (dsc_name,dsc_namekebab, usr_id, thanks, data, post_time) values("' +
    post.title + '","' + post.titlekebab + '", "' + post.user + '", 0, "' + post.body +
    '", current_timestamp)';
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log('discussion added successfully');
    // res.render('ForgotPassword', {
    //   'heading': 'nothing',
    //      'user': req.cookies.userData.user
    //   'subheading': 'DISCUSSION ADDED SUCCESSFULLY',
    //   'input': 'nothing',
    //   'display': 'none'
    // });
    res.redirect('/');
  });
});



app.get("/post/:title", function (req, res) {
  console.log(req.cookies);

  const requestedTitle = _.kebabCase(req.params.title);
  console.log(requestedTitle);
  res.cookie('dummy', {});
  var sql = 'select * from discussion where dsc_namekebab ="' + requestedTitle + '";';
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log('hye');
    console.log(result);
    if (result.length > 0) {
      console.log(moment(result[0]).format('YYYY MMMM DD'));
      var post = {
        title: result[0].dsc_name,
        body: result[0].data,
        img: '',
        user: result[0].usr_id,
        date: moment(result[0]).format('YYYY MMMM DD'),
        disc_id: result[0].dsc_id,
      };
      console.log(post);
      console.log("jaddu");
      var sql = "select * from comments where dsc_id = '" + result[0].dsc_id + "' order by upvote desc;";
      conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log("hye123");
        if (result.length > 0) {
          comments = [];
          for (var i = 0; i < result.length; i++) {
            var comment = {
              body: result[i].cmt,
              img: "",
              user: result[i].usr_id,
              date: moment(result[i].comment_time).format('YYYY MMMM DD HH:mm:ss'),
              disc_id: result[i].dsc_id,
              comment_id: result[i].idComments,
              upvote: result[i].upvote,
            };
            // console.log(comment);
            comments.push(comment);
          }
          // console.log(comments);
          console.log("here");

          res.render("discussion", {
            comments: comments,
            title: post.title,
            body: post.body,
            date: post.date,
            user: post.user,
            'user': req.cookies.userData.user,
          });
        } else {
          console.log("here123");

          res.render("discussion", {
            comments: 0,
            title: post.title,
            body: post.body,
            date: post.date,
            user: post.user,
            'user': req.cookies.userData.user,
          });
        }
      });
    }
  })
});


app.post("/post/:title", function (req, res) {
  if(req.cookies.userData.user!="NULL"){
  var str = req.body.postBody;
  str = str.replace(/\r\n/g, 'char10');
  let post = {
    body: str,
    user: req.cookies.userData.user,
  };
  console.log(req.params.title);

  var sql = "select * from discussion where dsc_name ='" + req.params.title + "' ;";
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log("No match found");
    if (result.length > 0) {
      var sql = "UPDATE discussion SET total_posts = total_posts+1 where dsc_name ='" + req.params.title + "';"
      conn.query(sql, function (err, result) {
        if (err) throw err;
      });
      var sql = 'insert into comments ( usr_id,dsc_id, cmt, post_time) values( "' + post.user + '","' + result[0].dsc_id + '",  "' + post.body + '", current_timestamp)';
      conn.query(sql, function (err, result) {
        if (err) throw err;
      });

    }
  });
  
}
else{res.redirect("/login")}
});



var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('##########################################################');
  console.log('#####               STARTING SERVER                  #####');
  console.log('##########################################################\n');
  console.log(`Express running → PORT ${server.address().port}`);
});
