var graffiti = require('./graffiti');

// this = socket
// this.server = io
function join_room(info) {
    if (this.room == info.room) {
        return;
    }

    console.log(this.id, 'joins', info.room);
    if (this.room) {
        this.leave(this.room);
    }
    this.join(info.room);
    this.room = info.room;
    rooms = this.server.rooms;
    if (!(info.room in rooms)) {
        rooms[info.room] = new graffiti.Edits(info);
    }
    data = {
        'info': info,
        'edits': rooms[info.room].get_strokes()
    };

    this.emit('joined_room', data);
    console.log(this.server.sockets.adapter.rooms[info.room].length);
}

function leave_room(room) {
    console.log(this.id, 'leaves', room);
    this.leave(this.room);
    this.room = undefined;

    edits = this.server.rooms[room];
    if (!(this.server.sockets.adapter.rooms[room])) {
        edits.save();
        delete this.server.rooms[room];
    }

    this.emit('leaved_room', room);
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
    socket.on('leave_room', leave_room);
    socket.on('send_stroke', send_stroke);
}

module.exports = connection;
