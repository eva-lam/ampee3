$(function(){
	var socket = io(); 
	console.log('audiRoom.js is loaded')

	$('#playlistReqBtn').on('click', function(){
		console.log('playlistReqBtn is clicked')
		console.log('clean up playlist\'s html')
		var roomID = $(this).parent().find('.roomID').attr('roomID')
		console.log(`roomID: ${roomID}. Now move to server-side to request songs of this room from DB`)
		socket.emit('audiReqPlaylist', roomID)
	})

	socket.on('addSongToPlaylist', (song)=>{
		console.log(`Playlist successfully receive: id: ${song.YT_video_id}  title: ${song.YT_title} thumbnail:${song.YT_video_thumbnailurl} and duration: ${song.YT_video_duration}`)
		$('#playlist').html('')
		$.get("partial-html/videos-on-playlist.html", function(template){
			$("#playlist").append(tplawesome(
				template, [{
					"title": song.YT_title,
					"videoID": song.YT_video_id,
					"duration": song.YT_video_duration,
				}]
			))
		}).then(()=>{
			console.log(`${song.YT_title} is added into the playlist`)
		})
	})
})





function tplawesome(e, t) {res = e; for (var n = 0; n < t.length; n++) {res = res.replace(/\{\{(.*?)\}\}/g, function (e, r) {return t[n][r]})}return res}