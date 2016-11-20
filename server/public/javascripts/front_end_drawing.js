/**
 TODO:
 DONE:
 - if mosue not moved, do nothing
 - one curve: mouse press - mouse release
 - sliders: change stroke's color and weight
    - change strokeWeight
    - change color
    - avoid any drawing on button areas
  - buttons:
    - undo
    - clear
  - style the slider
   - show color
 **/

// store all edits info
var allEdits = [];
// containing current edits info
var currentEdits = {};
var weightSlider, colorSlider, undoButton, clearButton;
var weightArray = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 30, 40, 60];
var weightAmount = weightArray.length;
var colorArray = ["#ff4d4d", "#ff824d", "#ffb84d", "#ffed4d", "#dbff4d"
                , "#a6ff4d", "#70ff4d", "#4dff5e", "#4dff94", "#4dffc9"
                , "#4dffff", "#4dc9ff", "#4d94ff", "#4d5eff", "#704dff"
                , "#a64dff", "#db4dff", "#ff4ded", "#ff4db8", "#ff4d82"
                , "#ffffff", "#000000"];
var colorAmount = colorArray.length;
var colorIndex = 0;
var weightIndex = 0;
var barTopOrBottom, barLeftOrRight, weightEachGap, colorEachGap, weightBox, colorBox;
// run once before draw()
function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  // init the object containing current edits info
  initCurrentEdits();
  // button - undo
  undoButton = createButton('undo');
  styleButton(undoButton, width*0.9, 0);
  undoButton.mousePressed(undoEvent);
  // button - clear
  clearButton = createButton('clear');
  styleButton(clearButton, width*0.9, 20);
  clearButton.mousePressed(clearEvent);

  barTopOrBottom = height * 0.2;
  barLeftOrRight = width * 0.05;
  weightEachGap = (height-barTopOrBottom*2) / (weightAmount-1);
  colorEachGap = (height-barTopOrBottom*2) / (colorAmount-1);
  weightBox = {left: 0, right: barLeftOrRight, top: barTopOrBottom, bottom: height-barTopOrBottom};
  colorBox = {left: width-barLeftOrRight*2, right: width, top: barTopOrBottom, bottom: height-barTopOrBottom};

}
var ifJoinedRoomForTesting = false;
// run forever
function draw() {
  if (deviceOrientation) text(deviceOrientation, width/2, height/2);
  background(51);

  // keep what you've drawn on the canvas
  for (var i = 0; i < allEdits.length; i++) {
    drawEdits(allEdits[i]);
  }

  // set color and weight
  // currentEdits.color = colorArray[colorIndex];
  currentEdits.color = colorArray[colorIndex];
  currentEdits.weight = weightArray[weightIndex];
  // if mouse has not been moved, do nothing
  // else, push current coordinates to "currentEdits"
  var edit;
  // if (mouseX != pmouseX && mouseY != pmouseY) {
  if ((touchIsDown || mouseIsPressed)
    && !ifInsideBox(colorBox)
    && !ifInsideBox(weightBox)) {
    edit = {
      "posX": touchX || mouseX,
      "posY": touchY || mouseY
    };
    currentEdits.dots.push(edit);
  }
  // draw what you're drawing right now
  drawEdits(currentEdits);

  // display weight
  fill(color(currentEdits.color));
  for (var i = 0; i < weightAmount; i++) {
    noStroke();
    if (i == weightIndex) {
      strokeWeight(5);
      stroke(0);
    }
    ellipse(barLeftOrRight, barTopOrBottom + weightEachGap * i, weightArray[i]);
  }
  if (ifInsideBox(weightBox)) {
    weightIndex = Math.round((mouseY - barTopOrBottom) / weightEachGap);
  }

  // display color
  noStroke();
  var a = [];
  for (var i = 0; i < colorAmount; i++) {
    if (i == colorIndex) {
      var c = HEXtoRGB(colorArray[i]);
      fill(color(c.r, c.g, c.b, 100));
    } else {
      fill(colorArray[i]);
    }
    rect(width-barLeftOrRight*2, barTopOrBottom+colorEachGap*i, barLeftOrRight*2, colorEachGap);
  }
  if (ifInsideBox(colorBox)) {
    colorIndex = Math.round((mouseY - barTopOrBottom) / colorEachGap);
  }
  noFill();
}

function ifInsideBox(box) {
  return mouseX >= box.left
      && mouseX <= box.right
      && mouseY >= box.top
      && mouseY <= box.bottom;
}

/*** event handler funcs ***/
// built-in mouseReleased event handler
function mouseReleased() {

  // for tetsing only
  if (!ifJoinedRoomForTesting) {
    join_room("test", width, height);
    ifJoinedRoomForTesting = true;
  }

  if (currentEdits.dots.length) {

    // allEdits.push(currentEdits);
    send_stroke({
      'timestamp': new Date().getTime(),
      'room': socket.room,
      'edits': currentEdits
    });
    initCurrentEdits();
  }
}

function touchEnded() {

  // for tetsing only
  if (!ifJoinedRoomForTesting) {
    join_room("test", width, height);
    ifJoinedRoomForTesting = true;
  }

  // if is mobile
  if (typeof window.orientation !== 'undefined') {
    if (currentEdits.dots.length) {
      allEdits.push(currentEdits);

      send_stroke({
        'timestamp': new Date().getTime(),
        'room': socket.room,
        'edits': currentEdits
      });
      initCurrentEdits();
    }
  }
}

// function keyPressed() {
//   saveCanvas('myCanvas', 'jpg');
// }

// click "undo": remove the last object in "allEdits"
function undoEvent() {
  allEdits.splice(allEdits.length - 1, 1);
}

// click "clear": delete everything in "allEdits"
function clearEvent() {
  allEdits = [];
}

/*** init funcs ***/
function initCurrentEdits() {
  currentEdits = {
    "dots": []
  };
}

function styleSlider(slider, posX, posY, width) {
  slider.position(posX, posY);
  slider.style('width', width + 'px');
}

function styleButton(button, posX, posY) {
  button.position(posX, posY);
}

/*** other funcs ***/
// draw from the array
function drawEdits(edits) {
  stroke(color(edits.color));
  strokeWeight(edits.weight);
  var dots = edits.dots;
  beginShape();
  for (var j = 0; j < dots.length; j++) {
    vertex(dots[j].posX, dots[j].posY);
  }
  endShape();
}

// using HSB now (convert decimal to hex)
// function toColor(d, b = 1) {
//     var c = HSVtoRGB(d/colorAmount*MAX_COLOR_HSB, MAX_COLOR_HSB*0.7, MAX_COLOR_HSB * b);
//     // return [c.r, c.g, c.b];
//     return RGBtoHEX(c.r, c.g, c.b);
//     // return "#"+nf(Number(d).toString(16),6);
// }

// function HSVtoRGB(h, s, v) {
//     var r, g, b, i, f, p, q, t;
//     if (arguments.length === 1) {
//         s = h.s, v = h.v, h = h.h;
//     }
//     i = Math.floor(h * 6);
//     f = h * 6 - i;
//     p = v * (1 - s);
//     q = v * (1 - f * s);
//     t = v * (1 - (1 - f) * s);
//     switch (i % 6) {
//         case 0: r = v, g = t, b = p; break;
//         case 1: r = q, g = v, b = p; break;
//         case 2: r = p, g = v, b = t; break;
//         case 3: r = p, g = q, b = v; break;
//         case 4: r = t, g = p, b = v; break;
//         case 5: r = v, g = p, b = q; break;
//     }
//     return {
//         r: Math.round(r * 255),
//         g: Math.round(g * 255),
//         b: Math.round(b * 255)
//     };
// }

// function RGBtoHEX(r, g, b) {
//     return  '#' + [r, g, b].map(x => {
//       const hex = x.toString(16)
//       return hex.length === 1 ? '0' + hex : hex
//     }).join('')
// }

function HEXtoRGB(hex) {
    var bigint = parseInt(hex.replace("#",""), 16);
    console.log(bigint);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return {
      "r": r,
      "g": g,
      "b": b
    };
}

/*** funcs dealing with socket/multi-users ***/
// getting "allEdits"
function getAllEdits() {
  return allEdits;
}

// if I'm a new user, init my "allEdits" with what people've drawn
function initDraws(data) {
  for (var i = 0; i < data.length; i++) {
    allEdits.push(data[i].edits);
  }
}

// if other's drawn anything, update my "allEdits"
function updateDraws(data) {
  allEdits.push(data.edits);
}

/*** funcs dealing with APP ***/
function receiveQrAndDimensions(qr, width, height) {
  console.log(qr + ", " + width + ", " + height);
  join_room(qr, width, height);
}
