function tplawesome(e, t) {res = e; for (var n = 0; n < t.length; n++) {res = res.replace(/\{\{(.*?)\}\}/g, function (e, r) {return t[n][r]})}return res}

$(function(){
	// mute autoplay video for user better select the room they want to go
	var myVideo = iframe.getElementsByClass('currSong'); 
	myVideo.mute();

	
	$('#refreshBtn').on('click', function(){
		console.log('refreshing room-boxes')
		$('#allRooms').html('')
		socket.emit('findingAllRooms')
	})

	// once the page finishes loading, request room info from server
	$('#refreshBtn').click()

	socket.on('buildingRoomBox', function(roomID, currSongID){
		if (roomID && currSongID) {console.log(`properly recevied id: ${roomID} and vidID of current song:b ${currSongID}`)} else { console.log('failed to receive roomID and currSongID'); return}
		console.log('building room box for ' + roomID)
		$.get("partial-html/room-box.html", function(template){
			$('#allRooms').append(tplawesome(
				template, [{
					"roomID": roomID,
					"videoID": currSongID
				}]
			))
		}).then(()=>{
			console.log(`built a room box for ${roomID}'s room`)
		})
	})
})
