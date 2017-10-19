const API_KEY = 'AIzaSyCc978T5frQ3BZzn7CXoUuLaZfTJi2UjOE'
//var socket;
function tplawesome(e, t) {res = e; for (var n = 0; n < t.length; n++) {res = res.replace(/\{\{(.*?)\}\}/g, function (e, r) {return t[n][r]})}return res}

// search-res-container: search and render song info into search result container
$(function () {
	$("#search-box").on('submit', (e) => {
		console.log('submitted keyword')
		e.preventDefault()
		// prepare the request
		var request = gapi.client.youtube.search.list({
			part: 'snippet',
			type: 'video',
			q: encodeURIComponent($('#searchKeyword').val().replace(/&20/g), '+'),
			maxResult: 10,
			order: 'viewCount'
		})
		// execute the request
		request.execute((response) => {
			var res = response.result
			// console.log(res)
			$('#search-result').html('')
			$.each(res.items, function(index, item) {
				askDurationOfVideo(item.id.videoId, function(duration){
					var thumbnailUrl = item.snippet.thumbnails.default.url
					// console.log(`thumbnail url of ${index} video ${thumbnailUrl}`)
					$.get("partial-html/videos-on-search-result.html", function (data) {
						$("#search-result").append(tplawesome(
							data, [{
								"title": item.snippet.title,
								"videoID": item.id.videoId,
								"thumbnailUrl": thumbnailUrl,
								"duration": convertTime(duration),
							}]
						))
					})
				})
			})
		})
	})
})

// playlist: render song detail into playlist
$(function () { 
	//kevin: turn off socket.io
	//socket = io(); 
	//take the message from from when submit are click
	$('body').delegate('.addSongBtn', 'click',function(){
		// preparing data for emit
		var roomID = $('.roomInfo').attr('roomid')
		var videoID = $(this).parent().attr('id')
		if(!videoID) throw new Error('cannot get video id')
		var videoTitle = $(`#${videoID} .title`).text()
		var thumbnailUrl = $(`#${videoID}`).attr('thumbnailUrl')
		var duration = $(`#${videoID} .duration`).text()
		// emit 
		socket.emit(
			'addSongToPlaylist',
			videoID, videoTitle, thumbnailUrl, duration, roomID,
		)
		socket.emit('djRoom', videoID)
			console.log(`A video is added into DB of ${roomID}'s room. videoID: ${videoID} title:${videoTitle} thumbnailUrl: ${thumbnailUrl} duration: ${duration}`)
	
		//kevin: play video after list created	
		player.cueVideoById(videoID)
		player.playVideo();
		console.log("player should play")
	
	})
})

function askDurationOfVideo(id, cb){
	var duration
	var apiLink = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${API_KEY}&part=contentDetails`
	$.get(apiLink, function(data, status){
		// console.log(data, status)
		duration = data.items[0].contentDetails.duration
		cb(duration)
		// console.log(`Duration of video id:${id} is ${duration}`)
	})
}

function convertTime(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    var h = Math.floor(duration / 3600);
    var m = Math.floor(duration % 3600 / 60);
    var s = Math.floor(duration % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

function init() {
	gapi.client.setApiKey(API_KEY)
	gapi.client.load("youtube", "v3", function () {
		// yt api is ready
	});
}

