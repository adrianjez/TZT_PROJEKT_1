var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/** App **/
var app = express();


/** Application parts **/
var index = require('./routes/index');
var users = require('./routes/users');

/** Description **/
var about = require('./routes/about');

/** Groups **/
var groups = require('./routes/groups');

/** Students **/
var students = require('./routes/students');

/** Behaviour **/
var subjects = require('./routes/subjects');

/** Behaviours register **/
var behavioursRegister = require('./routes/behaviour_register');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/** Application parts use declaration **/
app.use('/', index);
app.use('/users', users);
app.use('/about', about);
app.use('/groups', groups);
app.use('/students', students);
app.use('/subjects', subjects);
app.use('/behaviours_register', behavioursRegister);

/** Common error handle **/
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
