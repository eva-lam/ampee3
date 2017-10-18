const express = require('express');
const app = express();
//socket io require to include http, and http include socket.io
const http = require('http').Server(app);
const io = require('socket.io')(http);

const models = require('../../models')
const AM3_User = models.user;
const AM3_YTlist = models.ytlist;
const AM3_SFlist = models.sflist;

// AM3_User.findAll().then((data)=>{ 
//   console.log(data)
// });
// AM3_YTlist.findAll().then((data)=>{ 
//   console.log(data)
// });
// AM3_SFlist.findAll().then((data)=>{ 
//   console.log(data)
// });

app.use(express.static('public', {index: 'audiRoom.html'}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/audiRoom.html');
});

io.on('connection', (socket)=>{
    console.log('A client is connected and starts browsing audience room')
    
  socket.on('audiReqPlaylist', (roomID)=>{
    console.log(`e:audiReqPlaylist is working, requesting all songs of ${roomID}'s room `)
    AM3_YTlist.findAll({
      where:{
      DJ_room: roomID
      }
    }).then((data)=>{
      console.log('successfully retrieve data :' + data)
      data.forEach((song)=>{
        console.log('emit e:addSongToPlaylist for' + song.YT_title + ' into playlist')
        socket.emit('addSongToPlaylist', song)
      })
    })
  }) // e:audiReqPlaylist ends 

})

function tplawesome(e, t) {res = e; for (var n = 0; n < t.length; n++) {res = res.replace(/\{\{(.*?)\}\}/g, function (e, r) {return t[n][r]})}return res}

http.listen(6543, ()=>{console.log('server is on. Port: 6543, for audience room')})