let showLine = []
let showGrid = true
let colorInput
let bgColor = '#434343'
let hexToRgbValue = [255, 255, 255];

var grid
var nodes = []
var nodes_aa = {}
var cnv

var initLoad = {
  s_id: '',
  m_id: '',
  color: { r: 255,
    g: 255,
    b: 255,
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
  centerCanvas();
  grid = new Grid(initLoad.width, initLoad.height, initLoad.spacing, 1)

  cnv.mouseMoved(findNodes)
  initButtons(initLoad.color);

  // if the mouse leaves the canvas set preview line to null
  // and stop drawing
  cnv.elt.onmouseleave = function () {
    showLine.x1 = null
    showLine.y1 = null
    showLine.x2 = null
    showLine.x2 = null
    //noLoop()
  }

  //convert color and send to server
  // loop (draw) when mouse is over canvas
  cnv.elt.onmouseover = function () {
    hexToRgbValue = hexToRgb(colorInput.value())
    bgColor = buttonBgColor.value()
    socket.emit('colorInput', { m_id: initLoad.m_id, color : { r : hexToRgbValue[0], g : hexToRgbValue[1], b : hexToRgbValue[2], a : 255}, lineWidth : initLoad.lineWidth })
    //loop()
  }
}

function draw () {
  usersAA = {}

  background(bgColor)

  if (showGrid) grid.show()

  //draw triangles
  Object.keys(tri_aa).forEach(function (key){
          if(isNaN(usersAA[tri_aa[key].user])){
		usersAA[tri_aa[key].user] = 1
	  } else {
		  usersAA[tri_aa[key].user] += 1
	  }
          strokeWeight(0)
          stroke(tri_aa[key].color.r, tri_aa[key].color.g, tri_aa[key].color.b, 150)
          fill(tri_aa[key].color.r, tri_aa[key].color.g, tri_aa[key].color.b, 150)

	  keySplit = key.split(',')
	  triangle(keySplit[0]-1,keySplit[1]-1,keySplit[2]-1,keySplit[3]-1,keySplit[4]-1,keySplit[5]-1)
  })

  //draw existing lines 
  Object.keys(gridLines)
    .map(c => ({ key: c, value: gridLines[c]}))
    .sort((a, b) => new Date(a.value.timestamp) - new Date(b.value.timestamp))
    .forEach(function (key) {
      strokeWeight(key.value.lineWidth);
      stroke(key.value.color.r, key.value.color.g, key.value.color.b, key.value.color.a);

      keySplit = key.key.split(',');
      line(keySplit[0], keySplit[1], keySplit[2], keySplit[3]);
  });


  $('#users').empty();
  Object.keys(usersAA)
    .map(c => ({ key: c, value: usersAA[c]}))	
    .sort((a, b) => b.value - a.value)
    .forEach(function (key){
	$('#users').append('<div>' + key.key.substring(0, 5) + '    ' + usersAA[key.key] + '<div>');

  })


  Object.keys(userLines).forEach(function (id) {
    l = userLines[id].line
    c = userLines[id].color
    stroke(c.r, c.g, c.b, 150)
    line(l[0], l[1], l[2], l[3])
  })

  // show preview line
  stroke(hexToRgbValue[0], hexToRgbValue[1], hexToRgbValue[2], initLoad.color.a);
  strokeWeight(initLoad.lineWidth)
  fill(255, 0, 0);

  if (mouseIsPressed) {
    socket.emit('placeline', showLine);
  }

  // draw line if showLine is not null
  if (showLine.x1 && showLine.y1 && showLine.x2 && showLine.y2) {
    socket.emit('displayLine', showLine)
    line(showLine.x1, showLine.y1, showLine.x2, showLine.y2)
  }
}

function mousePressed () {

}
function keyPressed () {

}
function processKeys () {

}
function findNodes () {
	
  // if mouse pointer is within bounds
  if (mouseX >= initLoad.spacing && mouseX <= width - initLoad.spacing && mouseY >= initLoad.spacing && mouseY <= height - initLoad.spacing) {
    // Origin Node
    d1x = (mouseX % initLoad.spacing) >= (initLoad.spacing / 2) ? (Math.ceil(mouseX / initLoad.spacing) * initLoad.spacing) : (Math.floor(mouseX / initLoad.spacing) * initLoad.spacing)
    d1y = (mouseY % initLoad.spacing) >= (initLoad.spacing / 2) ? (Math.ceil(mouseY / initLoad.spacing) * initLoad.spacing) : (Math.floor(mouseY / initLoad.spacing) * initLoad.spacing)

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
    showLine = new Line(d1x, d1y, d2x, d2y, initLoad.lineWidth, initLoad.s_id, initLoad.m_id)
  }
}
function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
}
function windowResized() {
  centerCanvas();
}
