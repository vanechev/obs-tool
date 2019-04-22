var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('log-1.txt');


lr.on('error', function (err) {
	// 'err' contains error object
});

lr.on('line', function (line) {
	// 'line' contains the current line without the trailing newline character.

	//var location = JSON.parse(line);
  //console.log('Line from file:', location.x);


var http = require("http");
var options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/location/insertLocationPoint',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
  }
};
var req = http.request(options, function(res) {
  console.log('Status: ' + res.statusCode);
  console.log('Headers: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (body) {
    console.log('Body: ' + body);
  });
});
req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});
// write data to request body
var location_data = JSON.parse(line);
var obj = {
        id_session : 34,
        id : location_data.id,
        x: location_data.x,
        y: location_data.y,
        timestamp: location_data.timestamp
      };
//console.log(JSON.stringify(obj));
req.write(JSON.stringify(obj));
req.end();
//var jsonContent = JSON.parse(contents);
});


lr.on('end', function () {
	// All lines are read, file is closed now.
});