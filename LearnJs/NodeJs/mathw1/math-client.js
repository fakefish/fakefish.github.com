var http = require('http');
var util = require('util');
[
  "/fibonacci/20", "/factorial/20","/mult/10/20", "/square/12"
].forEach(function(path) {
	var req = http.request({
		host: "localhost",
		port: 3002,
		path: path,
		method: 'GET'
	}, function(res) {
		res.on('data', function(chunk) {
			util.log('BODY:' + chunk);
		});
	});
	req.end();
})