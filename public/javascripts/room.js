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
		console.log(user + "bahira");
		socket.emit("inRoom", roomid, user);

		socket.on("usersInCurrentRoom", function(users) {

			users.forEach(function(eachuser) {
				$("#onlineUsers").append("<li>" + eachuser + "</li>");
			});

		});

		$("#form").submit(function() {
			var input = $("#message_input").val();

			if (input) {
				socket.emit("message", input);
			}
			$("#message_input").val('');
			return false;
		});

		socket.on("chat", function(msg) {
			var timestamp = moment.utc(msg.date); //
			var message="<div style='margin:0'><span style='font-weight:bold;font-size:22px'>" + msg.user + "</span>" + " : <span style='font-size:20px'>" + msg.message + "</span><span style='float:right'>" + timestamp.local().format('YYYY-MM-DD, hh:mm a') + "</span></div><hr>";
			$('#chat_div').prepend(message);
			socket.emit("saveMessage",message,roomid);
		});

		/* if room deleted , redirect user to home */
		socket.on("leaveroom",function(data){
			alert("Sorry!, The room has been deleted!");
			setTimeout(function(){
				window.location.href="/";
			},5000);
		});

	}else{
		$("#nickname").html("Please Login !!!");
	}


});
