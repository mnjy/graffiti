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
    data = {
        'room': room,
        'edits': rooms[room].get_strokes()
    };

    this.emit('joined_room', data);
}

function send_stroke(stroke) {
    if (!(this.room)) {
        return;
    }
    this.server.rooms[this.room].add_stroke(stroke);
    this.server.to(this.room).emit('draw_stroke', stroke);
    console.log(this.server.rooms[this.room].num_strokes());
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
