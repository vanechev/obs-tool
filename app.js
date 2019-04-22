const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


const routes = require('./server/routes/index');
// var users = require('./routes/users');

const app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

//var fs = require('fs');
//var textlogger = fs.createWriteStream('main-log.txt', {
//flags: 'a' // 'a' means appending (old data will be preserved)
//})

/* setup socket.io */
app.use(function(req, res, next) {
  req.io = io;
  next();
});


// setup mqtt
/*
var mqtt = require('mqtt');
var url = require('url');
const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://wfejcfvu:t7Os7ERNBJ0s@m14.cloudmqtt.com:19641');
//const mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://wpancwwq:JM7WMMC9MqzM@m14.cloudmqtt.com:11474');
const auth = (mqtt_url.auth || ':').split(':');

// Create a client connection
//var mqtt_client = mqtt.connect(mqtt_url);

/*
mqtt_client.on('connect', function() { // When connected
  console.log("mqtt client connected");

  //io.on('connection',function(socket){
    //socket.on('pozyx', function(data) {
    //if(data == 'start'){
      //mqtt_client.end()
      console.log('Client started...');
      // subscribe to a topic
      mqtt_client.subscribe('tag', function() {
    // when a message arrives, send it out to the websockets
      mqtt_client.on('message', function(topic, message, packet) {
          console.log("Received '" + message + "' on '" + topic + "'");
          //textlogger.write(message+"\r\n");
          io.sockets.emit('mqtt-tag',  JSON.parse(message));
          console.log("Received '" + message + "' on '" + topic + "'");
          //textlogger.write(message+"\r\n");
          io.sockets.emit('mqtt-manikin',  JSON.parse(message));
          
      }); // end mqtt_client.on message
    });//subscribe to tag

    //}//end if
 // });// end socket.on 

  //}); //end connection
  
});//end mqtt_client connect

io.on('connection', function(socket) {
  console.log('new connection');

  socket.on('pozyx', function(data) {
    if(data == 'stop'){
      mqtt_client.unsubscribe('tag');
      console.log('Client stopped');

    }//end if
  });// end socket.on 
 });//end io.on connection
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'html');
*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));

app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = {app: app, server: server};