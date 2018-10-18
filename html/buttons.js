function initButtons(color){

  //button for line color
  colorInput =	createInput(rgbToHex(color.r, color.g, color.b), 'color')
  colorInput.position(150, 10)
  
  //button for bg color
  buttonBgColor = createInput('#434343', 'color')
  buttonBgColor.position(200, 10)


}
