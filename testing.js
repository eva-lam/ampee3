function onPlayerStateChange(event) {        
    if(event.data === 0) {     
        $('#playlist').html('')     
        socket.emit('removeSongThatIsDone', (roomID, videoID))
    }
}