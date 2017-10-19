var socket = io('/djroom');
socket.emit('new client', '{{room}}', "sportify");
socket.on('say', (msg)=>{$('h1').html(`<h3 style="color: white">Server say ${msg} </p></h3>`)})




/////////////////for checking lag/////////////////////////////////////
var start_time;
var lag;
var restarted;


//chk_time is the aheading time emitted by server every second
var chk_time;
socket.on('CHECKING', (msg) => {
    console.log(msg)
    chk_time = parseFloat(msg)
})
var lag_before;
var lagdiff;
socket.on('FIRE', (msg) => {
    if (yt_status < 1) {
        lag = (Date.now() - msg.substring(msg.indexOf('D') + 1, msg.length)) / 1000
        msg = msg.substring(0, msg.indexOf('D') - 1)

        console.log(`time:${msg} lag: ${lag} lag_before: ${lagdiff}`)
        lagdiff = Math.abs(lag_before -lag)
        if ( lagdiff < 0.05){
            console.log('small lag!!!', restarted)
             if(Math.abs(start_time -lag - lagdiff - msg) < 0.3) {
            $(`<div style="display: none;"><p style="color: white">PLAY!</p></div>`).appendTo($('.msgbox')).show(300);
            //fine tune loading diff in computer 150ms
            setTimeout(()=>{ player.playVideo();},100)
            
            //player.playVideo();
            restarted = false;
             }else if(player.getCurrentTime() < msg && restarted){
                
                player.pauseVideo();
                socket.emit('chat message', 'REREQUEST')
                console.log('EMITTED')
                restarted = false;

             }
        }
    }
    lag_before = lag;

})


setInterval(() => {
    $('#info').html(`<h3 style="color: white">currentTime ${player.getCurrentTime()} time difference: ${chk_time - player.getCurrentTime() + lag} </p></h3>`)
}, 1000)