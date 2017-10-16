$("#playbutton").click(function(){
	$.ajax({
        type: 'GET',
        url: '/play',
		})
		.done(function( data ) {
			if ( data != null ) {
			  console.log( "You might need to be a premium member to access this feature" );
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
			  console.log( "You might need to be a premium member to access this feature" );
			}
		  });
})
