const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InitSchema = new Schema({
	name: String,
			color: { r: Number,
				g:  Number, 
				b:  Number,
				a: Number 
			}

});

module.exports = mongoose.model('Init', InitSchema);



	const initLoad = new Init({
		id : "0",
		color : bear.color,
		width : grid_width,
		height : grid_height,
		spacing : spacing
		
	})
