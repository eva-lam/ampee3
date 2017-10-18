const express = require('express');
const app = express();
//socket io require to include http, and http include socket.io
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public', {index: 'djRoom.html'}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/djRoom.html');
});

app.get('/client', (req, res)=>{
    res.sendFile(`${__dirname}/public/index_yt_client3.html`)
});


//using event listener 'on'
//just using this emitter. We can already handle connection & disconnection
// var CLIENT_ID = [] //temp use array, later add redis
io.on('connection', (socket)=>{
    // CLIENT_ID.push(socket.id)


    console.log(' A client is connected from Chrome');
    socket.on('sendSongToPlaylist', (videoID, videoTitle) => {
      console.log(`I get: ${videoID} ${videoTitle}`)
      io.emit('addSongToPlaylist', videoID, videoTitle);
    })

    // kevin's code
    console.log(`A client is connected from Chrome. Total list ${CLIENT_ID.length}`);
    socket.on('disconnect', ()=>{
        // CLIENT_ID.splice(CLIENT_ID.indexOf(socket.id),1)
        console.log(`A client is gone from Chrome Total list ${CLIENT_ID.length}`)})

    //this 1 line will get the chat message from client
    socket.on(('chat message'), (msg)=>{
        console.log(`message received: ${msg}`)
        //this line of code send the message back to client
        io.emit('chat message',msg);
    
    })

    socket.on(('CHECKING'), (msg)=>{
        //console.log(`Check DJ time received: ${msg}`)
        //this line of code send the message back to client
        io.emit('CHECKING',msg);
        
       
    
    })

    socket.on('FIRE', (msg)=> {
        console.log(`a client start/restart playing: ${msg}`)
        io.emit('FIRE',msg);
        
      });


    
  })    





http.listen(8000, () => { console.log('server is on'); });
