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
    if (!rooms.hasOwnProperty(info.room)) {
        rooms[info.room] = new graffiti.Edits(info);
    }
    data = {
        'info': info,
        'edits': rooms[info.room].get_strokes()
    };

    this.emit('joined_room', data);
}

function leave_room(room) {
    if (this.room !== room) {
        return;
    }

    console.log(this.id, 'leaves', room);
    console.log('leaving', this.room);
    this.leave(this.room);
    this.room = undefined;
    edits = this.server.rooms[room];
    edits.save();
    // if (!(this.server.sockets.adapter.rooms[room])) {
    //     delete this.server.rooms[room];
    // }

    this.emit('leaved_room', room);
}

function send_stroke(stroke) {
    if (!(this.room)) {
        return;
    }
    this.server.rooms[this.room].add_stroke(stroke);
    this.server.to(this.room).emit('draw_stroke', stroke);
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
