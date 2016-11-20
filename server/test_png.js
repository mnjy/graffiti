var fs = require('fs'),
    PNG = require('node-png').PNG;

fs.createReadStream('public/images/dice.png').pipe(new PNG())
    .on('parsed', function() {
        console.log(this.data.length);
        var num_pixels = this.width * this.height;

        // for (var i=0; i<1920000;i++) {
        //     console.log(this.data[i]);
        // }

        // for (var y = 0; y < this.height; y++) {
        //     for (var x = 0; x < this.width; x++) {
        //         var idx = (this.width * y + x) << 2;
        //
        //         // invert color
        //         this.data[idx] = 255 - this.data[idx];
        //         this.data[idx+1] = 255 - this.data[idx+1];
        //         this.data[idx+2] = 255 - this.data[idx+2];
        //
        //         // and reduce opacity
        //         this.data[idx+3] = this.data[idx+3] >> 1;
        //     }
        // }
        //
        // this.pack().pipe(fs.createWriteStream('public/images/dice_out.png'));
    });
