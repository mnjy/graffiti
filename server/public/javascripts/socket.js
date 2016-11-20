var socket;

function join_room(socket, data) {
    socket.emit('join_room', data);
}

function send_stroke(socket, data) {
    socket.emit('send_stroke', data);
}

////////////////

function draw_stroke(data) {
    console.log(data);
}

////////////////

$(function () {
    socket = io.connect();
    socket.on('draw_stroke', draw_stroke);
});
