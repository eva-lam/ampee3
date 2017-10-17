const express = require('express');
const app = express();
//socket io require to include http, and http include socket.io
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public', {index: 'newIndex.html'}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/newIndex.html');
});


//using event listener 'on'
//just using this emitter. We can already handle connection & disconnection
io.on('connection', (socket) => {

  console.log(' A client is connected from Chrome');
    socket.on('sendSongToPlaylist', (videoID, videoTitle) => {
      console.log(`I get: ${videoID} ${videoTitle}`)
      io.emit('addSongToPlaylist', videoID, videoTitle);
    })

})





http.listen(8000, () => { console.log('server is on'); });
