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
var colorIndex = colorAmount-2;
var weightIndex = 0;
var barTopOrBottom, barLeftOrRight, weightEachGap, colorEachGap, weightBox, colorBox;
var leaveButton;
var bg;
var IfBgLoaded = false;
var isInAnyRoom = true;
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

  // button - leave
  leaveButton = createButton('FINISH PAINTING');
  var leaveButtonWidth = width*0.3;
  var leaveButtonHeight = height*0.02;
  styleButton(leaveButton, width/2-leaveButtonWidth/2, height*0.95);
  leaveButton.style("width", leaveButtonWidth+"px");
  leaveButton.style("height", leaveButtonHeight+"px");
  leaveButton.style("background", "#fff");
  leaveButton.mousePressed(leaveEvent);
  barTopOrBottom = height * 0.2;
  barLeftOrRight = width * 0.05;
  weightEachGap = (height-barTopOrBottom*2) / (weightAmount-1);
  colorEachGap = (height-barTopOrBottom*2) / (colorAmount-1);
  weightBox = {left: 0, right: barLeftOrRight, top: barTopOrBottom, bottom: height-barTopOrBottom};
  colorBox = {left: width-barLeftOrRight*2, right: width, top: barTopOrBottom, bottom: height-barTopOrBottom};
}

// var ifJoinedRoomForTesting = false;
// run forever
function draw() {
  if (socket) {
    if (!IfBgLoaded && socket.room) {
      bg = loadImage("/images/" + socket.room + ".png");
      IfBgLoaded = true;
    }
  } else {
    bg = 51;
  }

  background(bg);

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
  if (isInAnyRoom
    && (touchIsDown || mouseIsPressed)
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
  // if (!ifJoinedRoomForTesting) {
  //   join_room("test", width, height);
  //   ifJoinedRoomForTesting = true;
  // }

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
  // if (!ifJoinedRoomForTesting) {
  //   join_room("test", width, height);
  //   ifJoinedRoomForTesting = true;
  // }

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

// click "FINISH": delete everything in "allEdits"
function leaveEvent() {
  console.log("I am leaving now");
  leave_room(socket.room);
  isInAnyRoom = false;
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

function HEXtoRGB(hex) {
    var bigint = parseInt(hex.replace("#",""), 16);
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

function test() {
  bg = 255;
}

/*** funcs dealing with APP ***/
// function receiveQrAndDimensions(qr, width, height) {
//   myRoom = qr;
//   console.log(myRoom + ", " + width + ", " + height);
//   join_room(myRoom, width, height);
// }
