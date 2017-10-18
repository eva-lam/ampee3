//jquery 
$("#playbutton").click(function(){
	//ajax
	$.ajax({
        type: 'GET',
        url: '/play',
		}).done(function(data) {
			if ( data != null ) {
			//DOM manipulation ""->refers to tag on html
			//".friends" refers to class in css
			//"#friends refers to id in css
			$("#error").html( "You might need to be a premium member to access this feature" );
			}
		});
})

$("#pausebutton").click(function(){
	$.ajax({
        type: 'GET',
        url: '/pause',
		}).done(function( data ) {
			if (data != null) {
			$("#error").html( "You might need to be a premium member to access this feature" );  
			}
		});
})

$("#syncDJ").click(function(){
	$.ajax({
        type: 'GET',
		url: '/syncDJ',
		data: {}
		}).done(function( data ) {
			if (data != null) {
			$("#error").html( "You might need to be a premium member to access this feature" );  
			}
		});
})

$("#syncParty").click(function(){
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
				let x= data.songlist;
				for(var i=0; i<x.length; i++){
					$(".result").append('<div>'+x[i].name +'<div><button class="song" value="'+ x[i].uri+ '">add</button></div>'+'<div>'); 
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
			if(data !=null){
				//jquery clear html 
			$('#list_ofSongs').html('');
				$.each(data.listed_song,function(){
					$('#list_ofSongs').append("<h6>"+this+"<h6>");
				})
			}
		})
	});
});

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
			$("#search_result").html( "You might need to be a premium member to access this feature" ); 
			}
	});
})

$("#getplaylist").click(function(){
	$.ajax({
        type: 'GET',
        url: '/getplaylist',
		}).done(function(data) {
			if (data != null) {
			$("#error").html( "You might need to be a premium member to access this feature" );  
			}
		});
})

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
