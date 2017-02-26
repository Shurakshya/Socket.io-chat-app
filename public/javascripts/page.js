$(document).ready(function() {
	var socket = io();
	var user = "";
	/* Javascript Handling */
	$('#myroomdiv').hide();
	socket.on('connect', function() {
		console.log('check 2', socket.connected);
	});

	/* if user already  set */

	if (localStorage.getItem('user') !== null) {
		sessionName = localStorage.getItem('user');
		socket.emit('login', sessionName);
		user = sessionName;

		$("#nickname").html(user);
		$('#logout').show();

	} else {

		/* login button handle*/
		$("#login").show();
		/*if user not set */
		$('#nameModal').modal('show');
		$("#nickname").html("Please Login !!!");

		/* Name save when button click */
		$('#saveName').click(function(e) {

			var name = $('#name').val();
			var nameMatch = $('#nameMatch').val();

			if (!name && !nameMatch) {
				$('#formError').show();
				$('#formError').html("<span class='glyphicon glyphicon-question-sign'></span>Please fill all fields");
			} else if (name !== nameMatch || !name || !nameMatch) {
				$('#formError').show();
				$('#formError').html("<span class='glyphicon glyphicon-question-sign'></span>Your name didnot match.");

			} else {

				socket.emit('login', name);


			}
			return false;
		});
	}

	socket.on('username_status', function(error) {
		$('#formError').show();
		$('#formError').html(error);
		// return;
	});



	socket.on('userSet', function(data) {

		/*Save name to local storage */
		localStorage.setItem('user', data);
		$("#login").hide();
		$('#logout').show();

		user = data;
		$('#nameModal').modal('hide');
		$("#nickname").html(data);
	});

	socket.on('total_online_users', function(data) {
		console.log(data);
	});



	/* change name function with popover handling  */

	$('.popover-markup>.trigger').click(function() {
		$('#hiding').toggle();
		return false;

	});

	$('#changeNameButton').click(function() {
		var a = $('#a').val();
		var b = $('#b').val();
		console.log(a + " : " + b);
		if (!a && !b) {
			return false;
		} else if (a !== b) {

			return false;

		} else {

			socket.emit('changeName', a);
			$('#hiding').hide();
		}

		return false;
	});

	/* change name error triggers */
	socket.on("nameChangeError",function(error){
		$('#hiding').show();
		$("#nameChangeError").show();
		$("#nameChangeError").html(error);
	});


	/* Create room */

	var eachroom = "";
	$('#createRoom').on('click', function() {
		$('#roomerror').hide();
		var newroomName = $('#newroomName').val();
		eachroom = "<div class='col-sm-4'><img src='https://thumb7.shutterstock.com/display_pic_with_logo/2117717/407781241/stock-photo-chat-room-online-messaging-communication-connection-technology-concept-407781241.jpg'><hr><h1>" + newroomName + "</h1></div>";
		if (user && newroomName) {
			$('#myroomdiv').show();
			socket.emit('createNewRoom', newroomName, eachroom);


		}
		return false;

	});

	/*append new created room to div */
	socket.on('newroomSet', function(room) {
		$('#roomappend').append(eachroom);

		console.log('new room done with interface');
	});

	/*Get all created rooms and append everytime */
	socket.on('createdRooms', function(roomdata) {
		if (roomdata && roomdata.length > 0) {
			$('#myroomdiv').show();
		}
		$('#roomappend').html('');
		roomdata.forEach(function(room) {

			$('#roomappend').append(room);

		});


	});

	socket.on("dropdownRoom", function(dropdownRoomArray) {

		$("#myRooms").html('');
		dropdownRoomArray.forEach(function(roomname) {
			/* grab created rooms and add to delete list */
			$("#myRooms").append("<li><a>" + roomname + "</a></li>")
		});
	});

	/* delete room */
	$("#myRooms").on("click", 'li>a', function() {
		var roomToDelete = $(this).text();
		if (roomToDelete !== "None") {
			//delete room 
			socket.emit("deleteRoom", roomToDelete);
		}

	});



	/* handle error while creating room */
	socket.on('room_exists', function(error) {
		$('#roomerror').show();
		$('#roomerror').html(error);
	});



	/* Join room when individual room clicked */

	//get roomid of room and user clik redirect to individual room

	var roomid = "";
	socket.on('roomid', function(roomId, roomname) {
		roomid = roomId;
		window.location.href = '/room/' + roomid;

	});

	$(".row").on('click', '.col-sm-4', function() {
		//var url =  $(this).attr('href');
		// $('#chatdiv').load('../../views/chatroom.html');
		var roomName = $(this).find('h1').text();
		if (user) {
			socket.emit('joinRoom', roomName);

		}

	});


	/* logout   */
	// if(user && localStorage.getItem('user')!=null){
	$("#logout").click(function() {

		localStorage.removeItem('user');
		socket.emit("deleteSession", user);
		window.location.href = "https://shuratalk.herokuapp.com";


	});



});