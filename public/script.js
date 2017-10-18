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

$('.result').on('click','.song',(event) => {
// $('.song').click(function(event){
    // const username = $(e.target)[0].innerText;
	// console.log(username);
	// this = <button ...>
	// this.value 
    $.post("/addtrack", {"uris":event.currentTarget.value},data => {
		
		$.get('/listtrack',data =>{
			
		}).done(function(data){
			if(data !=null){
			$('#list_ofSongs').html('');
				$.each(data.listed_song,function(){
					$('#list_ofSongs').append("<h6>"+this+"<h6>");
				})
			}
		})
	});
});

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
