var socket;

function join_room(room, width, height) {
    socket.emit('join_room', {
        'room': room,
        'width': width,
        'height': height
    });
}

function leave_room(room) {
    socket.emit('leave_room', room);
}

function send_stroke(stroke) {
    socket.emit('send_stroke', stroke);
}

////////////////

function joined_room(data) {
    console.log('joined_room', data.info.room);
    socket.room = data.info.room;
    initDraws(data.edits);
}

function leaved_room(room) {
    console.log('leaved_room', room);
    socket.room = undefined;
}

function draw_stroke(data) {
    console.log('draw_stroke', data);
    updateDraws(data);
}

////////////////

$(function () {
    socket = io.connect();
    socket.on('draw_stroke', draw_stroke);
    socket.on('leaved_room', leaved_room);
    socket.on('joined_room', joined_room);

    var room = $('body').data('room');
    var width = $('body').data('width');
    var height = $('body').data('height');

    join_room(room, width, height);
});


// $(window).load(function () {
//     socket = io.connect();
//     socket.on('draw_stroke', draw_stroke);
//     socket.on('joined_room', joined_room);
// });
