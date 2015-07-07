/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	deezerApiRoutes = require('./routes/deezer'),
	middleware = require('./middleware'),
	http = require('http'),
	path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));

// Enable sessions
app.use(express.cookieParser());
app.use(express.cookieSession({
	secret: 'foo'
}));

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/deezer/callback', routes.deezerCallback);
app.get('/dashboard', middleware.checkToken, routes.dashboard);

app.get('/deezer/:resource/:id?', function (req,res,next) {
	
	// Quick implementation of resourceful routing,
	// just to simplify the demo
	var resource = req.param('resource');
	if (!resource) return res.redirect('/dashboard');
	if (!deezerApiRoutes[resource]) return next();
	deezerApiRoutes[resource](req,res,next);
});

app.get('/deezer/*', function (req, res, next) {
	deezerApiRoutes.wildcard(req,res,next);
});

app.get('/es', routes.changeLangES);
app.get('/en', routes.changeLangEN);

app.get('/clone/', function (req, res, next){
	deezerApiRoutes.clonePlaylist(req, res, next);
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});