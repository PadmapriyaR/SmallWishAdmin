//adding opensource modules to application 
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var mongoose = require('mongoose');
var models_user = require('./Angular/Models/user.js');
var mongojs = require("mongojs");
var db = mongojs('mongodb://websitedb:websitedb@ds025399.mlab.com:25399/websitedb', ['websitedb']);


//connection database
mongoose.connect('mongodb://websitedb:websitedb@ds025399.mlab.com:25399/websitedb');

//import the routers
var router = require('./Routes/router');
var authenticate = require('./Routes/authentication')(passport);

//for using express throughout this application
var app = express();
/*app.post('/createevents', function(req,res){
	console.log('I am from api');
	db.AngularizeApp.insert(req.body, function(err, docs){
		res.json(docs);
	});
});*/
//tell node that My application will use ejs engine for rendering, view engine setup
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');

//tell node the global configuration about parser,logger and passport
app.use(cookieParser());
app.use(logger('dev'));
app.use(session({
  secret: 'keyboard cat'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize()); //initializing passport
app.use(passport.session()); //initializing passport session

//tell node about these directories that application may get resources from
app.use('/', router);
app.use('/auth', authenticate);
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'Content')));
app.use(express.static(path.join(__dirname, 'Angular')));
app.use(express.static(path.join(__dirname, 'Views/Main')));
app.use(express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'Views/Authentication')));


//providing auth-api to passport so that it can use it.
var initPassport = require('./Passport/passport-init');
initPassport(passport);

app.post('/createevents', function(req, res){
	console.log(req.body);
	db.websitedb.insert(req.body, function(err, docs){
		console.log('inserted');
		res.json(docs);
	});
});
app.get('/allevents', function(req, res){
		console.log('I got a request from server');
		db.websitedb.find(function(err, docs) {
			console.log(docs);
			res.json(docs);
		});
});
app.get('/allevents/:id', function(req, res){
	var id = req.params.id;
	console.log(id);
	db.websitedb.findOne({ _id: mongojs.ObjectId(id)}, function(err, docs){
		if(err)
			res.send(err);
		else
			console.log(docs);
			res.json(docs);
	});
});
app.put('/createevents/:id', function(req, res){
	var id = req.params.id;
	console.log('update status' +id);
	console.log('params' + req.body.staus);
	console.log('PUT' +req.body);
	console.log('mongojs id' + mongojs.ObjectId(id));
	db.websitedb.update({_id: mongojs.ObjectId(id)}, {$set: {status: req.body.status}}, function(err, docs){
		if(err)
			res.send(err);
		else
			console.log(docs);
			res.json(docs);
	});
});
app.delete('/deleteevent', function(req, res){
	db.websitedb.remove({}, function(err, docs){
		console.log('Deleted');
		res.json(docs);
	});
});

//running server on node
app.listen(process.env.PORT || 3000, () => {
	console.log('Magic is happening on port number 3000!!');	
});

/*app.listen(process.env.PORT || 8080);
console.log('Magic is happening on port number 8080!!');*/

/*var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});*/

//exporting this application as a module
module.exports = app;