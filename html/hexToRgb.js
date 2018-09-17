const hexToRgb = hex =>
  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
             ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))

//console.log(hexToRgb("#0033ff")) // [0, 51, 255]
//console.log(hexToRgb("#03f")) // [0, 51, 255]
