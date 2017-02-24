var http = require('http').Server();
var io = require('socket.io')(http);


var client = 0;

io.on('connection', function(socket){




	socket.on('disconnect', function(){
		console.log('user disconnected');

	});

});








module.exports = io;