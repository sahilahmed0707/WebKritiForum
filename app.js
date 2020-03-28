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
const md5 = require('md5');
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
app.use(express.json({
  limit: '10kb'
})); // Body limit is 10

// express-rate-limit dependency
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // start blocking after 50 requests
  message: "Too many login/signup request from this IP, please try again after an hour"
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
  database: 'Forum'
});

var conco = mysql.createConnection({
  host: 'localhost',
  user: 'webkriti',
  password: '12345',
  database: 'Forum'
});


app.use(logger('dev'));

con.connect(function (err) {
  if (err) throw err;

  var sql =
    'CREATE TABLE IF NOT EXISTS `forum`.`users` ( `name` varchar(50) NOT NULL, `email` varchar(50) NOT NULL, `username` varchar(30) NOT NULL, `password` blob NOT NULL, `question` varchar(100) NOT NULL, `ans` blob NOT NULL, PRIMARY KEY (`username`) )'
  con.query(sql, function (err, result) {
    if (err) throw err;
  });
});

conn.connect(function (err) {
  if (err) throw err;

  var sql =
    'CREATE TABLE IF NOT EXISTS `forum`.`Discussion` ( `dsc_id` INT NOT NULL auto_increment,`dsc_namekebab` VARCHAR(500) NOT NULL, `dsc_name` VARCHAR(500) NOT NULL, `usr_id` VARCHAR(45) NULL, `thanks` INT, `data` text(60000) NULL, `post_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, `total_posts` INT NOT NULL DEFAULT 0, PRIMARY KEY (`dsc_id`), UNIQUE INDEX `discussion_id_UNIQUE` (`dsc_id` ASC) VISIBLE);'
  conn.query(sql, function (err, result) {
    if (err) throw err;
    if (result.length > 0) console.log('Discussion Table created');
  });
});

conco.connect(function (err) {
  if (err) throw err;

  var sql =
    'CREATE TABLE if not exists `forum`.`comments` ( `idComments` int NOT NULL AUTO_INCREMENT, `usr_id` varchar(45) DEFAULT NULL, `dsc_id` int DEFAULT NULL, `cmt` text(60000) DEFAULT NULL, `post_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `upvote` int NOT NULL DEFAULT "0", PRIMARY KEY (`idComments`), UNIQUE KEY `idComments_UNIQUE` (`idComments`) )';
  conco.query(sql, function (err, result) {
    if (err) throw err;
  });
});
var sql = 'CREATE TABLE if not exists `forum`.`comment_thanks` (`user_id` varchar(50) NOT NULL,`idCmt` int NOT NULL);';
conco.query(sql, function (err, result) {
  if (err) throw err;
});

var sql = 'CREATE TABLE if not exists `forum`.`discussion_thanks` (`user_id` varchar(50) NOT NULL,`dsc_id` int NOT NULL) ;';
conco.query(sql, function (err, result) {
  if (err) throw err;
});

var sql = "UPDATE discussion SET thanks = ( SELECT COUNT(user_id) FROM discussion_thanks WHERE discussion_thanks.dsc_id = discussion.dsc_id);"
conco.query(sql, function (err, result) {
  if (err) throw err;
});

app.get('/forgot-password', function (req, res) {
  if (req.cookies.userData.user == null || req.cookies.userData == undefined) {
    res.render('ForgotPassword', {
      'heading': 'FORGOT PASSWORD',
      'subheading': 'USERNAME',
      'user': req.cookies.userData.user,
      'input': 'user',
      'display': 'initial'
    });
  } else {
    home_query(res, req);
  }
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

function homeredirect(res, req) {
  res.redirect("/");
}

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
    'repass': req.body.repass,
  };
  if (qdata.pass == qdata.repass) {
    var sql = 'update users set password = aes_encrypt(\'' + qdata.pass +
      '\', unhex(sha2(\'' + qdata.pass + '\', 256))) where username = \'' +
      qdata.user + '\';';
    con.query(sql, function (err, result) {
      if (err) throw err;
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
app.post("/login", createAccountLimiter, urlencodedParser, function (req, res) {
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
      homeredirect(res, req);
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

app.post('/signup', createAccountLimiter, urlencodedParser, function (req, res) {
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
    'user': null
  });
  res.redirect('/');
})

app.get('/login',createAccountLimiter, function (req, res) {
  if (req.cookies.userData.user == null || req.cookies.userData == undefined) {
    res.render('LoginPage', {
      'user': req.cookies.userData.user
    });
  } else {
    homeredirect(res, req)
  }
});

app.get('/signup', createAccountLimiter,function (req, res) {
  if (req.cookies.userData.user == null || req.cookies.userData == undefined) {
    res.render('SignUp', {
      'user': req.cookies.userData.user
    });
  } else {
    homeredirect(res, req);
  }
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
  console.log(req.cookies);
  if (req.cookies == undefined||req.cookies==null) {
    res.cookie("userData", {
      'user': null,
    });
  }
  

  var response = {
    posts: [],
    total_rows: 0,
    'user': req.cookies.userData.user,
    current_page: current_page
  }

  var total_rows = 0;
  conn.query("select count(*) from discussion;", function (err, result) {
    if (err) throw err;
    response.total_rows = result[0]["count(*)"];
    console.log(result[0]);
  });
  var posts = [];
  conn.query(sql, function (err, result) {
    if (err) throw err;

    if (result.length > 0) {
      response.posts = [];
      for (var i = 0; i < result.length; i++) {
        var imgurl = md5(result[i].usr_id);
        var post = {
          title: result[i].dsc_name,
          body: result[i].data,
          img: imgurl,
          user: result[i].usr_id,
          date: moment(result[i].post_time).local().format('YYYY MMMM DD HH:mm'),
          disc_id: result[i].dsc_id,
          numberOfUpvotes: result[i].thanks,
          total_posts: result[i].total_posts
        };
        response.posts.push(post);
      }

      res.cookie("current_page", current_page);
      res.render("home", response);
    } else {
      res.cookie("current_page", current_page);
      res.render("home", response);
    }
  });
}

app.post("/editpost/:idcmt", function (req, res) {
  idcmt = req.params.idcmt;
  var str = req.body.postBody;
  str = str.replace(/\r\n/g, 'char10');
  var edt = "update `comments` set cmt =? , post_time=current_timestamp where idComments=?;";
  con.query(edt, [str, idcmt], function (err, ans) {
    if (err) throw err;
    res.redirect(req.get('referer'));
  });

});

app.get("/dltpost/:dscid/:idcmt", function (req, res) {
  idcmt = req.params.idcmt;
  dscid = req.params.dscid;
  var dlt = "delete from `comments` where idComments=?;";
  con.query(dlt, [idcmt], function (err, ans) {
    if (err) throw err;
  });

  var sql = "UPDATE discussion SET total_posts = total_posts-1 where dsc_id =?;"
  conn.query(sql, [dscid], function (err, result) {
    if (err) throw err;
    res.redirect(req.get('referer'));
  });


});

app.get("/cmtthanks/:idcmt", function (req, res) {
  if (req.cookies.userData.user != null) {
    idcmt = req.params.idcmt;
    var update = "UPDATE comments SET upvote = ( SELECT COUNT(user_id) FROM comment_thanks WHERE comment_thanks.idCmt = comments.idComments);";
    con.query(update, function (err, ans) {
      if (err) throw err;
    });

    user = req.cookies.userData.user;
    var sql = "insert into forum.comment_thanks (user_id, idCmt) SELECT * FROM ( SELECT ?,? ) AS tmp WHERE NOT EXISTS ( SELECT * FROM comment_thanks WHERE user_id = ? AND idCmt = ? ) LIMIT 1;";
    conn.query(sql, [user, idcmt, user, idcmt], function (err, result) {
      if (err) throw err;
    });

    var update = "UPDATE comments SET upvote = ( SELECT COUNT(user_id) FROM comment_thanks WHERE comment_thanks.idCmt = comments.idComments);";
    con.query(update, function (err, ans) {
      if (err) throw err;
      res.redirect(req.get('referer'));
    });

  } else
    res.redirect('/login');

});

app.get("/dscthanks/:dscid", function (req, res) {
  if (req.cookies.userData.user != null) {
    dscid = req.params.dscid;
    user = req.cookies.userData.user;
    var sql = "insert into forum.discussion_thanks (user_id, dsc_id) SELECT * FROM ( SELECT ?,? ) AS tmp WHERE NOT EXISTS ( SELECT * FROM discussion_thanks WHERE user_id = '" + user + "' AND dsc_id = '" + dscid + "' ) LIMIT 1;";
    conn.query(sql, [user, dscid], function (err, result) {
      if (err) throw err;
    });
    var update = "UPDATE discussion SET thanks = ( SELECT COUNT(user_id) FROM discussion_thanks WHERE discussion_thanks.dsc_id = discussion.dsc_id);";
    con.query(update, function (err, ans) {
      if (err) throw err;
      res.redirect(req.get('referer'));
    });

  } else
    res.redirect('/login');
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
  if (req.cookies.userData == undefined || req.cookies.userData.user == null) {
    res.cookie("userData", {
      'user': null,
    });
  }
  console.log(req.cookies.userData);
  conco.query("UPDATE discussion SET thanks = ( SELECT COUNT(user_id) FROM discussion_thanks WHERE discussion_thanks.dsc_id = discussion.dsc_id);", function (err, ans) {
    if (err) throw err;
  });
  var sql = "select * from discussion order by dsc_id desc limit 10;";
  var current_page = 1;
  res.cookie("current_page", current_page);
  home_query(req, res, sql, current_page);
});

app.get('/dashboard/:user', function (req, res) {
  if (req.cookies.userData.user != null) {
    res.cookie('dummy', {});
    const requestedUser = req.params.user;
    console.log(requestedUser);
    var sql =
      'select * from discussion where usr_id = ? ;';
    var upvotes = 0;
    var posts = [];
    conn.query(sql, [requestedUser], function (err, result) {
      if (err) throw err;
      var dashdiscount = result.length;
      if (result.length > 0) {
        posts = [];
        for (var i = 0; i < result.length; i++) {
          var imgurl = md5(result[i].usr_id);
          var post = {

            title: result[i].dsc_name,
            body: result[i].data,
            img: imgurl,
            user: result[i].usr_id,
            date: moment(result[i]).format('YYYY MMMM DD'),
            disc_id: result[i].dsc_id,
            total_posts: result[i].total_posts,
            numberOfUpvotes: result[i].thanks,
          };
          posts.push(post);
          upvotes = upvotes + result[i].thanks;
        }
        var dash_name;
        var dash_user;
        var dash_email;
        con.query('select * from users where username = ?;', [requestedUser], function (err, details) {
          if (err) throw err;
          console.log('userdetails read');
          conco.query(
            'select * from comments where usr_id = ?;', [requestedUser],
            function (err, commentcount) {
              if (err) throw err;
              console.log('comment count read');
              var commentss = [];
              for (var j = 0; j < commentcount.length; j++) {
                upvotes = upvotes + commentcount[j].upvote;
              }
              setdashvals(
                details[0].name, details[0].username, details[0].email,
                dashdiscount, commentcount.length, upvotes);
            })
        }, );

        function setdashvals(vn, vu, ve, vd, vp, vup) {
          dash_name = vn;
          dash_user = vu;
          dash_email = ve;
          dashdiscount = vd;
          commentcount = vp;
          upvotes = vup;
          console.log(posts.length);
          res.render('dashboard', {
            posts: posts,
            dash_name: dash_name,
            dash_email: dash_email,
            'user': req.cookies.userData.user,
            dash_user: dash_user,
            dashdiscount: dashdiscount,
            commentcount: commentcount,
            upvotes: upvotes
          });
        }
        console.log('here');
      }
    });
  }
});


app.get('/dashboard', function (req, res) {
  console.log(req.cookies);
  if (req.cookies.userData.user != null) {
    res.cookie('dummy', {});
    var sql = 'select * from discussion where usr_id = ?;';
    var upvotes = 0;
    var posts = [];
    conn.query(sql, [req.cookies.userData.user], function (err, result) {
      if (err) throw err;
      var dashdiscount = result.length;
      posts = [];
      for (var i = 0; i < result.length; i++) {
        var imgurl = md5(result[i].usr_id);
        var post = {
          title: result[i].dsc_name,
          body: result[i].data,
          img: imgurl,
          user: result[i].usr_id,
          date: moment(result[i]).format('YYYY MMMM DD'),
          disc_id: result[i].dsc_id,
          total_posts: result[i].total_posts,
          numberOfUpvotes: result[i].thanks,
        };
        posts.push(post);
        upvotes = upvotes + result[i].thanks;
      }
      var dash_name;
      var dash_user;
      var dash_email;
      console.log('userdetails read');
      con.query('select * from users where username = ?;', [req.cookies.userData.user], function (err, details) {
        if (err) throw err;
        conco.query(
          'select * from comments where usr_id = ?;', [req.cookies.userData.user],
          function (err, commentcount) {
            if (err) throw err;
            console.log('comment count read');
            var commentss = [];
            for (var j = 0; j < commentcount.length; j++) {
              upvotes = upvotes + commentcount[j].upvote;
            }
            setdashvals(
              details[0].name, details[0].username, details[0].email,
              dashdiscount, commentcount.length, upvotes);
          })
      });

      function setdashvals(vn, vu, ve, vd, vp, vup) {
        dash_name = vn;
        dash_user = vu;
        dash_email = ve;
        dashdiscount = vd;
        commentcount = vp;
        upvotes = vup;
        console.log(posts.length);

        if (posts.length > 0) {
          res.render('dashboard', {
            posts: posts,
            dash_name: dash_name,
            dash_email: dash_email,
            'user': req.cookies.userData.user,
            dash_user: dash_user,
            dashdiscount: dashdiscount,
            commentcount: commentcount,
            upvotes: upvotes
          });
        } else {
          res.render('dashboard', {
            posts: 0,
            dash_name: dash_name,
            dash_email: dash_email,
            'user': req.cookies.userData.user,
            dash_user: dash_user,
            dashdiscount: dashdiscount,
            commentcount: commentcount,
            upvotes: upvotes
          });
        }
      }
    });
  } else
    res.redirect('/login');
});


app.get('/compose', function (req, res) {
  if (req.cookies.userData.user != null)
    res.render('compose', {
      'user': req.cookies.userData.user
    });
  else
    res.redirect('/login');
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
  var currTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  var sql =
    'insert into discussion (dsc_name,dsc_namekebab, usr_id, data, post_time) values(?,?,?,?,current_timestamp)';
  conn.query(sql, [post.title, post.titlekebab, post.user, post.body], function (err, result) {
    if (err) throw err;
    console.log('discussion added successfully');
    res.redirect('/');
  });
});



app.get("/post/:title", function (req, res) {
  const requestedTitle = _.kebabCase(req.params.title);
  res.cookie('dummy', {});
  var sql = 'select * from discussion where dsc_namekebab = ? ;';
  conn.query(sql, [requestedTitle], function (err, result) {
    if (err) throw err;
    var imgurl = md5(result[0].usr_id);
    if (result.length > 0) {
      var sql = "select dsc_id from discussion where dsc_namekebab=?;";
      conn.query(sql, [req.params.title], function (err, result) {
        if (err) throw err;
      });
      var post = {
        title: result[0].dsc_name,
        body: result[0].data,
        img: imgurl,
        user: result[0].usr_id,
        date: moment(result[0].post_time).format('YYYY MMMM DD HH:mm'),
        disc_id: result[0].dsc_id,
        total_posts: result[0].total_posts,
        numberOfUpvotes: result[0].thanks,
      };
      console.log(post);
      var sql = "select * from comments where dsc_id = ? order by post_time desc;";
      conn.query(sql, [result[0].dsc_id], function (err, result) {
        if (err) throw err;
        console.log("hye123");
        if (result.length > 0) {
          comments = [];
          for (var i = 0; i < result.length; i++) {
            var imgurl = md5(result[i].usr_id);
            var comment = {
              body: result[i].cmt,
              img: imgurl,
              user: result[i].usr_id,
              date: moment(result[i].post_time).local().format('YYYY MMMM DD HH:mm'),
              disc_id: result[i].dsc_id,
              comment_id: result[i].idComments,
              upvote: result[i].upvote,
            };
            comments.push(comment);
          }
          res.render("discussion", {
            comments: comments,
            title: post.title,
            body: post.body,
            date: post.date,
            user_dis: post.user,
            disc_id: post.disc_id,
            img: post.img,
            total_posts: post.total_posts,
            numberOfUpvotes: post.numberOfUpvotes,
            'user': req.cookies.userData.user,
          });
        } else {
          res.render("discussion", {
            comments: 0,
            title: post.title,
            body: post.body,
            date: post.date,
            disc_id: post.disc_id,
            user_dis: post.user,
            img: post.img,
            total_posts: post.total_posts,
            numberOfUpvotes: post.numberOfUpvotes,
            'user': req.cookies.userData.user,
          });
        }
      });
    }
  })
});


app.post("/postcmt/:dscid", function (req, res) {
  if (req.cookies.userData.user != null) {
    var str = req.body.postBody;
    str = str.replace(/\r\n/g, 'char10');
    let post = {
      body: str,
      user: req.cookies.userData.user,
    };

    var sql = 'insert into comments ( usr_id,dsc_id, cmt, post_time) values(?,?,?, current_timestamp)';
    conn.query(sql, [post.user, req.params.dscid, post.body], function (err, result) {
      if (err) throw err;
    });
    var sql = "UPDATE discussion SET total_posts = total_posts+1 where dsc_id =?;"
    conn.query(sql, [req.params.dscid], function (err, result) {
      if (err) throw err;
      res.redirect(req.get('referer'));
    });


  } else {
    res.redirect("/login")
  }
});



var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('##########################################################');
  console.log('#####               STARTING SERVER                  #####');
  console.log('##########################################################\n');
  console.log(`Express running → PORT ${server.address().port}`);
});