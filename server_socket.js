var main_app = require('./app.js')


module.exports = function (http, client, USER_INFO) {
    const ioo = require('socket.io')(http);

    var io = ioo.of('/djroom');
    io.on('connection', (socket) => {

        var current_room;

        //dj room creation and register DJ
        socket.on('new room', (room, program) => {
            socket.join(room, () => {
                let id_room_pair = Object.keys(socket.rooms); // [ <socket.id>, 'room 237' ]

                USER_INFO[id_room_pair[0].substring(8, id_room_pair[0].length)] = [id_room_pair[1], 'd', program]; //'d' is dj
                for (x in USER_INFO) {
                    console.log(`dj info ${x} in room: ${USER_INFO[x]}`)
                }; // actual info

                current_room = USER_INFO[socket.id.substring(8, socket.id.length)][0];
                //current_room = user_room;

            })
            console.log(`A new DJ is creating a room and join ${current_room} in ${program}`);

            io.to(current_room).emit('say', `hello, you joined ${current_room}`)

        });

        //client only join room
        socket.on('new client', (room, program) => {
            socket.join(room, () => {
                let id_room_pair = Object.keys(socket.rooms); // [ <socket.id>, 'room 237' ]
                USER_INFO[id_room_pair[0].substring(8, id_room_pair[0].length)] = [id_room_pair[1], 'c', program];
                for (x in USER_INFO) {
                    console.log(`client info ${x} in room: ${USER_INFO[x]}`)
                }; // actual info

                current_room = USER_INFO[socket.id.substring(8, socket.id.length)][0];

                console.log('here is ' + current_room + ' ' + program)
            })
        })

        //'say' is one of the new socket for room
        socket.on('VIDEO', (msg) => {

            console.log(`DJ is trying to send this to client ${msg}`)
            io.to(current_room).emit('VIDEO', msg);
        });



        // console.log(`A client is connected from Chrome. Total list ${CLIENT_ID.length}`);
        socket.on('disconnect', () => {
            if(USER_INFO[socket.id.substring(8, socket.id.length)]){
                AM3_YTlist.destroy({
                    where: {
                        DJ_room: USER_INFO[socket.id.substring(8, socket.id.length)][0]
                    }
                })
                console.log(`DJ: ${socket.id.substring(8, socket.id.length)} is gone from Chrome. Room: ${USER_INFO[socket.id.substring(8, socket.id.length)]} is closed. Total list ${Object.keys(USER_INFO).length}`)
                delete USER_INFO[socket.id.substring(8, socket.id.length)]
            }
        })

        //this 1 line will get the chat message from client
        socket.on(('chat message'), (msg) => {
            console.log(`message received: ${msg}`)
            //this line of code send the message back to client
            io.to(current_room).emit('chat message', msg);

        })

        socket.on(('CHECKING'), (msg) => {
            //console.log(`Check DJ time received: ${msg}`)
            //this line of code send the message back to client
            io.to(current_room).emit('CHECKING', msg);



        })

        socket.on('FIRE', (msg) => {
            console.log(`a client start/restart playing: ${msg}`)
            io.to(current_room).emit('FIRE', msg);

        });

        socket.on('sf_play', (date_info, data) => {
            console.log(`Sportify press DJ Resume/Play (server-fly). Time: ${date_info}`)
            // main_app.DJsync(user_id).then((dj_date_info)=>{
            //     lagtime = dj_data_info - dateinfo
            //     main_app.syncParty(lagtime, user_id)
            // })
            lagtime = Date.now() - date_info
            io.to(current_room).emit('sf_play', lagtime, data);
        })

        socket.on('audiReqPlaylist', (roomID) => {
            console.log(`------------running e:audiReqPlaylist------------`)
            AM3_YTlist.findAll({
                where: {
                    DJ_room: roomID
                }
            }).then((data) => {
                console.log(`successfully retrieve ${data.length} song(s) from DB`)
                data.forEach((song, index) => {
                    var title = song.YT_title.slice(0, 15)
                    console.log(`socket emit addSongToPlaylist for no. ${index+1}: ${title}... into playlist of Audience's browser`)
                    io.to(current_room).emit('addSongToPlaylist', song)
                })
                console.log('------------finish e:audiReqPlaylist------------')
            })
        })

        socket.on('sendSongToDB', (videoID, videoTitle, thumbnailUrl, duration, DJ_room) => {
            console.log('------------running e:sendSongToDB------------')
            AM3_YTlist.create({
                YT_video_id: videoID,
                YT_title: videoTitle,
                YT_video_thumbnailurl: thumbnailUrl,
                YT_video_duration: duration,
                DJ_room: DJ_room
            }).then(() => {
                AM3_YTlist.findOne({
                    where: {
                        YT_video_id: videoID,
                        DJ_room: DJ_room
                    }
                }).then((data) => {
                    //console.log(data)
                    console.log(`ROOM: ${current_room}`)
                    io.to(current_room).emit('addSongToPlaylist', data.YT_video_id, data.YT_title, data.YT_video_thumbnailurl, data.YT_video_duration)
                    console.log(`socket emit addSongToplaylist, param: video key ${data.YT_video_id} title ${data.YT_title} duration ${data.YT_video_duration}`)
                    console.log('------------finish e:sendSongToDB------------')
                })
            })
        })

        socket.on('removeSongThatIsDone', (roomID, videoID) => {
            console.log(`------------running e:removeSongThatIsDone------------`)
            AM3_YTlist.findOne({
                where: {
                    DJ_room: roomID,
                    YT_video_id: videoID
                }
            }).then((data) => {
                console.log('found the song that is done. It is indexed at ' + data.id + ' in DB. Destroying...')
                AM3_YTlist.destroy({
                    where: {
                        id: data.id
                    }
                })
            }).then(() => {
                console.log(`${videoID} is removed from DB. Now collecting songs left in DB`)
                AM3_YTlist.findAll({
                    where: {
                        DJ_room: roomID,
                    }
                }).then((data) => {
                    if (data.length = 0) console.log(`No song left for ${roomID}'s room`); return ;
                    console.log(`${roomID} still has ${data.length} song(s)`)
                    data.forEach((song)=>{
                        io.to(current_room).emit(
                            'addSongToPlaylist',
                            song.YT_video_id,
                            song.YT_title,
                            song.YT_video_thumbnailurl,
                            song.YT_video_duration,
                            song.DJ_room
                        )
                    })
                }).then(() => {
                    console.log(`all songs of ${roomID} left in DB have been sent to client-side to append into #playlist div`)
                    AM3_YTlist.findOne({where: {DJ_room: roomID}}).then((data)=>{
                        io.to(current_room).emit('nextSong', data.YT_video_id)
                        console.log('socket emit nextSong, param: \'YT_video_id\'')
                        console.log('------------finish e:removeSongThatIsDone------------')
                    })
                })
            })
        })



        socket.on('loadingYoutubeSelectRoomPage',  ()=>{
            console.log('------------running e:loadingYoutubeSelectRoomPage------------')
            var rooms = []
            for (var user in USER_INFO){
                if (USER_INFO[user][1] === 'd'){
                    var roomID = USER_INFO[user][0]
                    rooms.push(roomID)
                }
            }
            console.log(rooms)
            for (var room in rooms){
                // console.log(rooms[room] + ' is ' + typeof(rooms[room]))
                AM3_YTlist.findOne({where: {DJ_room: rooms[room]}
                }).then((currSong)=>{
                    socket.emit('buildingRoomBox', currSong.DJ_room, currSong.YT_video_id)
                })
            }

        })
        
        socket.on('SelectRoomfullyloaded', ()=>{
            console.log('------------finish e:loadingYoutubeSelectRoomPage------------')
        })

    })
}