function Node(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.show = function() {
        ellipse(x, y, size, size);
    }
}