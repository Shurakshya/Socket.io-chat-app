$(document).ready(function(){
	var socket = io();
	var user="";
	/* Javascript Handling */
	$('#myroomdiv').hide();


	/* if user already  set */ 

	if(localStorage.getItem('user') !== null){
		sessionName = localStorage.getItem('user');
		socket.emit('login', sessionName);	
	
	}else{

		/*if user not set */ 
		$('#nameModal').modal('show');

		/* Name save when button click */
		$('#saveName').click(function(){

			var name = $('#name').val();
			var nameMatch = $('#nameMatch').val();

			if(!name && !nameMatch){

				$('#formError').show();
				$('#formError').html("<span class='glyphicon glyphicon-question-sign'></span>Please fill all fields");

			}else if( name !== nameMatch || !name || !nameMatch){

				$('#formError').show();
				$('#formError').html("<span class='glyphicon glyphicon-question-sign'></span>Your name didnot match.");	

			}else{

				socket.emit('login', name);

				/*Save name to local storage */ 
				localStorage.setItem('user', name);
			
			}
			return false;
		});
	}


	socket.on('username_status', function(error){
		$('#formError').show();
		$('#formError').html(error);
	});

	socket.on('userSet' , function(data){
		user = data;
		$('#nameModal').modal('hide');
		$("#nickname").html(data);
	});
	
	socket.on('total_online_users', function(data){
		console.log(data);
	});
				


	/* change name function with popover handling  */

	$('.popover-markup>.trigger').click(function(){
		$('#hiding').toggle();
		$('#changeNameButton').click(function(){
			var a = $('#a').val();
			var b = $('#b').val();
			console.log(a +" : "+b);
			if(!a && !b ){
				return false;
			}else if(a !== b){

				return false;

			}else{

				localStorage.setItem('user', a); //set user to changed name in local storage
				socket.emit('changeName', a);
				$('#hiding').hide();
			}

			return false;
		});

		return false;
		
	});

	/* Create room */

	var eachroom="";
	$('#createRoom').on('click',function(){
		$('#roomerror').hide();
		var newroomName = $('#newroomName').val();
		eachroom = "<div class='col-sm-4'><img src='https://thumb7.shutterstock.com/display_pic_with_logo/2117717/407781241/stock-photo-chat-room-online-messaging-communication-connection-technology-concept-407781241.jpg'><hr><h1>"+newroomName+"</h1></div>";
		if(user && newroomName){
			$('#myroomdiv').show();
			socket.emit('createNewRoom' , newroomName,eachroom);
			
		}
		return false;
		
	});

	/*append new created room to div */
	socket.on('newroomSet', function(room){
		$('#roomappend').append(eachroom);
		console.log('new room done with interface');
	});

	/*Get all created rooms and append everytime */ 
	socket.on('createdRooms', function(roomdata){
		if(roomdata && roomdata.length>0){
				$('#myroomdiv').show();
		}
		
		roomdata.forEach(function(room){

			$('#roomappend').append(room);	

		});

	});


	/* handle error while creating room */
	socket.on('room_exists' , function(error){
		$('#roomerror').show();
		$('#roomerror').html(error);
	});
					


	/* Join room when individual room clicked */ 

	//get roomid of room and user clik redirect to individual room

	var roomid="";
	socket.on('roomid' , function(roomId, roomname){
		roomid = roomId;
		window.location.href = '/room/' + roomid ; 

	});

	$(".row").on('click','.col-sm-4', function(){
		var roomName = $(this).find('h1').text();
		if(user){	
			socket.emit('joinRoom', roomName);

		}

	});


	/* Chat start from here in individual room */ 

	var url = window.location.href;
	var roomid = (url.split('/room/')[1].replace(/\s/g, ''));

	socket.emit('inRoom', roomid);

	socket.on('usersInCurrentRoom', function(users){
		users.forEach(function(eachuser){
			$('#onlineUsers').append("<li>" + eachuser + "</li>");
		});


	});

	$('#form').submit(function(){
		var input = $('#message_input').val();
		if(input){
			socket.emit('message', input);
		}
		$('#message_input').val('');
		return false;
	});

	socket.on('chat' , function(message){
		$('#chat_div').append(message);
		console.log(message);
	});



});




