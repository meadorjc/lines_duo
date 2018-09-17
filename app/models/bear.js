const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var BearSchema = new Schema({
	name: String,
	color: { r: Number,
		g:  Number, 
		b:  Number,
		a: Number 
	},
	s_id : String,
	lineWidth : Number
});

module.exports = mongoose.model('Bear', BearSchema);

