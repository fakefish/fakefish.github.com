var htutil = require('./htutil');
var math   = require('./math');

exports.get = function(req, res) {
	res.writeHead(200, {
		'Content-Type':'text/html'
	});
	res.end(
		htutil.page("Fibonacci", htutil.navbar(), [
			(!isNaN(req.a) ?
	  		("<p class='result'>fibonacci {a} = {fibo}</p>"
	  			.replace("{a}", Math.floor(req.a))
	  			.replace("{fibo}", math.fibonacci(Math.floor(req.a))))
	  			: ""),
	  		"<p>Enter a number to see its fibonacci</p>",
	  		"<form name = 'fibonacci' action='/fibonacci' method='get'>",
	  		"A: <input type='text' name='a' />",
	  		"<input type='submit' value='submit' />",
	  		"</form>"
	  	].join('\n'))
	);
}