//define socket io at the begining
var socket = io('/djroom');

// playlist in client side of DJ
var playlist = []

$(document).ready(() => {
    $('#DJ_in').modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    })

    var room_title; //setup room name
    $('#room_name').on('click', () => {
        if ($('#room_text').val() != '') {
            room_title = $('#room_text').val();
            console.log('have set roomID to ' + room_title)
            $('#DJ_in').modal('hide');

            //start the socket after confirmed 
            socket.emit('new room', room_title);
            socket.emit('dj_sync', room_title)

            // $('.roomInfo').roomID(room_title)
            $('.roomInfo').attr('roomID',room_title) 
            $('.roomInfo').text(room_title + '\'s room')

        } else {
            $('#warn').css('color', 'red').text('Please enter a room name')

        }
    })
})

// 2. This code loads the IFrame Player API code asynchronously.
var v_url = 'T4SimnaiktU';
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: v_url,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}


// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    //event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        //setTimeout(stopVideo, 6000);
        done = true;
    }
}

function stopVideo() {
    player.stopVideo();
}


socket.on('say', (msg) => {
    //$('h1').html(`<h3 style="color: white">Server say ${msg} </p></h3>`)
})

//handle next song
socket.on('nextSong', (song)=>{
    player.cueVideoById(song)
    player.playVideo(song)
    socket.emit('VIDEO', player.getVideoData()['video_id'])
    socket.emit('chat message', `B${player.getCurrentTime()}D${Date.now()}NEW`)


})

socket.on('chat message', (msg) => {
    if (msg === 'REQUEST_NOW') {
        console.log(`REQUEST_NOW ${player.getVideoData()['video_id']}`)
        socket.emit('VIDEO', player.getVideoData()['video_id'])
        socket.emit('chat message', `B${player.getCurrentTime()}D${Date.now()}NEW`)
        fire_client();
    } else if (msg === 'REREQUEST') {
        console.log('DJ-restarting')
        socket.emit('chat message', `B${player.getCurrentTime()}D${Date.now()}`)
        fire_client();
    }
})

function fire_client() {

    var stop_si = setInterval(() => {
        $('#fire').html(`<h3 style="color: white">Fire Time ${player.getCurrentTime()} </p></h3>`)
        socket.emit('FIRE', `${player.getCurrentTime()}D${Date.now()}`)

    }, 150)
    setTimeout(() => {
        clearInterval(stop_si)
    }, 3500)
}



setInterval(() => {
   // $('#info').html(`<h3 style="color: white">currentTime ${player.getCurrentTime()} </p></h3>`)
    socket.emit('CHECKING', player.getCurrentTime())
}, 1000)

//dj stop, client stop also
function onPlayerStateChange(e) {
    console.log(e)
    if (e.data === 1) {
        console.log(`REQUEST_NOW ${player.getVideoData()['video_id']}`)
        socket.emit('VIDEO', player.getVideoData()['video_id'])
        socket.emit('chat message', `B${player.getCurrentTime()}D${Date.now()}`)
        fire_client()
    }
    if (e.data === 2) {
        socket.emit('chat message', 'STOP')
    }

    if(e.data === 0) { 
        console.log('A song is done')
        // clean up playlist
        $('#playlist').html('')
        // load the rest songs from DB
        var roomID = $('.roomInfo').attr('roomID')
        var videoID = player.getVideoData()['video_id']
        console.log('prepare data to remove it from DB. roomID: ' + roomID + ' videoId: ' + videoID)     
        socket.emit('removeSongThatIsDone', roomID, videoID)
        // updating playlist arr in client side of DJ user
        playlist.push(videoID)
    }

}

socket.on('addSongToPlaylist', (videoID, videoTitle, thumbnailUrl, duration, roomID)=>{
    console.log(`Playlist successfully receive: id: ${videoID}  title: ${videoTitle} thumbnail:${thumbnailUrl} and duration: ${duration}`)
    $.get("partial-html/videos-on-playlist.html", function(template){
        $("#playlist").append(tplawesome(
            template, [{
                "title": videoTitle,
                "videoID": videoID,
                "duration": duration,
                "thumbnailUrl": thumbnailUrl,
            }]
        ))
    }).then(()=>{
        console.log(`${videoTitle} is added into the playlist`)
        
        
    })
})



