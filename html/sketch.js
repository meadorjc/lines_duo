let showLine = []
let diagonal = false
let showGrid = true
let colorInput
let bgColor = '#434343'
let hexToRgbValue = [255, 255, 255];

var grid
var loopState = true
var nodes = []
var nodes_aa = {}
var cnv
var initLoad = {
  s_id: '',
  m_id: '',
  color: { r: 255,
    g: 0,
    b: 0,
    a: 100
  },
  width: 1000,
  height: 1000,
  spacing: 50,
  lineWidth : 1
}

function setup () {
  frameRate(30)
  cnv = createCanvas(initLoad.width, initLoad.height)
  grid = new Grid(initLoad.width, initLoad.height, initLoad.spacing, 1)

  cnv.mouseMoved(findNodes)
  initButtons();

  cnv.elt.onmouseleave = function () {
    showLine.x1 = null
    showLine.y1 = null
    showLine.x2 = null
    showLine.x2 = null
  }

  //convert color and send to server
  cnv.elt.onmouseover = function () {
    hexToRgbValue = hexToRgb(colorInput.value())
    bgColor = buttonBgColor.value()
    socket.emit('colorInput', { m_id: initLoad.m_id, color : { r : hexToRgbValue[0], g : hexToRgbValue[1], b : hexToRgbValue[2], a : 255}, lineWidth : lineWidthSlider.value() })
  }
}

function draw () {
  background(bgColor)
  if (showGrid) grid.show()

  //draw existing lines 
  Object.keys(gridLines).forEach(function (key) {
    // split the key into array
    key_coords = key.split(',');
    strokeWeight(gridLines[key].lineWidth);
    stroke(gridLines[key].color.r, gridLines[key].color.g, gridLines[key].color.b, gridLines[key].color.a);
    line(key_coords[0], key_coords[1], key_coords[2], key_coords[3]);
  });

  textSize(10);
  text(key, 33, 65);
  text(keyCode, 53, 65);

  // show preview line
  stroke(hexToRgbValue[0], hexToRgbValue[1], hexToRgbValue[2], initLoad.color.a);
  strokeWeight(lineWidthSlider.value())
  fill(255, 0, 0);


  // alter preview line and send events for key codes
  // shift to clear
  if (keyIsDown(SHIFT)) {
    // change color of line
    stroke(0, 0, 0, 255);
    strokeWeight(0);
    textFont('Courier New', 120)
    fill(hexToRgbValue[0], hexToRgbValue[1], hexToRgbValue[2], 150);
    text('clear', 120, 220);
    strokeWeight(1);
   
  }
  // when placing lines
  if (keyIsDown(SHIFT) && mouseIsPressed) {
    socket.emit('clearline', [showLine.x1, showLine.y1, showLine.x2, showLine.y2].join(','));
  } else if (mouseIsPressed) {
    console.log("mousePressed", showLine);
    socket.emit('placeline', showLine);
  }

  // draw line if showLine is not null
  if(showLine.x1 && showLine.y1 && showLine.x2 && showLine.y2) 
    line(showLine.x1, showLine.y1, showLine.x2, showLine.y2)
}

function mousePressed () {

}
function keyPressed () {

}
function processKeys () {

}
function findNodes () {
  //if mouse pointer is within bounds
  if (mouseX >= initLoad.spacing && mouseX <= width - initLoad.spacing && mouseY >= initLoad.spacing && mouseY <= height - initLoad.spacing) {
    // Origin Node
    d1x = (mouseX % initLoad.spacing) >= (initLoad.spacing / 2) ? (Math.ceil(mouseX / initLoad.spacing) * initLoad.spacing) : (Math.floor(mouseX / initLoad.spacing) * initLoad.spacing)
    d1y = (mouseY % initLoad.spacing) >= (initLoad.spacing / 2) ? (Math.ceil(mouseY / initLoad.spacing) * initLoad.spacing) : (Math.floor(mouseY / initLoad.spacing) * initLoad.spacing)

    // Connecting Node
    //d2x = (mouseX % initLoad.spacing) <= (initLoad.spacing / 2) ? (Math.ceil(mouseX / initLoad.spacing) * initLoad.spacing) : (Math.floor(mouseX / initLoad.spacing) * initLoad.spacing)
    //d2y = (mouseY % initLoad.spacing) <= (initLoad.spacing / 2) ? (Math.ceil(mouseY / initLoad.spacing) * initLoad.spacing) : (Math.floor(mouseY / initLoad.spacing) * initLoad.spacing)

    ////makes line straight if below/above threshold of spacing/4 
    //if (abs((mouseX - d1x)) < (initLoad.spacing/4)) { d2x = d1x }
    //if (abs((mouseY - d1y)) < (initLoad.spacing/4)) { d2y = d1y }
	  
    // Decide connecting node direction
    console.log((mouseY-d1y),(mouseX-d1x), (mouseY-d1y)/(mouseX-d1x))
    console.log((Math.atan2(mouseY-d1y, mouseX-d1x) * 180 / Math.PI))

    deg = Math.atan2(mouseY-d1y, mouseX-d1x) * 180 / Math.PI
    
    if ( deg > -22.5 && deg <= 22.5 ){
      d2x = Math.ceil(mouseX / initLoad.spacing) * initLoad.spacing
      d2y = d1y 
    }
    if ( deg > 22.5 && deg <= 67.5  ){
      d2x = Math.ceil(mouseX / initLoad.spacing) * initLoad.spacing
      d2y = Math.ceil(mouseY / initLoad.spacing) * initLoad.spacing
    }
    if ( deg > 67.5 && deg <= 112.5  ){
      d2x = d1x 
      d2y = Math.ceil(mouseY / initLoad.spacing) * initLoad.spacing
    }
    if ( deg > 112.5 && deg <= 157.5  ){
      d2x = Math.floor(mouseX / initLoad.spacing) * initLoad.spacing
      d2y = Math.ceil(mouseY / initLoad.spacing) * initLoad.spacing
    }
    if ( (deg > 157.5 && deg <= 180) || (deg < -157.5 && deg >= -180)  ){
      d2x = Math.floor(mouseX / initLoad.spacing) * initLoad.spacing
      d2y = d1y 
    }
    if ( deg < -112.5 && deg >= -157.5  ){
      d2x = Math.floor(mouseX / initLoad.spacing) * initLoad.spacing
      d2y = Math.floor(mouseY / initLoad.spacing) * initLoad.spacing
    }
    if ( deg < -67.5 && deg >= -112.5  ){
      d2x = d1x 
      d2y = Math.floor(mouseY / initLoad.spacing) * initLoad.spacing
    }
    if ( deg < -22.5 && deg >= -67.5  ){
      d2x = Math.ceil(mouseX / initLoad.spacing) * initLoad.spacing
      d2y = Math.floor(mouseY / initLoad.spacing) * initLoad.spacing
    }
    //console.log(mouseX, mouseY, d1x, d1y, d2x, d2y, 3, initLoad.s_id, initLoad.m_id);
    //showLine = new Line(d1x, d1y, d2x, d2y, 6, initLoad.s_id, initLoad.m_id);
    showLine = new Line(d1x, d1y, d2x, d2y, lineWidthSlider.value(), initLoad.s_id, initLoad.m_id)
  }
}

function placeLine () {
  // socket.emit('placeline', showLine);
}

function clearLine () {
}
