const express = require('express');
const app = express();
const hb = require('express-handlebars');
const http = require('http').Server(app);
const ioo = require('socket.io')(http);
const io = ioo.of('/djroom');
const models = require('./models')
const AM3_User = models.user;
const AM3_YTlist = models.ytlist;
const AM3_SFlist = models.sflist;

var USER_INFO = {}
const room = [[]];

app.use(express.static('public', {index: 'index.html'}))

app.engine("handlebars", hb({defaultLayout: 'main'}));

app.set("view engine", "handlebars");

app.get('/', (req, res)=>{
    console.log('here')
    res.sendFile(`${__dirname}/public/index.html`)
})

app.get('/selectRoom', (req, res)=>{
    for (var user in USER_INFO){ 
        if(USER_INFO[user][1] === 'd'){
            room.push([USER_INFO[user][0], x])
        }
        console.log(`rooms in server: ${room}`)
    }

    // res.render('selectRoom', {dj: room})
    res.render('ytSelectRoom', {dj: room})
});

app.get('/dj/:id', (req, res)=>{
    if((req.params.id) === ''){
        res.sendFile(`${__dirname}/public/index_yt_dj.html`)
    }else{
        console.log("here is /dj")
        res.render('audiRoom', {room: req.params.id})
    }
});


app.get("/dj", (req, res)=>{
    
    // console.log(`get the posts id of: ${req.params.id}`)
    // res.render('Client', {blog: getInfo(req.params.id)})
    // res.sendFile(`${__dirname}/public/djRoom.html`)
    
    res.render('djRoom')
})



io.on('connection', (socket)=>{

    var current_room;

    //dj room creation and register DJ
    socket.on('new room', (room)=>{
        socket.join(room,  () => {
            let id_room_pair = Object.keys(socket.rooms); // [ <socket.id>, 'room 237' ]
            USER_INFO[id_room_pair[0].substring(8,id_room_pair[0].length)] = [id_room_pair[1], 'd'];    //'d' is dj
            for (x in USER_INFO){console.log(`dj info ${x} in room: ${USER_INFO[x]}`)}; // actual info
            
            current_room = USER_INFO[socket.id.substring(8,socket.id.length)][0];
        })
        console.log(`A new DJ is creating a room and join ${current_room}`);
        
        socket.emit('say', `hello, you joined ${current_room}`)
    })

    //client only join room
    socket.on('new client', (room)=>{
        socket.join(room,  () => {
            let id_room_pair = Object.keys(socket.rooms); // [ <socket.id>, 'room 237' ]
            USER_INFO[id_room_pair[0].substring(8,id_room_pair[0].length)] = [id_room_pair[1], 'c'];
            for (x in USER_INFO){console.log(`client info ${x} in room: ${USER_INFO[x]}`)}; // actual info
            
            current_room = USER_INFO[socket.id.substring(8,socket.id.length)][0];

            console.log('here is '+ current_room)
        })
    })

    //'say' is one of the new socket for room
    socket.on('VIDEO', (msg)=> {
        
        console.log(`DJ is trying to send this to client ${msg}`)
        io.to(current_room).emit('VIDEO',msg);
    })

    //console.log(`A client is connected from Chrome. Total list ${CLIENT_ID.length}`);
    socket.on('disconnect', ()=>{
        console.log(`DJ: ${socket.id.substring(8,socket.id.length)} is gone from Chrome. Room: ${USER_INFO[socket.id.substring(8,socket.id.length)]} is closed. Total list ${Object.keys(USER_INFO).length}`)
        delete USER_INFO[socket.id.substring(8,socket.id.length)]
    })

    //this 1 line will get the chat message from client
    socket.on(('chat message'), (msg)=>{
        console.log(`message received: ${msg}`)
        //this line of code send the message back to client
        io.to(current_room).emit('chat message',msg);
    
    })

    socket.on(('CHECKING'), (msg)=>{
        //console.log(`Check DJ time received: ${msg}`)
        //this line of code send the message back to client
        io.to(current_room).emit('CHECKING',msg);
        
       
    
    })

    socket.on('FIRE', (msg)=> {
        console.log(`a client start/restart playing: ${msg}`)
        io.to(current_room).emit('FIRE',msg);
        
    })

    socket.on('audiReqPlaylist', (roomID)=>{
        console.log(`e:audiReqPlaylist is working, requesting all songs of ${roomID}'s room `)
        AM3_YTlist.findAll({
            where:{
                DJ_room: roomID
            }
        }).then((data)=>{
            console.log(`successfully retrieve ${data.length} song(s) from DB`)
            data.forEach((song, index)=>{
                var title = song.YT_title.slice(0, 15)
                console.log(`now emit e:addSongToPlaylist for no. ${index+1}: ${title}... into playlist of Audience's browser`)
                socket.emit('addSongToPlaylist', song)
            })
        })
    })
    

    socket.on('sendSongToDB', (videoID, videoTitle, thumbnailUrl, duration, DJ_room) => {
		console.log('running sendSongToDB')
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
                    DJ_room: DJ_room      
                }
            }).then((data)=>{
                //console.log(data)
                console.log(`ROOM: ${current_room}`)
                io.to(current_room).emit('addSongToPlaylist', data.YT_video_id, data.YT_title, data.YT_video_thumbnailurl, data.YT_video_duration)
                console.log(`emit addSongToplaylist id: ${data.YT_video_id} title: ${data.YT_title} thumbnail: ${data.YT_video_thumbnailurl} duration: ${data.YT_video_duration}`)
                
            })
        })

    })

    socket.on('removeSongThatIsDone', (roomID, videoID)=>{
        console.log(`running e:removeSongThatIsDone with roomID ${roomID} and videoID ${videoID}`)
        AM3_YTlist.findOne({
            where: {
                DJ_room: roomID, 
                YT_video_id: videoID
            }
        }).then((data)=>{
            if (data) {
                console.log('found the song that is done. It is indexed at ' + data.id + ' in DB')
            }else{
                console.log('failed to find the song')
            }
            AM3_YTlist.destroy({
                where: {
                    id: data.id
                }
            }).then(()=>{
                console.log(`${videoID} is removed from DB. Now collecting songs left in DB`)
                AM3_YTlist.findAll({
                    where: {
                        DJ_room: roomID, 
                    }
                }).then((data)=>{
                    console.log(`${roomID} still has ${data.length} song(s)`)
                    for (var song in data){socket.emit('addSongToPlaylist',song)}
                    }).then(()=>{
                        console.log(`all songs of ${roomID} left in DB have been sent to client-side to append into #playlist div`)
                        socket.emit('nextSong')
                    })
        
            })
        })
    })

    socket.on('findingAllRooms', function(){
        console.log('search who are dj in USER_INFO(obj)')
        console.log(USER_INFO)
        for(var user in USER_INFO){
            var user = USER_INFO[user]
            if(user[1] === 'd'){
                console.log(user[0] + ' is a dj, now creating one room-box for his/her room')
                var roomID = user[0]
                console.log(AM3_YTlist.findOne({where: {DJ_room: roomID}}))
                AM3_YTlist.findOne({where: {DJ_room: roomID}}).then((data)=>{
                    var currSongID = data.YT_video_id
                    socket.emit('buildingRoomBox', roomID, currSongID)
                }).then(()=>{
                    console.log(`emitted buildingRoomBox for ${roomID}'s room`)
                })   
            }
		}
    })

})

http.listen(8000, () => { console.log('server is on. Port: 8000, for DJ room'); })