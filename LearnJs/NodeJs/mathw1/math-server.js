var htutil  = require('./htutil');
var math  = require('./math');
var express = require('express');
var util = require('util');
var app     = express();
// 书里用的是express.createServer()方法，好像新版是用
// 上面这个方法。
app.configure(function(){
	app.use(app.router);
	app.use(express.errorHandler({
		dumpExceptions: true, showStack: true
	}));
});
app.get('/fibonacci/:n', function(req, res, next) {
	math.fibonacciAsync(Math.floor(req.params.n),
  function(val) {
  	res.send({n:req.params.n, result: val});
  });
});
app.get('/factorial/:n', function(req, res, next) {
    try {
        res.send({ 
            n: req.params.n, 
            result: math.factorial(Math.floor(req.params.n))
        });
    } catch(e) { next('FACTORIAL ERROR ' + e); }
});
app.get('/mult/:a/:b', function(req, res, next) {
	res.send({
		n: req.params.a, b: req.params.b,
		result: req.params.a * req.params.b
	});
});
app.get('/square/:a', function(req, res, next) {
	res.send({
		a: req.params.a,
		result: req.params.a * req.params.a
	});
});
app.listen(3002);