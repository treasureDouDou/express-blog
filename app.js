var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var index = require('./routes/index');
var api = require('./module/api.js');

var app = express();
// app.use( require('connect-history-api-fallback')());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/', index);
require("babel-core/register");

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieParser());

//允许跨域
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, access-token, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res) {
    res.set('Cache-Control', 'no-cache');
    res.set('Content-Type', 'text/html');
    res.sendfile('public/index.html');
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


var debug = require('debug')('my-application'); // debug模块
app.set('port', process.env.PORT || 3000); // 设定监听端口

// Environment sets...

//module.exports = app; //这是 4.x 默认的配置，分离了 app 模块,将它注释即可，上线时可以重新改回来

//启动监听
var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
