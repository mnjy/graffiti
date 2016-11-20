var graffiti = require('./graffiti');

// this = socket
// this.server = io
function join_room(room) {
    console.log(this.id, 'joins', room);
    this.join(room);
    this.room = room;
    rooms = this.server.rooms;
    if (!(room in rooms)) {
        rooms[room] = new graffiti.Edits(room);
    }
    this.emit('joined_room', room);
}

function send_stroke(stroke) {
    console.log(this.server.rooms);
    console.log(this.room);
    console.log(stroke.room);
    this.server.rooms[this.room].add_stroke(stroke);
    this.broadcast.to(this.room).emit('draw_stroke', stroke);
    console.log(this.server.rooms.length);
}

//function

////////////////////////////////////////////////////////////////////////////////

function connection(socket) {
    console.log(socket.id, 'connected');

    // add socket.on events here
    socket.on('join_room', join_room);
    socket.on('send_stroke', send_stroke);
}

module.exports = connection;
