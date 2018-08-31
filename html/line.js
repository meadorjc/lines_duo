function Line(x1, y1, x2, y2, width, s_id, m_id){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.width = width;
	this.s_id = s_id;
	this.m_id = m_id;
    

    this.show = function() {
        fill(255, 0 , 0);
        strokeWeight(width);
        line(this.x1, this.y1, this.x2, this.y2);
        //console.log(this)
    }
}
