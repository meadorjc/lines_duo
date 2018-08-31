var grid;
var showLine = [];
let lineWidth = 6;
var linesPicked = [];
var nodes = [];
var nodes_aa = {};
var colors = ['red', 'blue'];
var player = true;
var boxPlaced = false;
var loopState = true;
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

	frameRate(15);
	cnv = createCanvas(initLoad.width, initLoad.height);
	grid = new Grid(initLoad.width, initLoad.height, initLoad.spacing, 6);
	
	cnv.mouseMoved(findNodes);
	cnv.mousePressed(placeLine);

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
	 
	if(player) {		
		stroke(user.color.r, user.color.g, user.color.b, user.color.a);
		//stroke(0, 0, 255, 100);
	}
	for(var i = 0; i < showLine.length; i++){
		showLine[i].show();
	}
	Object.keys(gridLines).forEach(function(l){
	//	console.log(l);
	//	console.log(gridLines);
	//	console.log(gridLines["100,350,100,300"]);
		l_coords = l.split(",");
		//console.log(l_coords);
		stroke(gridLines[l].r, gridLines[l].g, gridLines[l].b, 255);

        	fill(255, 0 , 0);
        	strokeWeight(lineWidth);
        	line(l_coords[0], l_coords[1], l_coords[2], l_coords[3]);
		//linesPicked[i].show();
	});
		
	if (mouseIsPressed) {
		placeLine()
	}
//	console.log(mouseX+','+mouseY);
	grid.show();

	
}

//black magic 
function findNodes(){
	
	if ( mouseX >= initLoad.spacing && mouseX <= width - initLoad.spacing && mouseY >= initLoad.spacing && mouseY <= height - initLoad.spacing) {
		
		//Origin Node
		d1x = (mouseX % initLoad.spacing) >= (initLoad.spacing/2) ? (Math.ceil(mouseX/initLoad.spacing)*initLoad.spacing) : (Math.floor(mouseX/initLoad.spacing)*initLoad.spacing);
		d1y = (mouseY % initLoad.spacing) >= (initLoad.spacing/2) ? (Math.ceil(mouseY/initLoad.spacing)*initLoad.spacing) : (Math.floor(mouseY/initLoad.spacing)*initLoad.spacing);
	
		//Connecting Node 	
		d2x = (mouseX < d1x) ? d1x-initLoad.spacing : (d1x+initLoad.spacing > width	- initLoad.spacing ? width	- initLoad.spacing : d1x+initLoad.spacing); 
		d2y = (mouseY < d1y) ? d1y-initLoad.spacing : (d1y+initLoad.spacing > height - initLoad.spacing ? height - initLoad.spacing : d1y+initLoad.spacing);

		//Decide connecting node direction
		if ((mouseX - d1x) > (mouseY - d1y)) {
			d2x = d1x	
		}else {
			d2y = d1y
		}

		showLine[0] = new Line(d1x, d1y, d2x, d2y, 3, initLoad.s_id, initLoad.m_id);
	}	

}

function placeLine(){
	socket.emit('placeline', showLine[0]);

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
