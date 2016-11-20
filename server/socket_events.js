
// this = socket
// this.server = io

function join_room(room) {
    console.log(this.id, 'joins', room);
    this.art_room = room;
}

function send_stroke(stroke) {
    this.broadcast.to(this.art_room).emit('draw_stroke', stroke);
}

//function

////////////////////////////////////////////////////////////////////////////////

function connection(socket) {
    console.log(socket.id, 'connected');

    // add socket.on events here
    socket.on('join_room', join_room);
}

module.exports = connection;
