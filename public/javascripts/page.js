$(document).ready(function(){
	var socket = io();
	var user="";
	/* Javascript Handling */
	$('#nameModal').modal('show');



	/* Name save when button click */
	$('#saveName').click(function(){
		var name = $('#name').val();
		var nameMatch = $('#nameMatch').val();
		if(!name && !nameMatch){
			$('#formError').show();
			$('#formError').html("<span class='glyphicon glyphicon-question-sign'></span>Please fill all fields");
		}
		else if( name !== nameMatch || !name || !nameMatch){
			$('#formError').show();
			$('#formError').html("<span class='glyphicon glyphicon-question-sign'></span>Your name didnot match.");	
		}else{
			socket.emit('login', name);
			socket.on('username_status', function(error){
				$('#formError').show();
				$('#formError').html(error);
				console.log(data);
			});
			socket.on('userSet' , function(data){
				user = data;
				$('#nameModal').modal('hide');
				$("#nickname").html(data);
			});
			socket.on('total_online_users', function(data){
				console.log(data);
			});
				
		}
		return false;
	});



	/* change name popover form */
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
				socket.emit('changeName', a);
				$('#hiding').hide();


			}
			return false;
		});
		return false;
		
	});


	/* Create room */
	var count=0; 
	var eachroom="";
	$('#createRoom').on('click',function(){
		$('#roomerror').hide();
		var newroomName = $('#newroomName').val();
		eachroom = "<div class='col-sm-4'><img src='https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQQvp2BfK3GLL6Dt0jSMOFv4Hv6NjMENnMedstBzEsjFNXOTpqf2erYle5z'><hr><h1>"+newroomName+"</h1></div>";
		socket.emit('createNewRoom' , newroomName);
		return false;

	});

	//append new created room to div 
	socket.on('newroomSet', function(room){
		$('#roomappend').append(eachroom);
		console.log('new room done with interface');
	});
	// handle error while creating room 
	socket.on('room_exists' , function(error){
		$('#roomerror').show();
		$('#roomerror').html(error);
	});
					

	

	/* Join room when individual room clicked */ 

	$(".col-sm-4").click(function(e){
		var roomName = $(this).find('h1').text();
		if(user){	
			socket.emit('joinRoom', roomName);

		}

	})

});




