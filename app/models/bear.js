const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BearSchema = new Schema({
	name: String,
			color: { r: Number,
				g:  Number, 
				b:  Number,
				a: Number 
			}
});

module.exports = mongoose.model('Bear', BearSchema);

