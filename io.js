var http = require('http').Server();
var io = require('socket.io')(http);
var moment = require('moment');
var fs = require('fs');
var usersInCurrentRoom = []; //all the users in connected rooms  
var users = []; // all users
var rooms = ["friends", "news", "science", "family", "events", "technology"];

var createdFiles = [];

var client = 0;
var joinedRooms = []; //rooms user has joined
var createdRoom = []; //room create by user actually divs arrays
var createdRoomName = []; // name of created room only 

var roomId = {
	friends: "friends123",
	news: "news123",
	science: "science123",
	family: "family123",
	events: "events123",
	technology: "technology123"
};

io.on('connection', function(socket) {

	/* login with new name first time */

	socket.emit("createdRooms", createdRoom);
	/* give created room names to client */
	socket.emit("dropdownRoom", createdRoomName);

	socket.on('login', function(username) {
		if (users.indexOf(username) > -1) {
			socket.emit('username_status', 'Sorry the username has been taken.');
		} else {
			users.push(username);
			socket.username = username;
			socket.emit('userSet', username);
			client++;

		}
	});

	io.emit('total_online_users', 'connected users' + client);

	/* Changing NickName */
	socket.on('changeName', function(newName) {
		var oldName = socket.username;
		var newName = newName;
		if (users.indexOf(newName) === -1) {
			var usersIndex = users.indexOf(oldName);
			var index2 = usersInCurrentRoom.indexOf(oldName);

			users.splice(usersIndex, 1);
			users.push(newName);

			usersInCurrentRoom.splice(index2, 1);
			usersInCurrentRoom.push(newName);

			socket.emit('userSet', newName);

		} else {
			socket.emit('nameChangeError', 'Sorry the username has been taken.');
			console.log("name has been taken ");
		}
	});

	/* User Join room */
	socket.on("joinRoom", function(room) {
		if (rooms.indexOf(room.toLowerCase().replace(/\s/g, '')) > -1) {
			room = room.toLowerCase().replace(/\s/g, '');
			// socket.join(room);
			// socket.room = room;
			joinedRooms.push(room);
			socket.emit("roomSet", "you are now connected to : " + room);

			/*emit room & roomid to client */
			var roomid = getRoomId(room);
			socket.emit('roomid', roomid, room);

		}

	});

	//When user is inside room
	socket.on("inRoom", function(roomid, user) {
		var room = findRoomById(roomid);
		socket.username = user;

		if (usersInCurrentRoom.indexOf(socket.username) === -1) {
			usersInCurrentRoom.push(socket.username); // push the current user to array 
		}

		socket.join(room);
		socket.room = room;

		/* send all users inside the room */
		io.in(socket.room).emit("usersInCurrentRoom", usersInCurrentRoom);
		console.log(usersInCurrentRoom);

		/* read file line by line */

		var path = roomid + ".txt";
		if (fs.existsSync(path)) {

			fs.readFile(path, function(err, f) {
				var array = f.toString().split('\n');
				socket.emit("previousMessage", array);

			});
		} else {
			console.log("file not found.");
		}

	}); // inRoom ends here 


	/* chat in rooms */
	socket.on("message", function(message, roomid) {

		var room = findRoomById(roomid);

		io.in(socket.room).emit("chat", {
			message: message,
			user: socket.username,
			date: moment().valueOf() //date: moment(new Date()).format('YYYY-MM-DD, hh:mm a')

		});
	});

	/* save message to text file after creating a file */

	socket.on("saveMessage", function(message, roomid) {
		var logger = fs.createWriteStream(roomid + '.txt', {
			flags: 'a' // 'a' means appending (old data will be preserved)
		});
		logger.write(message + '\n');
		if (createdFiles.indexOf(roomid + '.txt') === -1) {
			createdFiles.push(roomid + '.txt');
		} else {
			console.log("files already exists");
		}

		return;

	});

	/* User Create newRoom */
	socket.on('createNewRoom', function(newroomName, roomdata) {

		console.log(newroomName + " :: new room created");
		newroomName = newroomName.toLowerCase().replace(/\s/g, '');
		if (rooms.indexOf(newroomName) > -1) {
			socket.emit('room_exists', 'sorry room already exists');
		} else {
			var roomid = newroomName + '123';
			roomId[newroomName] = roomid; //set roomid in roomId object 
			rooms.push(newroomName); //push roomname to rooms array

			createdRoom.push(roomdata); //push createdroom to the array
			createdRoomName.push(newroomName); // collection of name of created room
			socket.emit('newroomSet', newroomName);

			/* give created room names to client */
			socket.emit("dropdownRoom", createdRoomName);

			console.log(JSON.stringify(roomId));
		}

	});

	/* Delete Room */
	socket.on("deleteRoom", function(roomToDelete) {
		if (createdRoomName.indexOf(roomToDelete) > -1) {
			createdRoom.splice(createdRoom.indexOf(roomToDelete), 1); // delete room from createdroom array
			createdRoomName.splice(createdRoom.indexOf(roomToDelete), 1);
			delete roomId[roomToDelete];
			rooms.splice(rooms.indexOf(roomToDelete), 1);

			socket.emit("createdRooms", createdRoom);
			/* give created room names to client */
			socket.emit("dropdownRoom", createdRoomName);
		} else {
			console.log("no room to delete");
		}
	});

	/* user disconnected */
	socket.on("deleteSession", function(user) {
		socket.on('disconnect', function() {

			socket.broadcast.in(socket.room).emit("leaveRoom", socket.username + " has left the room! ");

			if (usersInCurrentRoom.indexOf(socket.username) > -1) {
				usersInCurrentRoom.splice(usersInCurrentRoom.indexOf(socket.username), 1); // push the current user to array 
			}

			users.splice(users.indexOf(socket.username), 1);
			joinedRooms = [];
			/* send all users inside the room */
			io.in(socket.room).emit("usersInCurrentRoom", usersInCurrentRoom);

			socket.leave(socket.room);

			deleteFile();

			console.log("usersInCurrentRoom :  " + usersInCurrentRoom);
			console.log("total users : " + users);
		});


	});

	/* functions to return all the connected rooms of current user */
	function findRoomById(roomid) {
		for (var key in roomId) {
			if (roomId[key] == roomid) return key;
		}
		return false;
	}

	/* Get room id by room name */
	function getRoomId(roomname) {
		var id = "";
		id = roomId[roomname]; //json lookup
		return id;
	}

	/* delete file on socket disconnect */
	function deleteFile() {

		if (createdFiles.length === 0) {
			return;
		} else {
			createdFiles.forEach(function(filename) {
				if (fs.existsSync(filename)) {
					if (usersInCurrentRoom.length < 1 ) {
						//to be handled
						fs.unlink(filename);
					}


				}
			});
		}

	}

	/* disconnect*/

	// 
	// 	if (users.indexOf(socket.username) > -1) {
	// 		console.log(socket.username + ': user disconnected')
	// 		users.splice(users.indexOf(socket.username), 1);
	// 		socket.leave(socket.room);
	// 		console.log(users + " :length" + users.length);
	// 	}
	// 



});

module.exports = io;