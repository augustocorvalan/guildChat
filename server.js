var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile('static/index.html', { root: './'});
});

app.use(express.static(__dirname + '/static'));

io.on('connection', function(socket){
  socket
	  .on('chat message', function(msg){
	    socket.broadcast.emit('chat message', msg);
	  })
	  .on('started typing', function (user) {
	  	socket.broadcast.emit('started typing', user);	
	  })
	  .on('stopped typing', function (user) {
	  	socket.broadcast.emit('stopped typing', user);
	  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});