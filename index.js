
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

const spacing = 100 
const gridWidth = 1000
const gridHeight = 1000
const clear = { color: { r: 0, g: 0, b: 0, a: 0 } }
const defaultLineWidth = 10

lines_aa = {}
tri_aa = {}

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
    //end points of line must be sorted to normalize index
    sortedLineArr =  [[line.x1, line.y1], [line.x2, line.y2]].sort()
    sortedLineObj = { x1 : sortedLineArr[0][0],
        y1 : sortedLineArr[0][1],
        x2 : sortedLineArr[1][0],
	y2 : sortedLineArr[1][1]
    }
    key = sortedLineArr.join(',') 
    triangles = findClosed(sortedLineObj)
    // find the user
    //console.log(line, ( line.y2 - line.y1 ) / ( line.x2 - line.x1 ))
    Bear.findById(line.m_id, 'color lineWidth', { lean: true }, function (err, doc) {
      // validate the nodes and associate the color to the line
      if (validate(line)) {
        // TODO: append lines to user's db document
        //	if (!lines_aa[lineString] || lines_aa[lineString] == clear.color) lines_aa[lineString] = doc.color;
        //	else lines_aa[lineString] = clear.color;
        lines_aa[key] = { color : doc.color, lineWidth : doc.lineWidth } 
        //lines_aa[key2] = { color : doc.color, lineWidth : doc.lineWidth } 
        if (triangles != null) {
		triangles.forEach( function (triangle){
                  tri_aa[sortTriangle(triangle).join(',')] = { color : doc.color, lineWidth : doc.lineWidth } 
		})
        }
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
function sortTriangle(triangle){
  return flatten([[triangle[0],triangle[1]],[triangle[2],triangle[3]],[triangle[4],triangle[5]]].sort())

}
function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

function findClosed (line) {
  testLines = []
  triangles = [] 
  lineKey = [line.x1,line.y1,line.x2,line.y2].join(',') 
  lineNodes = [[line.x1, line.y1],[line.x2, line.y2]].sort()
  lineSlope = (line.y2-line.y1)/(line.x2 - line.x1)

  console.log("lineNodes", lineNodes)
	
  Object.keys(lines_aa).forEach(function (key) {
    if (lineKey != key){
      key_coords = key.split(',');
      keyNodes = [[parseInt(key_coords[0]), parseInt(key_coords[1])],[parseInt(key_coords[2]),parseInt(key_coords[3])]]
	    
      if(  equalNodes(lineNodes[0], keyNodes[0]) 
	   || equalNodes(lineNodes[1], keyNodes[0])
           || equalNodes(lineNodes[0], keyNodes[1])
	   || equalNodes(lineNodes[1], keyNodes[1])
      ){
      	console.log("testline", keyNodes)
        testLines.push(keyNodes.sort())      
      }
    }
  })

  console.log("testlines.length", testLines.length)
  if (testLines.length > 1) { 
    testLines.forEach(function(testLine1){

     testLineSlope1 = (testLine1[1][1]-testLine1[0][1])/(testLine1[1][0]-testLine1[0][0])

     testLines.forEach(function(testLine2){

       testLineSlope2 = (testLine2[1][1]-testLine2[0][1])/(testLine2[1][0]-testLine2[0][0])

       if (lineKey != testLine1 
               && testLine1 != testLine2 
	       && lineKey != testLine2
               && lineSlope != testLineSlope1 
               && testLineSlope1 != testLineSlope2
	       && lineSlope != testLineSlope2
       ){
         if( (equalNodes(lineNodes[0], testLine2[0]) && equalNodes(lineNodes[1], testLine1[0]) && equalNodes(testLine1[1], testLine2[1]))
          || (equalNodes(lineNodes[0], testLine1[0]) && equalNodes(lineNodes[1], testLine2[0]) && equalNodes(testLine1[1], testLine2[1]))
          || (equalNodes(testLine1[0], testLine2[0]) && equalNodes(testLine1[1], lineNodes[0]) && equalNodes(lineNodes[1], testLine2[1]))
          || (equalNodes(testLine1[0], lineNodes[0]) && equalNodes(testLine1[1], testLine2[0]) && equalNodes(testLine2[1], lineNodes[1]))
          || (equalNodes(testLine2[0], lineNodes[0]) && equalNodes(testLine2[1], testLine1[0]) && equalNodes(testLine1[1], lineNodes[1]))
          || (equalNodes(testLine2[0], testLine1[0]) && equalNodes(testLine2[1], lineNodes[0]) && equalNodes(testLine1[1], lineNodes[1]))
         ){
             triangleNodesSet = setOfNodes([lineNodes[0], lineNodes[1], testLine1[0], testLine1[1], testLine2[0], testLine2[1]] )
              triangles.push(flatten(triangleNodesSet))
         	console.log("triangles.push", flatten(triangleNodesSet))
         }
       }	     
     })
    })
  }
  return triangles
}

//node as [x,y]
function equalNodes(node1, node2){
  return node1[0] === node2[0] && node1[1] === node2[1] 
}

function containsNode(arr, node){
  test = false
  arr.forEach(function(n){
    if (n[0] === node[0] && n[1] === node[1]) { test = true; } 

  })
  console.log("contains", arr, node, test )
  return test 
}

function setOfNodes(nodeArray){
	console.log("nodeArrayLength", nodeArray.length)
	console.log("nodeArrayBefore", nodeArray)
  for(i = 0; i < nodeArray.length; i++){
    for(j = i+1; j < nodeArray.length; j++){
      //console.log( "i", i, "j", j, "nodeArray", nodeArray)
      if (nodeArray[i][0] === nodeArray[j][0] && nodeArray[i][1] === nodeArray[j][1]){
         nodeArray.splice(j, 1)
        j--
      }
    }
  }
	console.log("nodeArrayAfter", nodeArray)
 return nodeArray
}

function findLine ( line, x1a, y1a, x2a, y2a ){
  return lines_aa[[[(line.x1 + x1a), (line.y1 + y1a)], [(line.x2 + x2a), (line.y2 + y2a)]].sort().join(',')]  
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
