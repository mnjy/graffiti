var fs = require('fs'),
    PNG = require('node-png').PNG;

var png = fs.createReadStream('public/images/dice.png').pipe(new PNG());
var out = png.on('parsed');
console.log(png, out);
