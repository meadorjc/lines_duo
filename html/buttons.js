function initButtons(){
  // stop drawing
  buttonStop = createButton('stop');
  buttonStop.position(10, 10);
  buttonStop.mousePressed(function () {
    if (loopState) {
      noLoop();
      buttonStop.html('start');
    } else {
      loop();
      buttonStop.html('stop');
    }
    loopState = !loopState;
  });

  // clear
  buttonClear = createButton('clear');
  buttonClear.position(50, 10);
  buttonClear.mousePressed(function () {
    socket.emit('clearlines')
  });

  // showGrid
  buttonGrid = createButton('grid on');
  buttonGrid.position(90, 10);
  buttonGrid.mousePressed(function () {
    if (showGrid) {
      showGrid = false
      buttonGrid.html('grid off')
    } else {
      showGrid = true
      buttonGrid.html('grid on')
    }
  });

  //button for line color
  colorInput =	createInput('#ffffff', 'color')
  colorInput.position(500, 10)
  
  //button for bg color
  buttonBgColor = createInput('#434343', 'color')
  buttonBgColor.position(600, 10)
}
