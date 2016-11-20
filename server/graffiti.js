var fs = require('fs'),
    PNG = require('node-png').PNG;

function Edits(_info) {
    // info has room, width, and height
    var info = _info,
        strokes = [];

    this.add_stroke = function (stroke) {
        strokes.push(stroke);
    };

    this.num_strokes = function () {
        return strokes.length;
    };

    this.get_strokes = function () {
        return strokes;
    };

    this.clear = function () {
        strokes = [];
    };

    this.dot_to_pixels = function (dot, color, weight) {
        var x = dot.posX;
        var y = dot.posY;
        var r = Math.round(weight/2);
        var pixels = [];
        for (var i = -r; i <= r; i++) {
            for(var j = -r; j <= r; j++) {
                if (i*i + j*j <= r*r) {
                    var p = String(x+i)+"\t"+String(y+j)+"\t"+color;
                    pixels.push(p);
                }
            }
        }
        return pixels;
    };

    this.extrapolate_dots = function (dots) {
        var extra_dots = [];
        for (var i = 0; i < dots.length-1; i++) {
            var d1 = dots[i];
            var d2 = dots[i+1];
            extra_dots.push.apply(extra_dots, this.connect_dots(d1, d2));
        }
        dots.push.apply(dots, extra_dots);
    };

    this.connect_dots = function (d1, d2) {
        var new_dots = [];
        var slope = (d1.posY-d2.posY)/(d1.posX-d2.posX);

        if (isNaN(slope)) {
            return new_dots;
        } else if (!isFinite(slope)) {
            max = d1.posY >= d2.posY ? d1.posY : d2.posY;
            min = d1.posY < d2.posY ? d1.posY : d2.posY;
            diff = max - min;
            for (var y = 1; y < diff; y++) {
                new_dots.push({
                    'posX': d1.posX,
                    'posY': min+y
                });
            }
            return new_dots;
        }

        var max = d1.posX >= d2.posX ? d1.posX : d2.posX;
        var min = d1.posX < d2.posX ? d1.posX : d2.posX;
        var diff = max - min;
        for (var x = 1; x < diff; x++) {
            var xx = min+x;
            new_dots.push({
                'posX': xx,
                'posY': Math.floor(slope*xx)
            });
        }
        return new_dots;
    };

    this.stroke_to_pixel_set = function (stroke) {
        var set = new Set();
        var edits = stroke.edits;
        var color = edits.color;
        var weight = edits.weight;
        var dots = edits.dots;
        this.extrapolate_dots(dots);
        for (var i = 0; i < dots.length; i++) {
            var pixels = this.dot_to_pixels(dots[i], color, weight);
            for (var j = 0; j < pixels.length; j++) {
                set.add(pixels[j]);
            }
        }
        return set;
    };

    this.get_pixels = function () {
        'use strict';

        var pixels = new Set();
        for (var i = 0; i < strokes.length; i++) {
            for (let p of this.stroke_to_pixel_set(strokes[i])) {
                pixels.add(p);
            }
        }
        return pixels;
    };

    this.hex_to_rgb = function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    };

    this.save = function () {
        var path = 'public/images/'+info.room+'.png';
        var exists = fs.existsSync(path);
        if (exists) {
            this.save_if_present(path);
        } else {
            this.save_if_not_present(path);
        }
    };

    this.save_if_present = function (path) {
        var pixels = this.get_pixels();
        var edits = this;

        fs.createReadStream(path).pipe(new PNG()).on('parsed', function() {
                'use strict';

                for (let p of pixels) {
                    var parts = p.split('\t');
                    var x = Math.round(Number(parts[0])),
                        y = Math.round(Number(parts[1])),
                        color = parts[2];
                    var idx = (this.width * y + x) << 2;
                    var c = edits.hex_to_rgb(color);
                    this.data[idx  ] = c.r;
                    this.data[idx+1] = c.g;
                    this.data[idx+2] = c.b;
                    this.data[idx+3] = 255;
                }

            this.pack().pipe(fs.createWriteStream(path));
            edits.clear();
        });
    };

    this.save_if_not_present = function (path) {
        'use strict';

        var png = new PNG({
            width: info.width,
            height: info.height,
            filterType: -1
        });

        var pixels = this.get_pixels();
        for (let p of pixels) {
            var parts = p.split('\t');
            var x = Math.round(Number(parts[0])),
                y = Math.round(Number(parts[1])),
                color = parts[2];
            var idx = (png.width * y + x) << 2;
            var c = this.hex_to_rgb(color);
            png.data[idx  ] = c.r;
            png.data[idx+1] = c.g;
            png.data[idx+2] = c.b;
            png.data[idx+3] = 255;
        }

        png.pack().pipe(fs.createWriteStream(path));
        this.clear();
    };
}

module.exports = {
    'Edits': Edits
};
