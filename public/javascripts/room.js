$(document).ready(function(){

	var socket = io();
	var user = "";

	/* show all previous message */

	socket.on("previousMessage",function(previousMessage){
		console.log(previousMessage);

		previousMessage.forEach(function(text){

			$('#chat_div').prepend(text);
		});
	});


	if (localStorage.getItem("user") !== null) {
		user = localStorage.getItem("user");
		socket.emit('login', user);
	

		var url = window.location.href;
		var roomid = (url.split('room/')[1]).replace(/\s/g, "");
		var roomName = roomid.substr(0,roomid.length-3);
		$('#roomname').html(roomName.toUpperCase());	
		console.log(user + "bahira");

		/* send user and roomid to socket io */
		socket.emit("inRoom", roomid, user);

		socket.on("usersInCurrentRoom", function(users) {
			$("#onlineUsers").html('');
			users.forEach(function(eachuser) {
				$("#onlineUsers").append("<li>" + eachuser + "</li>");
			});

		});

		$("#form").submit(function() {
			var input = $("#message_input").val();
			var timestamp = moment.utc(Date.now());
			var message="<div style='margin:0;padding-left:10px;padding-right:10px'><span style='font-weight:bold;font-size:22px'>" + user + "</span>" + " : <span style='font-size:20px'>" + input+ "</span><span style='float:right'>" + timestamp.local().format('YYYY-MM-DD, hh:mm a') + "</span></div><hr>";
			
			if (input) {
				socket.emit("message", input);
				socket.emit("saveMessage",message,roomid);
			}
			$("#message_input").val('');
			return false;
		});

		socket.on("chat", function(msg) {
			var timestamp = moment.utc(msg.date); //
			
			var message="<div style='margin:0;padding-left:10px;padding-right:10px'><span style='font-weight:bold;font-size:22px'>" + msg.user + "</span>" + " : <span style='font-size:20px'>" + msg.message + "</span><span style='float:right'>" + timestamp.local().format('YYYY-MM-DD, hh:mm a') + "</span></div><hr>";
			
			$('#chat_div').prepend(message);
			// socket.emit("saveMessage",message,roomid);
			
		});


		$("#logout").click(function(){

				localStorage.removeItem('user');
				socket.emit("deleteSession",user);
				window.location.href = "http://localhost:3000";
	

		});

		socket.on("leaveRoom",function(message){
			$("#leaveNote").html(message);
			$("#leaveNote").css("color","red");

			setTimeout(function(){
				$("#leaveNote").html('');
			},4000);
		});

	}else{
		$("#nickname").html("Please Login !!!");
	}


});
