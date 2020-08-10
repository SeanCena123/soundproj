//Initiating Global Variables
var express = require('express');
var app = express();
const port = 8000;


//Beginning Server Commands
var server = app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});


//Init index.ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); 
app.get('/', function(req, res) {
	res.render('index', { 
		title: 'Name',
	});
});


