var grid;
let showLine = [];
let lineWidth = 6;
var linesPicked = [];
var nodes = [];
var nodes_aa = {};
const clear = { color: { r: 0, g: 0, b: 0, a: 0 } };
var player = true;
var boxPlaced = false;
var loopState = true;
var cnv;
var user = {
	name: "",	
	s_id : "",
	color: { r: 255, 
		g: 0,
		b: 0,
		a: 100
	}
};

var initLoad = {
	s_id : "",
	m_id : "", 
	color: { r: 255, 
		g: 0,
		b: 0,
		a: 100
	},
	width : 0,
	height : 0
};

function setup() {

	frameRate(30);
	cnv = createCanvas(initLoad.width, initLoad.height);
	grid = new Grid(initLoad.width, initLoad.height, initLoad.spacing, 1);
	
	cnv.mouseMoved(findNodes);
	//cnv.mousePressed(placeLine);
	
	button = createButton('stop');
	button.position(10,10);
	button.mousePressed(toggle);
	
}
function toggle() {
	if(loopState) {
		noLoop();
		button.html("start");
	}else{
		loop();
		button.html("stop");
	}
	loopState = !loopState;
}

function draw() {
		//console.log(response);
		//console.log(user);

	background(200);
	 
	Object.keys(gridLines).forEach(function(l){
	//	console.log(l);
	//	console.log(gridLines);
	//	console.log(gridLines["100,350,100,300"]);
		l_coords = l.split(",");
		//console.log(l_coords);
		stroke(gridLines[l].r, gridLines[l].g, gridLines[l].b, gridLines[l].a);

        	//fill(255, 0 , 0);
        	strokeWeight(lineWidth);
        	line(l_coords[0], l_coords[1], l_coords[2], l_coords[3]);
		//linesPicked[i].show();
	});

	//draw temp line
//	if (mouseX && mouseY){
//        tempLine = gridLines[[showLine.x1, showLine.y1, showLine.x2, showLine.y2].join(",")];
//	if (!tempLine || tempLine.color == clear.color){
//		stroke(initLoad.color.r, initLoad.color.g, initLoad.color.b, initLoad.color.a);
//	} else stroke(clear.color.r, clear.color.g, clear.color.b, clear.color.a);
//	console.log(tempLine);
//	}

	stroke(initLoad.color.r, initLoad.color.g, initLoad.color.b, initLoad.color.a);
	fill(255, 0 , 0);
        strokeWeight(lineWidth);
        line(showLine.x1, showLine.y1, showLine.x2, showLine.y2);
		

	grid.show();

	
}
function mousePressed() {
	if(keyCode === SHIFT && mouseIsPressed){
		socket.emit('clearline', [showLine.x1, showLine.y1, showLine.x2, showLine.y2].join(","));
	}
	else { 
		if (mouseIsPressed) {
			socket.emit('placeline', showLine);
		}
	}

}
function keyPressed(){
	if (mouseIsPressed && keyCode === SHIFT){
		socket.emit('clearline', [showLine.x1, showLine.y1, showLine.x2, showLine.y2].join(","));
	}
	else if (mouseIsPressed) {
		socket.emit('placeline', showLine);
	}
	//return false;
}

//black magic 
function findNodes(){
	
	if ( mouseX >= initLoad.spacing && mouseX <= width - initLoad.spacing && mouseY >= initLoad.spacing && mouseY <= height - initLoad.spacing) {
		
		//Origin Node
		d1x = (mouseX % initLoad.spacing) >= (initLoad.spacing/2) ? (Math.ceil(mouseX/initLoad.spacing)*initLoad.spacing) : (Math.floor(mouseX/initLoad.spacing)*initLoad.spacing);
		d1y = (mouseY % initLoad.spacing) >= (initLoad.spacing/2) ? (Math.ceil(mouseY/initLoad.spacing)*initLoad.spacing) : (Math.floor(mouseY/initLoad.spacing)*initLoad.spacing);
	
		//Connecting Node 	
		d2x = (mouseX % initLoad.spacing) <= (initLoad.spacing/2) ? (Math.ceil(mouseX/initLoad.spacing)*initLoad.spacing) : (Math.floor(mouseX/initLoad.spacing)*initLoad.spacing);
		d2y = (mouseY % initLoad.spacing) <= (initLoad.spacing/2) ? (Math.ceil(mouseY/initLoad.spacing)*initLoad.spacing) : (Math.floor(mouseY/initLoad.spacing)*initLoad.spacing);

		//d2x = (mouseX < d1x) ? d1x-initLoad.spacing : (d1x+initLoad.spacing > width	- initLoad.spacing ? width	- initLoad.spacing : d1x+initLoad.spacing); 
		//d2y = (mouseY < d1y) ? d1y-initLoad.spacing : (d1y+initLoad.spacing > height - initLoad.spacing ? height - initLoad.spacing : d1y+initLoad.spacing);

		//Decide connecting node direction
		if ((mouseX - d1x) > (mouseY - d1y)) {
			d2x = d1x	
		}else {
			d2y = d1y
		}

		//console.log(d1x, d1y); 
		//console.log(d2x, d2y); 
		console.log(mouseX, mouseY, d1x, d1y, d2x, d2y, 3, initLoad.s_id, initLoad.m_id);
		showLine = new Line(d1x, d1y, d2x, d2y, 6, initLoad.s_id, initLoad.m_id);
	}	

}

function placeLine(){
	//socket.emit('placeline', showLine);
}

function clearLine(){
}

function boxCheck(){
	var orient = (showLine[0].x1 == showLine[0].x2) ? 'vertical' : 'horizontal';
	if(orient == 'vertical') {
		//left side check
		 // for(var i = 0; i < )
	}

	return false;
}



function changeColor(){	
	player = !player;
}
