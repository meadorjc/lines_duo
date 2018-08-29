const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const colors = ['red', 'green', 'blue', 'dark blue', 'dark green', 'light green', 'purple', 'white', 'black']

//Bear model
const Bear = require('./app/models/bear');
//const Bear = mongoose.model('Bear', { name: String });

//app.all('/', function(req, res, next) {
//	res.header("Access-Control-Allow-Origin", "*");
//	res.header("Access-Control-Allow-Headers", "X-Requested-With");
//	next()
//});
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const port = process.env.PORT || 8080;

//database
mongoose.connect('mongodb://localhost/lines');

//handle connection event
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//create router
const router = express.Router();

router.use(function(req, res, next) {
	console.log('request: ' );
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/bears')
	.post(function(req, res) {
		const bear = new Bear({ 
			name: req.body.name,
			color: { r: (Math.random() * 254),
				g: (Math.random() * 254), 
				b: (Math.random() * 254),
				a: 100
			}
		
		});
		
		console.log( "here!" +  bear.name );

		bear.save(function(err, bear) {
			if (err) res.send("error: " +err);
			console.log('save.');
		});
		
		res.json(bear);

	})

	.get(function(req, res){
		Bear.find(function(err, bears) {
			if (err) res.send("error: " + err);
			res.json(bears);
		});
	});

app.use('/api', router);

app.listen(port);
