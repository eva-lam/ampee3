const express = require('express'),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser'),
      session = require('express-session'),
      passport = require('passport'),
      axios = require('axios'),
      SpotifyStrategy = require('passport-spotify').Strategy,
      hb = require('express-handlebars'),
      app = express(),
      http = require('http').Server(app)
      models = require('./models')
      AM3_User = models.user;
      AM3_YTlist = models.ytlist;
      AM3_SFlist = models.sflist;
      
    


let URL = 'http://localhost:8080';
//here we import dotenv, env must store in root directory
//we don't assign it as variable since we don't need them anymore afterwards
require('dotenv').config()
 


const redis = require('redis');
//use redis to cache spotify username and accesstoken 
const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', function(err){
    console.log(err);
});

var USER_INFO = {}
require('./server_socket.js')(http, client, USER_INFO);
//USER_INFO: contain all socket-info




// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and spotify
//   profile), and invoke a callback with a user object.

passport.use(new SpotifyStrategy({
  clientID: process.env.APP_KEY,
  clientSecret: process.env.APP_SECRET,
  callbackURL: 'http://localhost:3000/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    console.log(accessToken);
    console.log(profile);
    process.nextTick(function () {
      //store username and accesstoken in redis
      client.set(profile.username, accessToken, function(err, data) {
        if(err) {
            return console.log(err);
        }
      })
      // To keep it simple, the user's spotify profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the spotify account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }));


// configure Express
app.set('views', __dirname + '/views');

app.engine('handlebars', hb({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(cookieParser());

app.use(bodyParser());
app.use(bodyParser.urlencoded({extended:false}));

//initialize express-session 
app.use(session({ secret: 'here is a secret' }));
// Initialize Passport-- Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  // res.render('index', { user: req.user });
  res.render('index')
});

app.get('/rooms',function(req,res){
  res.render('rooms')
});

// app.get('/account', ensureAuthenticated, function(req, res){
//   res.render('account', { user: req.user });
// });

//for testing purpose only
app.get('/account', function(req, res){
  res.render('account');
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
  //res.render('choose');  //kevin temp use
});


app.get('/joinparty',function(req,res){
  res.render('joinparty')
});
// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private','streaming','playlist-modify-private','playlist-read-private','playlist-read-collaborative','user-modify-playback-state', 'user-read-currently-playing', 'user-read-playback-state'], showDialog: true}));

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('choose');
  });

app.get('/choose',function(req,res){

  const room_yt = [[]];
  const room_sp = [[]];
  
      for (var x in USER_INFO){ 
      
          if(USER_INFO[x][1] === 'd'){
            if (USER_INFO[x][2] === 'sportify'){
              room_sp.push([USER_INFO[x][0], x])}
            else {
              room_yt.push([USER_INFO[x][0], x])}
          }
      }
          
      
  
  res.render('choose', {yt: room_yt, sp: room_sp})
});


app.get('/dj/:id', (req, res)=>{
  if((req.params.id) === ''){
      res.send("you are going to room of nothing :(")
  }else{
      for (var x in USER_INFO){
        if(req.params.id === USER_INFO[x][0]){
          
          if(USER_INFO[x][2]=== 'sportify'){
            
          res.render('joinparty', {room: req.params.id})
          }else{
          res.render('audiRoom', {room: req.params.id})
          }
        }
      }
    }
      
  
});


//app.METHOD(PATH, HANDLER)
//HANDLER is function executed when the route is matched.
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//play button 
app.get('/play', function(req, res){
  const user_id = req.user.id; // same as profile.username in spotify strategy 

  client.get(user_id, (err, data) =>{
    //axios is to obtain info from third-party server 
    axios({
      //here we config axios in its default format so axios would able to process
      method: "PUT",
      url: 'https://api.spotify.com/v1/me/player/play',
      headers: {Authorization: "Bearer "+ data}

    }).then(function(response){
      console.log(`play button is working ! ${user_id}`)
      
      return user_id;
      //use send and render if need to refresh page
      res.json(null) //server-side ajax //use ajax here if dont want to refresh page 
    }).catch((err) =>{
      console.log('play button error',err)
      res.json(err)
    })
  })
});

app.get('/account/:user_id', (req, res) =>{
  //to get information it's always request 
  const user_id = req.user.id;

  //client - redis - get stored  from redis
  client.get(user_id, (err, data) =>{
      if(err || data == null) {
          //if account data doesn't exist, will get GithubData 
          getSpotifydata(user_id, res);
      } else {
          //if data exists, would just send back the data 
          res.send(data);
      }
  });
});

//pause button
app.get('/pause', function(req, res){
  const user_id = req.user.id;
  //get user_id from redis(below)
  client.get(user_id, (err, data) =>{
    axios({
      method: "PUT",
      url: 'https://api.spotify.com/v1/me/player/pause',
      headers: {Authorization: "Bearer "+ data}
      }).then(function(response){
          console.log('pause button is working !')
          res.json(null)
      }).catch((err) =>console.log('pause button error',err))
    })
});

//getplaylist button
app.get('/getplaylist', function(req, res){
  const user_id = req.user.id;
  //get user_id from redis(below)
  client.get(playlist_id,(err,data)=> {

     client.get(user_id, (err, data) =>{
      
      axios({
        method: "GET",
        url: `https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}`,
        headers: {Authorization: "Bearer "+ data}
      }).then(function(response){
          console.log('obtained playlist !')
          res.json(null)
      }).catch ((err) =>console.log('could not get playlist',err))
    })
  })
});

//seek to position button -Seeks to the given position in the user’s currently playing track.
app.post('/seek', function(req, res){
  console.log(req.body)
  const user_id = req.user.id;
  const time = req.body.seek_position; // always put name of user's input 
  //get user_id from redis(below)
  client.get(user_id, (err, data) =>{
    axios({
      method: "PUT",
      url: `https://api.spotify.com/v1/me/player/seek?position_ms=${time}`,
      headers: {Authorization: "Bearer "+ data}

    }).then(function(response){
        console.log(`seek is working at position ${time}ms !`)
        console.log(response)
        res.json({"position":time})
    }).catch((err) =>console.log('seek position error',err))
  })
});


//Create playlist 

app.post('/createplaylist',function(req,res){
  //here we use bodyparser if you want the form data to be available in req.body
  const listname = req.body.playlist_name
  const user_id = req.user.id;
  client.get(user_id, (err, data) =>{
  axios({
    method: "POST",
    url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
    headers: {Authorization: "Bearer "+ data},
    contentType: 'application/json',
    data:{"name":listname,"public":false} //for passing to the body 
  })
  .then(function(response){
    console.log(response)
    console.log("playlist created!")
    const playlist_id = response.data.id
        client.set("New Playlist",playlist_id, function(err, data) {
          if(err) {
          return console.log(err);
          }
        })
        //redis key now is playlistname
        client.set("playlistname",listname, function(err, data) {
          if(err) {
          return console.log(err);
          }
        }) 

     res.json({"name":listname,"listid":playlist_id})
  }).catch((err) =>console.log('error occurs',err))
  })
});

// client.get("New Playlist", function(err, data1) {
//   console.log(data1); 
//   if(err) {
//     return console.log(err);
//   }

//   client.get("playlistname", function(err, data2) {
//       console.log(data2); 
//       if(err) {
//         return console.log(err);
//       }
//       res.json({"songlist":song_id,"name":data2,"listid":data1})
//     })
// })
// }).catch((err) =>console.log('search error occurs',err))

app.post('/searchtrack',function(req,res){
  const item = req.body.search_track
  const listname = req.body.playlist_name
  const user_id = req.user.id; 

  client.get(user_id,(err,data)=>{
    axios({
      method:"GET",
      url:`https://api.spotify.com/v1/search?q=${item}&type=track`,
      headers:{Authorization: "Bearer "+ data},
      contentType: 'application/json',
      data:{'track':item}
    })
    .then(function(response){
      console.log("Search success!")
      const song_id = response.data.tracks.items
      let listname = '',
          playlistid = '' ;

  // NEED to render in a nested redis get because res.render respond would have responded to first info before second
      client.get("New Playlist", function(err, data1) {
          console.log(data1); 
          if(err) {
            return console.log(err);
          }

          client.get("playlistname", function(err, data2) {
              console.log(data2); 
              if(err) {
                return console.log(err);
              }
              res.json({"songlist":song_id,"name":data2,"listid":data1})
            })
        })
    }).catch((err) =>console.log('search error occurs',err))
    })
  });

app.post('/addtrack', (req, res) =>{
  let user_id = req.user.id; 
  //uris is equal to key of value of event.currentTarget...
  let uri = req.body.uris;
 //playlist_id is not stored in redis yet 
  //client - redis - get playlist id info
  client.get("New Playlist", (err, data1) =>{
 //auth and content-type required
    client.get(user_id, (err, data2)=>{
        console.log(data2); 
        if(err) {
          return console.log(err);
        }
        axios({
          method:"POST",
          url: `https://api.spotify.com/v1/users/${user_id}/playlists/${data1}/tracks`,
          headers:{Authorization: "Bearer "+ data2},
          contentType: 'application/json',
          //optional to pass uris and position 
          //here we put song_id to be added to playlist_id 
          data:{"uris":[uri]}


        }).then(function(response){
            
          res.json({"snapshotId":response.snapshot_id})

         }).catch((err) =>console.log('track adding error occurs',err))
      })

    })

  });

  app.delete('/deletetrack', (req, res) =>{
    let user_id = req.user.id; 
    //uris is equal to key of value of event.currentTarget...
    let uri = req.body.uris;
   //playlist_id is not stored in redis yet 
    //client - redis - get playlist id info
    client.get("New Playlist", (err, data1) =>{
   //auth and content-type required
      client.get(user_id, (err, data2)=>{
          console.log(data2); 
          if(err) {
            return console.log(err);
          }
          axios({
            method:"DELETE",
            url: `https://api.spotify.com/v1/users/${user_id}/playlists/${data1}/tracks`,
            headers:{Authorization: "Bearer "+ data2},
            contentType: 'application/json',
            //optional to pass uris and position 
            //here we put song_id to be added to playlist_id 
            data:{"tracks":[{"uri":uri}]}
  
          }).then(function(response){
              
            res.json({success:true});
  
           }).catch((err) =>res.json({sucess:false},err))
        })
  
      })
  
    });

  app.get('/listtrack', (req, res) =>{
      let user_id = req.user.id; //get access token value stored in redis 
      let uri = req.body.uris;
      client.get("New Playlist", (err, data1) =>{

        client.get(user_id, (err, data2)=>{
          axios({
            method:"GET",
            url: `https://api.spotify.com/v1/users/${user_id}/playlists/${data1}/tracks`,
            headers:{Authorization: "Bearer "+ data2},
            contentType: 'application/json',
            
        
          }).then(function(response){
              console.log(response.data)
   
              let songName_onList = response.data.items.map(function(element){
                return {"name": element.track.name, "artist":element.track.artists[0].name,"id":element.track.uri}
                //"artist":element.track.artists[0].name,
              })
              res.json({"listed_song":songName_onList})

          }).catch((err) =>console.log('track adding error occurs',err))
          
        })
  
      })
  
    });

app.get('/youtube', (req, res)=>{
      console.log('here')
      res.sendFile(`${__dirname}/public/indexyt.html`)
})

app.get('/selectRoom', (req, res)=>{
  var room = [[]];
    for (var user in USER_INFO){ 
        if(USER_INFO[user][1] === 'd'){
            room.push([USER_INFO[user][0], x])
        }
        console.log(`rooms in server: ${room}`)
    }

    // res.render('selectRoom', {dj: room})
    res.render('ytSelectRoom', {dj: room})
});

app.get("/djyt", (req, res)=>{
  res.render('djRoom')
})


function getSpotifySong(uri, res) {
  let song_id = uri 
  //axios is promise 

  axios.get({
    method:"GET",
    url:`https://api.spotify.com/v1/tracks/${song_id}`,
    headers:{Authorization: "Bearer "+ data},
    contentType: 'application/json',
    data:{'track':item}
  })
      .then(list => {
          //property of res there are plenty e.g. res.render 
          res.send(list.data);
          // keep data around for max 1h in case user activity updates
          //save sth to redis so that we don't have to request again from github 
          //redis can only store strings so we need to stringify 
          client.set(user_id,60*60, JSON.stringify(list.data) , (err)=>{
              if(err) console.log(err);   
          });
      })
      //part of axio promise
      .catch(err => console.log(err));
}

//get DJ playback information - by KayKay
var current_position;
var current_track_id;
var current_track_name;
var current_album_art;
var current_track_isPlaying;
var current_track_artist;
var current_track_duration;

app.get('/syncDJ', function(req, res){
  const user_id = req.user.id;
  
  client.get(user_id, (err,data) => {
  
  axios({
    method: "GET",
    url: `https://api.spotify.com/v1/me/player/currently-playing`,
    headers: {Authorization: "Bearer " + data},
  })
  .then(function(response){
    console.log(`in syncDJ get: ${response}`)
    current_position = response.data.progress_ms;
    current_track_id = response.data.item.id;
    current_track_name = response.data.item.name;
    current_album_art = response.data.item.album.images[0].url;
    current_track_duration = response.data.item.duration;
    current_track_artist = response.data.item.artists[0].name;
    current_track_isPlaying = response.data.item.is_playing;

    console.log("current playback information grabbed!");
    res.json({"songName": current_track_name, "songArt": current_album_art, "songPosition": current_position, "songDuration": current_track_duration, "songArtist": current_track_artist, "songIsPlaying": current_track_isPlaying});
  })
  .catch((err) => console.log('error occurred', err))
  })
})


app.get('/syncParty', function(req, res){
  let user_id = req.user.id;
  
   //final lag time is minus the get request above
   var final_lag = (Date.now() - res.data.date)/1000
   var final_seek_time = current_position + final_lag
   console.log(`The final seektime is: ${final_seek_time} with lag of: ${final_lag}`)

	client.get(user_id, (err, data) => {
		axios({
			method: "PUT",
			url: `https://api.spotify.com/v1/me/player/play`,
			headers: {Authorization: "Bearer " + data},
			data: {"uris": [`spotify:track:${current_track_id}`]}
		}, console.log(data))
		.then(function(response){
			axios({
				method: "PUT",
				url: `https://api.spotify.com/v1/me/player/seek?position_ms=${final_seek_time}`,
				headers: {Authorization: "Bearer " + data},
			})
			.then(function(response){
        console.log("synced with DJ!")
        res.json(null) 
			})
			.catch((err) => console.log('error occurred', err))
		})
		.catch((err) => console.log('error occurred', err))
	})
})

// exports.DJsync = function(id){
//     const user_id = id;
//     console.log(`djsync: ${user_id}`)
//   	client.get(user_id, (err,data) => {
// 		axios({
// 			method: "GET",
// 			url: `https://api.spotify.com/v1/me/player/currently-playing`,
// 			headers: {Authorization: "Bearer " + data},
// 		})
// 		.then(function(response){
// 			current_position = response.data.progress_ms;
//       current_track_id = response.data.item.id;
//       current_track_name = response.data.item.name;
// 			current_album_art = response.data.item.album.images[0].url;
// 			current_track_duration = response.data.item.duration;
// 			current_track_artist = response.data.item.artists[0].name;
// 			current_track_isPlaying = response.data.item.is_playing;

// 			console.log("current playback information grabbed!");
//       //res.json({"songName": current_track_name, "songArt": current_album_art, "songPosition": current_position, "songDuration": current_track_duration, "songArtist": current_track_artist, "songIsPlaying": current_track_isPlaying});
//       })
// 		.catch((err) => console.log('error occurred', err))
//  	 })
// }


// //sync with the same song as DJ
// exports.syncParty = function(lagtime, id){
//   let user_id = id;
//   console.log(`syncParty id: ${user_id}, lag: ${lagtime}` )
// 	client.get(user_id, (err, data) => {
// 		axios({
// 			method: "PUT",
// 			url: `https://api.spotify.com/v1/me/player/play`,
// 			headers: {Authorization: "Bearer " + data},
// 			data: {"uris": [`spotify:track:${current_track}`]}
// 		}, console.log(data))
// 		.then(function(response){

//       //final lag time is minus the get request above
//       var final_lag = (Date.now() - lagtime)/1000
//       var final_seek_time = current_position + final_lag
//       console.log(`The final seektime is: ${final_seek_time} with lag of: ${final_lag}`)
// 			axios({
// 				method: "PUT",
// 				url: `https://api.spotify.com/v1/me/player/seek?position_ms=${final_seek_time}`,
// 				headers: {Authorization: "Bearer " + data},
// 			})
// 			.then(function(response){
//         console.log("synced with DJ!")
//         //res.json(null)
//         return Date.now(); 
// 			})
// 			.catch((err) => console.log('error occurred', err))
// 		})
// 		.catch((err) => console.log('error occurred', err))
// 	})
// }

http.listen(3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}