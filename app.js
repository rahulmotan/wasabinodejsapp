var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var AWS = require('aws-sdk');
var app = express();

const ep = new AWS.Endpoint('s3.wasabisys.com');
const s3 = new AWS.S3({endpoint: ep});
var uuid = require('uuid');

var bucketName = 'node-sdk-example-' + uuid.v4();
var keyName = 'hello-world-from-nodejs.txt';

var bucketPromise = s3.createBucket({Bucket: bucketName}).promise();

bucketPromise.then(
    function (data) {
        // Create params for putObject call
        var objectParams = {Bucket: bucketName, Key: keyName, Body: 'Hello World From Node JS!'};
        // Create object upload promise
        var uploadPromise = s3.putObject(objectParams).promise();
        uploadPromise.then(
            function (data) {
                console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
            });
    }).catch(
    function (err) {
        console.error(err, err.stack);
    });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
