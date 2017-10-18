const express = require('express'),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser'),
      session = require('express-session'),
      passport = require('passport'),
      axios = require('axios'),
      SpotifyStrategy = require('passport-spotify').Strategy;
      hb = require('express-handlebars');

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

const app = express();
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

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private','streaming','playlist-modify-private','playlist-read-private','playlist-read-collaborative','user-modify-playback-state'], showDialog: true}));

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/account');
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
      console.log('play button is working !')
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

//seek to position button -Seeks to the given position in the user’s currently playing track.
app.post('/seek', function(req, res){
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
      res.render('account',{"position":time})
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
        
     res.render('account',{"name":listname,"listid":playlist_id})
  }).catch((err) =>console.log('error occurs',err))
  })
});


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

              res.render('account',{"songlist":song_id,"name":data2,"listid":data1})
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
                return element.track.name
              })
              res.json({"listed_song":songName_onList})

          }).catch((err) =>console.log('track adding error occurs',err))
          
        })
  
      })
  
    });

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



app.listen(3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}