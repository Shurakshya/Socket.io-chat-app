var http = require('http').Server();
var io = require('socket.io')(http);

var usersInCurrentRoom = []; //all the users in connected rooms  
var users=[];
var rooms = ["friends", "news", "science", "family", "events", "technology"];
var client = 0;
var joinedRooms = []; //rooms user has joined
var createdRoom =[]; //room create by user

var roomId = {
	friends:"friends123",
	news   :"news123",
	science:"science123",
	family :"family123",
	events :"events123",
	technology:"technology123"
};

io.on('connection', function(socket){

	/* login with new name first time */ 

	socket.emit("createdRooms", createdRoom);

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
			joinedRooms.push(socket.room);
			console.log("joined rooms :" + joinedRooms);
			socket.emit("roomSet", "you are now connected to : " + socket.room);

			/*emit room & roomid to client */
			var roomid= getRoomId(room); 
			socket.emit('roomid' , roomid, socket.room);
			console.log("user : " + socket.username + " , room : " + socket.room);

			if(usersInCurrentRoom.indexOf(socket.username)=== -1){
				usersInCurrentRoom.push(socket.username); // push the current user to array 
			}
			
		}

	});


	/*when the user is inside the room */ 
	socket.on('inRoom', function(roomid){
		socket.emit('usersInCurrentRoom', usersInCurrentRoom);
	});

	/* chat inside chat rooms */

	socket.on('message' , function(message){
		io.to(socket.room).emit('chat' , {
			sender  : socket.username,
			message : message,
			date    : Date.now()
		});
	});


	/* User Create newRoom */ 
	socket.on('createNewRoom', function(newroomName,roomdata){
		console.log(newroomName + " :: new room created");
		newroomName = newroomName.toLowerCase().replace(/\s/g, '');
		if(rooms.indexOf(newroomName) > -1){
			socket.emit('room_exists' , 'sorry room already exists');
		}else{
			var roomid = newroomName + '123';
			roomId[newroomName] = roomid; //set roomid in roomId object 
			rooms.push(newroomName); //push roomname to rooms array

			createdRoom.push(roomdata); //push createdroom to the array

			socket.emit('newroomSet', 'new room setup');
			console.log(rooms);
			console.log(JSON.stringify(roomId));
		}

	});

	/*User when disconnects */ 
	socket.on('disconnect', function(){
		if(users.indexOf(socket.username) > -1){
			console.log(socket.username + ': user disconnected')
			users.splice(users.indexOf(socket.username) , 1);
			socket.leave(socket.room);
			console.log(users + " :length" + users.length);	
		}
	});




	/* Get room id by room name */
	function getRoomId(roomname){
		var id="";
		id=roomId[roomname]; //json lookup
		return id;
	}

});

module.exports = io;