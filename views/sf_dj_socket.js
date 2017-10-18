
//define socket io at the begining
var socket;


$(document).ready(() => {

    var room_title; //setup room name
    $('#room_name').on('click', () => {
        if ($('#room_text').val() != '') {
            room_title = $('#room_text').val();
            console.log(room_title)
            $('#DJ_in').modal('hide');

            //start the socket after confirmed
            socket = io('/djroom');
            socket.emit('new room', room_title);
            socket.emit('sf', "sportify client")

        } else {
            $('#warn').css('color', 'red').text('Please enter a room name')

        }
    })
})



socket.on('sf', (msg) => {
    $('#socket').html(`<h3 style="color: white">Server say ${msg} </p></h3>`)
})


//take the message from from when submit are click


// socket.on('chat message', (msg) => {
//     if (msg === 'REQUEST_NOW') {
//         socket.emit('chat message', `B${player.getCurrentTime()}D${Date.now()}NEW`)
//         fire_client();
//     } else if (msg === 'REREQUEST') {
//         console.log('DJ-restarting')
//         socket.emit('chat message', `B${player.getCurrentTime()}D${Date.now()}`)
//         fire_client();
//     }
// })

// function fire_client() {

//     var stop_si = setInterval(() => {
//         $('#fire').html(`<h3 style="color: white">Fire Time ${player.getCurrentTime()} </p></h3>`)
//         socket.emit('FIRE', `${player.getCurrentTime()}D${Date.now()}`)

//     }, 150)
//     setTimeout(() => {
//         clearInterval(stop_si)
//     }, 3500)
// }



// setInterval(() => {
//     $('#info').html(`<h3 style="color: white">currentTime ${player.getCurrentTime()} </p></h3>`)
//     socket.emit('CHECKING', player.getCurrentTime())
// }, 1000)

// //dj stop, client stop also
// function onPlayerStateChange(e) {
//     console.log(e)
//     if (e.data === 1) {
//         socket.emit('chat message', `B${player.getCurrentTime()}D${Date.now()}`)
//         fire_client()
//     }
//     if (e.data === 2) {
//         socket.emit('chat message', 'STOP')
//     }
// }




