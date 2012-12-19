var connect = require('connect');
var htutil = require('./htutil');

connect.createServer()
  .use(connect.favicon())
  .use(connect.logger())
  .use('/filez', connect.static(__dirname + '/filez'))
  .use(connect.router(function(app){
  	app.get('/',
  	  require('./home-node').get);
  	app.get('/square', htutil.loadParams,
  	  require('./square-node').get);
  	app.get('/factorial-node'.htutil.loadParams,
  	  require('./factorial-node').get);
  	app.get('/fibonacci', htutil.loadParams,
      require('./fibo2-node').get);
  	app.get('/mult', htutil.loadParams,
  	  require('./mult-node').get);
  })).listen(8124);
console.log('listening to http://localhost:8124');