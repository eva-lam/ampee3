$("#playbutton").click(function(){
	$.ajax({
        type: 'GET',
        url: '/play',
		})
		.done(function(data) {
			if ( data != null ) {
			//here we use DOM manipulation ""refers to tag
			//".friends refers to class "
			//"#friends refers to id "
			$("#error").html( "You might need to be a premium member to access this feature" );
			}
		  });
})

$("#pausebutton").click(function(){
	$.ajax({
        type: 'GET',
        url: '/pause',
		})
		.done(function( data ) {
			if (data != null) {
			$("#error").html( "You might need to be a premium member to access this feature" );
			  
			}
		  });
})
