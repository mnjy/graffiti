var fs = require('fs'),
    PNG = require('node-png').PNG;

function Edits(_code) {
    var code = _code,
        strokes = [];

    this.add_stroke = function (stroke) {
        strokes.push(stroke);
    };

    this.num_strokes = function () {
        return strokes.length;
    };

    this.save = function () {
        // save as png with name [this.code].png
        // does so by loading file and
        // overlaying the edits
    };
}

function load_graffiti(code) {
    //
}

module.exports = {
    'Edits': Edits
}
