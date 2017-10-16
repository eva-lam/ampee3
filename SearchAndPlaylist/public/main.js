function tplawesome(e, t) {
	res = e;
	for (var n = 0; n < t.length; n++) {
		res = res.replace(/\{\{(.*?)\}\}/g, function (e, r) {
			return t[n][r]
		})
	}
	return res
}

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
			console.log(res)
			$('#search-result').html('')
			$.each(res.items, function (index, item) {
				var thumbnailUrl = item.snippet.thumbnails.default.url
				console.log(`thumbnail url of ${index} video ${thumbnailUrl}`)
				$.get("partial-html/videos-on-search-result.html", function (data) {
					$("#search-result")
						.append(tplawesome(
							data, [{
								"title": item.snippet.title,
								"videoid": item.id.videoId,
							}]
						));
					// var thumbnail = `<img src=${item.snippet.thumbnails.default.url}>`
					// $(`<img src=${thumbnailUrl}>`).appendTo(".videoInfo")
				});
			});
		})
	})
})


// $('.addSongBtn').click(()=>{
// 	console.log('an addSong button is clicked ')
// 	queueSong()
// })


function queueSong(){
	console.log('a song is queueing')
}

function init() {
	gapi.client.setApiKey("AIzaSyCc978T5frQ3BZzn7CXoUuLaZfTJi2UjOE")
	gapi.client.load("youtube", "v3", function () {
		// yt api is ready
	});
}
