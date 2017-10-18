const express = require('express');
const app = express();
//socket io require to include http, and http include socket.io
const http = require('http').Server(app);
const io = require('socket.io')(http);

const models = require('../../models')
const AM3_User = models.user;
const AM3_YTlist = models.ytlist;
const AM3_SFlist = models.sflist;

AM3_User.findAll().then((data)=>{
    // console.log(data)
});
AM3_YTlist.findAll().then((data)=>{
    // console.log(data)
});
AM3_SFlist.findAll().then((data)=>{
    // console.log(data)
});

app.use(express.static('public', {index: 'djRoom2.html'}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/djRoom2.html');
});


//using event listener 'on'
//just using this emitter. We can already handle connection & disconnection
// var CLIENT_ID = [] //temp use array, later add redis
io.on('connection', (socket)=>{
    // CLIENT_ID.push(socket.id)
    console.log(' A client is connected and starts browsing dj room');
    socket.on('sendSongToDB', (videoID, videoTitle, thumbnailUrl, duration, DJ_room) => {
        AM3_YTlist.create({
            YT_video_id: videoID,
            YT_title: videoTitle,
            YT_video_thumbnailurl: thumbnailUrl,
            YT_video_duration: duration,
            DJ_room: DJ_room
        }).then(()=>{
            AM3_YTlist.findOne({
                where: {
                    YT_video_id: videoID,
                    // DJ_room: DJ_room      
                }
            }).then((data)=>{
                console.log(data)
                console.log(`emit addSongToplaylist id: ${data.YT_video_id} title: ${data.YT_title} thumbnail: ${data.YT_video_thumbnailurl} duration: ${data.YT_video_duration}`)
                io.emit('addSongToPlaylist', data.YT_video_id, data.YT_title, data.YT_video_thumbnailurl, data.YT_video_duration)
            })
        })
    })



    // kevin's code
    // console.log(`A client is connected from Chrome. Total list ${CLIENT_ID.length}`);
    // socket.on('disconnect', ()=>{
    //     // CLIENT_ID.splice(CLIENT_ID.indexOf(socket.id),1)
    //     console.log(`A client is gone from Chrome Total list ${CLIENT_ID.length}`)
    // })

    //this 1 line will get the chat message from client
    // socket.on(('chat message'), (msg)=>{
    //     console.log(`message received: ${msg}`)
    //     //this line of code send the message back to client
    //     io.emit('chat message',msg);
    // })

    // socket.on(('CHECKING'), (msg)=>{
    //     //console.log(`Check DJ time received: ${msg}`)
    //     //this line of code send the message back to client
    //     io.emit('CHECKING',msg);
    // })

    // socket.on('FIRE', (msg)=> {
    //     console.log(`a client start/restart playing: ${msg}`)
    //     io.emit('FIRE',msg);
    // });
})    

http.listen(8000, () => { console.log('server is on. Port: 8000, for DJ room'); });
