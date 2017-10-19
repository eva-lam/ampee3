//jquery 

$("#name_submission").click(function(event){
	event.preventDefault();
	let newName =$("#playlist_creation").val();
	$.ajax({
        type: 'POST',
		url: '/createplaylist',
		data: { playlist_name : newName}

		}).done(function( data ){
			console.log(data)
			if (data !== null){	
				$("#named_playlist").append('<h4>Playlist name: '+ data.name+ '</h4><br><h5>'+data.listid+'</h5>');
				
			}else{
				$("#error_name").html( "You might need to be a premium member to access this feature" );  
			}
		});
})

$("#play_button").click(function(){
	//ajax
	$.ajax({
        type: 'GET',
		url: '/play',
		
		}).done(function(data){
			if ( data != null ) {
			//DOM manipulation ""->refers to tag on html
			//".friends" refers to class in css
			//"#friends refers to id in css
			$("#error").html( "You might need to be a premium member to access this feature" );
			}
			$.ajax({
				type: 'GET',
				url: '/syncDJ',
				data: {}
				}).done(function( data ) {
					if (data != null) {
					$("#error").html( "You might need to be a premium member to access this feature" );  
					}
					socket.emit('sf_play', Date.now(), data)
					console.log(`emitted the first date time: ${Date.now()}`)
		
			})
							
		})
			
	});


	


$("#pause_button").click(function(){
	$.ajax({
        type: 'GET',
        url: '/pause',
		}).done(function( data ) {
			if (data != null) {
			$("#error").html( "You might need to be a premium member to access this feature" );  
			}
		});
})

$("#sync_dj").click(function(){
	$.ajax({
        type: 'GET',
		url: '/syncDJ',
		data: {}
		}).done(function( data ) {
			if (data != null) {
			$("#error").html( "You might need to be a premium member to access this feature" );  
			}
			socket.emit('sf_play', Date.now())
			console.log(`emitted the first date time: ${Date.now()}`)
		});
})

$("#sync_party").click(function(){
	$.ajax({
        type: 'GET',
        url: '/syncParty',
		}).done(function( data ) {
			if (data != null) {
			$("#error").html( "You might need to be a premium member to access this feature" );  
			}
		});
})

$("#search_btn").click(function(){
	let keyword = $(".initial_search").val(); 
	$.ajax({
        type: 'POST',
		url: '/searchtrack',
		data: { search_track : keyword}

		}).done(function( data ){
			if (data != null){
				console.log(data.songlist);
				let x= data.songlist;
				for(var i=0; i<x.length; i++){
					$(".result").append('<div class ="result_ofsearch"><h5>'+x[i].name +'</h5><br><h7>Artist: '+x[i].artists[0].name+'<h7><br><button class="song" value="'+ x[i].uri+ '">add</button>'+'<div>'); 
				}
			}else{
				$(".result").html( "You might need to be a premium member to access this feature" );  
			}
		});
})

$('.result').on('click','.song',(event) => {
// $('.song').click(function(event){
    // const username = $(e.target)[0].innerText;
	// console.log(username);
	// this = <button ...>
	// this.value 
	//below is same as above - jQuery ajax 
    $.post("/addtrack", {"uris":event.currentTarget.value},data => {
		
		$.get('/listtrack',data =>{
			
		}).done(function(data){
			console.log(data)
			console.log("added successfully")
			if(data !=null){
				//jquery clear html 
			$('#list_of_songs').html('');
			   console.log(data);
				$.each(data.listed_song,function(){
					$('#list_of_songs').append('<div class ="added"> <h5>'+this.name+'</h5><br><h7> Artist: '+this.artist+'</h7><br><br><button class= "delete_btn" value="'+this.id+'">DELETE</button></div>');
				})
			}
		})
	});
});

//delete button part 
$("#list_of_songs").on('click','.delete_btn',function(element){
	let uri_delete = $(".delete_btn").val(); 
	$.ajax({
        type: 'DELETE',
		url: '/deletetrack',
		data: { uris : uri_delete}

		}).done(function( data ){

			if (data.success){
				// $(".added").remove();
				$($('.delete_btn')[0]).parent().remove();
			    console.log("deleted song!")
			}else{
				$("#error").html( "cannot Delete!" );  
		}
	});
})

$("#seekposition_btn").click(function(){
	let seek_time = $(".seeking").val(); 

	$.ajax({
        type: 'POST',
		url: '/seek',
		data : {seek_position: seek_time}

		}).done(function( data ) {
			if (data != null) {
			$("#search_result").html( data.position );  

			}else{
			$("#error").html( "You might need to be a premium member to access this feature" ); 
			}
	});
})

// $("#get_playlist").click(function(){
// 	$.ajax({
//         type: 'GET',
//         url: '/getplaylist',
// 		}).done(function(data) {
// 			if (data != null) {
// 			$("#error").html( "You might need to be a premium member to access this feature" );  
// 			}
// 		});
// })

// $("#searching").click(function(){
// 	$.ajax({
//         type: 'GET',
//         url: '/seek',
// 		}).done(function( data ) {
// 			if (data != null) {
// 			$("#error").html( "You might need to be a premium member to access this feature" );  
// 			}
// 		});
// })
