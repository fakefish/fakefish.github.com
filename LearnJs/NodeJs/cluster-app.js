var http = require('http');
var cluster = require('cluster');
var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello,World!\n');
});
cluster(server).set('workers',2).use(cluster.reload());