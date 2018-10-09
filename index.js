
var util = require('util')

var path = require('path')
var express = require('express')
var app = require('express')()
var http = require('http').Server(app)
var bodyParser = require('body-parser')
var io = require('socket.io')(http)

const morgan = require('morgan')

const mongoose = require('mongoose')
const db = mongoose.connection

const Bear = require('./app/models/bear')

const htmlPath = path.join(__dirname, 'html')
const port = process.env.PORT || 8080

const spacing = 50
const gridWidth = 1000
const gridHeight = 1000
const clear = { color: { r: 0, g: 0, b: 0, a: 0 } }
const defaultLineWidth = 4;

lines_aa = {}
tri_aa = [] 

app.use(morgan('dev'))
app.use(express.static(htmlPath))

// database
mongoose.connect('mongodb://localhost/lines')

// handle connection event
db.on('error', console.error.bind(console, 'connection error:'))




// start the socket connection and define listeners
io.on('connection', function (socket) {
  const bear = new Bear({
    name: 'test',
    color: { r: (Math.random() * 254),
      g: (Math.random() * 254),
      b: (Math.random() * 254),
      a: 255
    },
    s_id: socket.id,
    lineWidth : defaultLineWidth 
  })
  const initLoad = {
    s_id: socket.id,
    m_id: bear._id,
    color: bear.color,
    width: gridWidth,
    height: gridHeight,
    spacing: spacing,
    lineWidth : defaultLineWidth

  }
  socket.emit('initialize', initLoad)

  bear.save(function (err, bear) {
    if (err) res.send('error: ' + err)
    console.log('save.')
  })

  socket.on('disconnect', function () {
    console.log('user disconnected')
  })

  // when a line gets placed
  socket.on('placeline', function (line) {
    key = [line.x1, line.y1, line.x2, line.y2].join(',')
    key2 = [line.x2, line.y2, line.x1, line.y1].join(',') 
    triangle = findClosed(line)
    if (triangle != null) {
	    tri_aa.push(new Array(triangle))
    }
    // find the user
    console.log(line, ( line.y2 - line.y1 ) / ( line.x2 - line.x1 ))
    Bear.findById(line.m_id, 'color lineWidth', { lean: true }, function (err, doc) {
      // validate the nodes and associate the color to the line
      if (validate(line)) {
        // TODO: append lines to user's db document
        //	if (!lines_aa[lineString] || lines_aa[lineString] == clear.color) lines_aa[lineString] = doc.color;
        //	else lines_aa[lineString] = clear.color;
        lines_aa[key] = { color : doc.color, lineWidth : doc.lineWidth } 
        lines_aa[key2] = { color : doc.color, lineWidth : doc.lineWidth } 
      }
    })
  })
  socket.on('colorInput', function (input) {
    Bear.findByIdAndUpdate( input.m_id, { color : input.color, lineWidth : input.lineWidth }, function (err, doc) {
      if (err) console.log(err)
      //console.log(doc)
    }) 
  })
  // when client is ready, start timer and begin sending existing lines
  socket.on('clientReady', function () {
    var timer = setInterval(function () {
      socket.emit('lines_aa', lines_aa)
      socket.emit('tri_aa', tri_aa)
    }, 100)
  })
})

// attach listener
http.listen(port, function () {
  console.log('listening on *:8080')
})

function findClosed (line) {
  slope = ( line.y2 - line.y1 ) / ( line.x2 - line.x1 )
  triangle = null
  //line slope is -1, "backslash"
  if ( slope === -1 ){ 
    if( ( findLine (line, 0, spacing, 0, 0) || findLine (line, 0, 0, 0, spacing))
      &&( findLine (line, spacing, 0, 0, 0) || findLine (line, 0, 0, spacing, 0))){
        triangle = [line.x1, line.y1, line.x2, line.y2, Math.max(line.x1, line.x2), Math.max(line.y1, line.y2)]  
        console.log("slope -1 x+y+ connected")
	    console.log(triangle)
    }
    else if(( findLine (line, 0, -spacing, 0, 0) || findLine (line, 0, 0, 0, -spacing))
      &&( findLine (line, -spacing, 0, 0, 0) || findLine (line, 0, 0, -spacing, 0))){
        triangle = [line.x1, line.y1, line.x2, line.y2, Math.min(line.x1, line.x2), Math.min(line.y1, line.y2)]  
        console.log("slope -1 x-y- connected")
	    console.log(triangle)
    }
  } 
  //line slope is 1, "forwardslash"
  if ( slope === 1 ){ 
    if( ( findLine (line, 0, spacing, 0, 0) || findLine (line, 0, 0, 0, spacing))
      &&( findLine (line, -spacing, 0, 0, 0) || findLine (line, 0, 0, -spacing, 0))){
        triangle = [line.x1, line.y1, line.x2, line.y2, Math.min(line.x1, line.x2), Math.max(line.y1, line.y2)]  
        console.log("slope 1 x-y+ connected")
	    console.log(triangle)
    }
    else if(( findLine (line, 0, -spacing, 0, 0) || findLine (line, 0, 0, 0, -spacing))
      &&( findLine (line, spacing, 0, 0, 0) || findLine (line, 0, 0, spacing, 0))){
        triangle = [line.x1, line.y1, line.x2, line.y2, Math.max(line.x1, line.x2), Math.min(line.y1, line.y2)]  
        console.log("slope 1 x-y- connected")
	    console.log(triangle)
    }
  }
  //line slope is 0, horizontal line 
  if ( slope === -0 || slope === 0){ 
    if( ( findLine (line, 0, -spacing, 0, 0) || findLine (line, 0, 0, 0, -spacing))
      &&( findLine (line, spacing, -spacing, 0, 0) || findLine (line, 0, 0, spacing, -spacing))){
        triangle = [line.x1, line.y1, line.x2, line.y2, Math.min(line.y1, line.y2)-spacing, Math.min(line.y1, line.y2)-spacing]  
        console.log("slope 0 x-y+ connected")
	    console.log(triangle)
    }
    else if(( findLine (line, 0, spacing, 0, 0) || findLine (line, 0, 0, 0, spacing))
      &&( findLine (line, spacing, spacing, 0, 0) || findLine (line, 0, 0, spacing, spacing))){
        triangle = [line.x1, line.y1, line.x2, line.y2, Math.max(line.x1, line.x2), Math.max(line.y1, line.y2)+spacing]  
        console.log("slope 0 x-y- connected")
	    console.log(triangle)
    }
  }
  if ( slope === Infinity || slope === -Infinity){}
    if( ( findLine (line, -spacing, 0, 0, 0) || findLine (line, 0, 0, -spacing, 0))
      &&( findLine (line, -spacing, spacing, 0, 0) || findLine (line, 0, 0, -spacing, spacing))){
        triangle = [line.x1, line.y1, line.x2, line.y2, Math.min(line.y1, line.y2)-spacing, Math.min(line.y1, line.y2)-spacing]  
        console.log("slope Inf x-y- connected")
	    console.log(triangle)
    }
    else if(( findLine (line, 0, spacing, 0, 0) || findLine (line, 0, 0, 0, spacing))
      &&( findLine (line, spacing, spacing, 0, 0) || findLine (line, 0, 0, spacing, spacing))){
        triangle = [line.x1, line.y1, line.x2, line.y2, Math.max(line.x1, line.x2), Math.max(line.y1, line.y2)+spacing]  
        console.log("slope 0 x-y- connected")
	    console.log(triangle)
    }
  return triangle
}
function findLine ( line, x1a, y1a, x2a, y2a ){
  return lines_aa[[(line.x1 + x1a), (line.y1 + y1a), (line.x2 + x2a), (line.y2 + y2a)].join(',')]  
}
function mutateLine (line, xSpacing, ySpacing) {
  return { yLine1 : [line.x1, (line.y1 + ySpacing), line.x2, line.y2].join(',') , 
	   yLine2 : [line.x1, line.y1, line.x2, (line.y2 + ySpacing)].join(',') , 
           xLine1 : [(line.x1 + xSpacing), line.y1, line.x2, line.y2].join(',') ,
	   xLine2 : [line.x1, line.y1, (line.x2 + xSpacing), line.y2].join(',')
  }
}
function validate (line) {
  return validateNode(line.x1, line.y1) &&
		validateNode(line.x2, line.y2) &&
		validateLine(line.x1, line.y1, line.x2, line.y2)
}
function validateNode (x, y) {
  return (x >= spacing &&
		x <= gridWidth - spacing &&
		y >= spacing &&
		y <= gridHeight - spacing &&
		x % spacing == 0 &&
		y % spacing == 0
  )
}
function validateLine (x1, y1, x2, y2) {
  return (Math.abs(x1 - x2) <= spacing && Math.abs(y1 - y2) <= spacing)
}
function Grid (g_width, g_height, spacing, size) {
  this.width = g_width
  this.height = g_height
  this.spacing = spacing
  this.size = size
  this.show = function () {
    fill(0)
    var count = 0
    for (i = this.spacing; i < this.width; i += this.spacing) {
      nodes[i / this.spacing - 1] = []
      for (j = this.spacing; j < this.height; j += this.spacing) {
        fill(0)
        stroke(0)
        strokeWeight(1)
        nodes_aa[i + ',' + j] = (i / this.spacing - 1) + ',' + (j / this.spacing - 1)

        nodes[i / this.spacing - 1][j / this.spacing - 1] = new Node(i, j, this.size)
        nodes[i / this.spacing - 1][j / this.spacing - 1].show()
      }
    }
  }
}
