/**
 TODO:
 - style the slider
    - show color
 - style the button
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
 **/

// store all edits info
var allEdits = [];
// containing current edits info
var currentEdits = {};
var weightSlider, colorSlider, undoButton, clearButton;
var buttonAreasBottomY = 40;
var colorSliderX, colorSliderY, colorSliderWidth;
var weightSliderX, weightSliderY, weightSliderWidth;
var weightMax = 40;
var weightAmount = 15;
var MAX_COLOR = 16777215;
var colorAmount = 20;
// run once before draw()
function setup() {
  var canvas = createCanvas(displayWidth, displayHeight);
  // Move the canvas so it's inside <div id="sketch-holder">.
  // canvas.parent('sketch-holder');
  // var x = (windowWidth - width) / 2;
  // var y = (windowHeight - height) / 2;
  // canvas.position(x, y);

  // init the object containing current edits info
  initCurrentEdits();
  // slider used to change stroke weight
  weightSlider = createSlider(0, weightMax, 10, weightMax / weightAmount);
  // slider used to change stroke color
  colorSlider = createSlider(0, colorAmount, 0, 1);
  // button - undo
  undoButton = createButton('undo');
  styleButton(undoButton, displayWidth*0.9, 0);
  undoButton.mousePressed(undoEvent);
  // button - clear
  clearButton = createButton('clear');
  styleButton(clearButton, displayWidth*0.9, 20);
  clearButton.mousePressed(clearEvent);
}

// run forever
function draw() {
  weightSliderX = 10;
  weightSliderY = 10;
  weightSliderWidth = width*0.4;

  colorSliderX = width*0.45;
  colorSliderY = 10;
  colorSliderWidth = width*0.4;

  background(51);

  // keep what you've drawn on the canvas
  for (var i = 0; i < allEdits.length; i++) {
    drawEdits(allEdits[i]);
  }

  // set color and weight
  currentEdits.color = toHexColor(int(colorSlider.value() / colorAmount * MAX_COLOR));
  currentEdits.weight = weightSlider.value();
  // if mouse has not been moved, do nothing
  // else, push current coordinates to "currentEdits"
  var edit;
  // if (mouseX != pmouseX && mouseY != pmouseY) {
  if ((touchIsDown || mouseIsPressed)
    && mouseY > buttonAreasBottomY
   ) {
    edit = {
      "posX": touchX || mouseX,
      "posY": touchY || mouseY
    };
    currentEdits.dots.push(edit);
  }
  // draw what you're drawing right now
  drawEdits(currentEdits);

  // display button/slider bar
  fill(255);
  noStroke();
  rect(0, 0, width, buttonAreasBottomY);

  // display weight
  var wightEachWidth = weightSliderWidth / weightAmount;
  fill(color(currentEdits.color));
  for (var i = 0; i <= weightAmount; i++) {
    var myX = weightSliderX + i * weightSliderWidth / weightAmount;
    ellipse(myX, weightSliderY*2, i / weightAmount * weightMax);
  }
  styleSlider(weightSlider, weightSliderX, weightSliderY, weightSliderWidth);

  // display color
  fill(100);
  strokeWeight(1);
  var colorPickerBottom = colorSliderY*4;
  var colorEachWidth = colorSliderWidth / colorAmount;
  for (var i = 0; i < colorAmount; i++) {
    var myX = colorSliderX + i * colorSliderWidth / colorAmount;

    fill(color(toHexColor(int(i/colorAmount*MAX_COLOR))));
    rect(myX, 0, colorEachWidth, colorPickerBottom);

  }
  // rect(colorSliderX, 0, colorSliderWidth, colorSliderY*4);
  styleSlider(colorSlider, colorSliderX, colorSliderY, colorSliderWidth);
  noFill();
}

/*** event handler funcs ***/
// built-in mouseReleased event handler
function mouseReleased() {
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

// convert decimal to hex
function toHexColor(d) {
    return "#"+nf(Number(d).toString(16),6)
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
}
