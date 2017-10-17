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

$(".song").click(function(){
	$.ajax({
        type: 'GET',
        url: '/track/:uri',
		}).done(function( data ) {
			if (data != null) {
			$("#error").html( `Cannot put${data} into the playlist` );  
			}
		});
})
