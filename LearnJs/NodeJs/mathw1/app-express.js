var htutil  = require('./htutil');
var math    = require('./math');
var express = require('express');
var app     = express();
app.register('.html', require('ejs'));
app.set('views',__dirname + '/views');
app.set('view engine','ejs');
app.configure(function(){
	app.use(app.router);
	app.use(express.static(__dirname + '/filez'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true}));
});
app.get('/', function(req, res) {
	res.render('home.html', { title: "Math Wizard"});
});
app.get('/mult', htutil.loadParams, function(req, res) {
	if(req.a && req.b) req.result = req.a * req.b;
	res.render('mult.html', { title: "Math Wizard", req: req});
});
app.get('/square', htutil.loadParams, function(req, res) {
	if(req.a) req.result = req.a * req.a;
	res.render('square.html', { title: "Math Wizard", req: req});
});
app.get('/fibonacci', htutil.loadParams, function(req, res) {
	if(req.a) {
		var httpreq = require('http').request({
			host: "localhost",
			port: 3002,
			path: "/fibonacci/"+Math.floor(req.a).
			method:'GET'
		},function(httpresp) {
			httpresp.on('data', function (chunk) {
				var data = JSON.parse(chunk);
				req.result = data.result;
				res.render('fibo.html', {title: "Math Wizard", req: req});
			});
		});
		/*
		req.result = math.factorial(req.a);
		*/
		httpreq.end();
	} else {
		res.render('factorial.html', {title: "Math Wizard" , req: req});
	}
});
app.get('/404', function(req, res){
	res.send('NOT FOUND'+req.url);
});
app.listen(8124);
console.log('listening to http://localhost:8124');