var http = require('http').Server();
var io = require('socket.io')(http);
var users=[];
var rooms = ["friends", "news", "science", "family", "events", "technology"];
var client = 0;

io.on('connection', function(socket){
	/* login with new name first time */ 
	socket.on('login', function(username){
		if(users.indexOf(username) === -1){
			users.push(username);
			socket.username = username;
			socket.emit('userSet' , username);
			client++;
		}else{
			socket.emit('username_status' , 'Sorry the username has been taken.');
		}
	});

	io.emit('total_online_users', 'connected users' + client);

	/* Changing NickName */ 

	socket.on('changeName', function(newName){
		var oldName = socket.username;
		var newName = newName;
		if(users.indexOf(oldName) > -1){
			var index = users.indexOf(oldName);
			users[index] = newName;
			socket.emit('userSet', newName);
			console.log(socket.username + " : newname : " + newName);
			console.log(users);
		}else{
			socket.emit('username_status', 'Sorry the username has been taken.');
			console.log("sorry username has been taken");
		}
	});

	/* User Join room */ 

	socket.on("joinRoom", function(room) {
		if (rooms.indexOf(room.toLowerCase().replace(/\s/g, '')) > -1) {
			room=room.toLowerCase().replace(/\s/g, '');
			socket.join(room);
			socket.room = room;
			socket.emit("roomSet", "you are now connected to : " + socket.room);
			console.log("user : " + socket.username + " , room : " + socket.room);
			console.log(room.toLowerCase().replace(/\s/g, ''));
		}

	});


	/* User Create newRoom */ 
	socket.on('createNewRoom', function(newroomName){
		console.log(newroomName + " :: new room created");
		newroomName = newroomName.toLowerCase().replace(/\s/g, '');
		if(rooms.indexOf(newroomName) > -1){
			socket.emit('room_exists' , 'sorry room already exists');
		}else{
			rooms.push(newroomName);
			socket.emit('newroomSet', 'new room setup');
			console.log(rooms);
		}

	});

	// socket.on('disconnect', function(){
	// 	console.log('user disconnected');

	// });

});








module.exports = io;