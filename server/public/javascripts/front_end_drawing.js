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

// run once before draw()
function setup() {
  createCanvas(windowWidth, windowHeight);
  // init the object containing current edits info
  initCurrentEdits();
  // slider used to change stroke weight
  weightSlider = createSlider(1, 40, 1);
  styleSlider(weightSlider, 0, 10, windowWidth*0.4);
  // slider used to change stroke color
  colorSlider = createSlider(0, 16777215, 1);
  styleSlider(colorSlider, windowWidth*0.45, 10, windowWidth*0.4);
  // button - undo
  undoButton = createButton('undo');
  styleButton(undoButton, windowWidth*0.9, 0);
  undoButton.mousePressed(undoEvent);
  // button - clear
  clearButton = createButton('clear');
  styleButton(clearButton, windowWidth*0.9, 20);
  clearButton.mousePressed(clearEvent);
}

// run forever
function draw() {
  background(51);
  fill(255);
  noStroke();
  rect(0, 0, windowWidth, buttonAreasBottomY);
  noFill();

  // keep what you've drawn on the canvas
  for (var i = 0; i < allEdits.length; i++) {
    drawEdits(allEdits[i]);
  }

  // set color and weight
  currentEdits.color = toHexColor(colorSlider.value());
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
