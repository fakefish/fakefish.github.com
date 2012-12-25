var events = require('events');
var util   = require('util');

function Pulser(){
	events.EventEmitter.call(this);
}
util.inherits(Pulser, events.EventEmitter);

Pulser.prototype.start = function(){
	var self = this;
	this.id = setInterval(function() {
		util.log('>>>> pulse');
		self.emit('pulse');
		util.log('<<<< pulse');
	}, 1000);
}

// 实例化
var pulser = new Pulser();
pulser.on('pulse', function(){
	util.log('pulse received');
});
pulser.start();