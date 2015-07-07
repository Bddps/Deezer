/*
 * Dependencies
 */

var DZ = require('../../../'),
	appProperties = require('../deezerCredentials'),
	appId = appProperties.id,
	appSecret = appProperties.secret,
	deezer = new DZ();

exports.index = function(req, res) {

	var redirectUrl = 'http://192.168.0.10:5000/deezer/callback';
	var permissions = ['basic_access', 'manage_library'];
	var authLink = deezer.getLoginUrl(appId, redirectUrl, permissions);

	if (!req.session.lang) {
		req.session.lang = "es";
	}

	res.render('index', {
		lang: 		 (req.session.lang == "es") ? 'es' : 'en',
		title: 		 (req.session.lang == "es") ? 'Duplica una Deezerlist' : 'Deezerlist Clone',
		description: (req.session.lang == "es") ? 'Necesitas entrar a tu cuenta para poder clonar una playlist' : 'You need logging into deezer to clone a playlist',
		aLink: 		 (req.session.lang == "es") ? 'Entrar con Deezer' : ' Login with Deezer',
		authLink: authLink
	});
};


exports.dashboard = function(req, res, next) {
	
	deezer.request(req.session.deezer.token,{
			
			resource: '/user/me/playlists',
			method: 'get'
		}, 

		function done (err, result) {

			if (err)
			{
				PlayLists = "An error ocurred loading the playlists..." + err;
				console.log(PlayLists)
			}

			else
			{
				var PlayLists = {};
				var i = 0;

				while(result.data[i]){
					
					PlayLists.push({id: result.data[i].id, title: result.data[i].title})
					i++;
				}
			}

			res.render('dashboard', {
				title: (req.session.lang == "es") ? 'Duplica una Deezerlist' : 'Clone a Deezerlist',
				//playlist: JSON.stringify(PlayLists),
				how: (req.session.lang == "es") ? 'Como obtener el ID de las Deezerlists?' : '¿How get Deezerlists IDS?',
				buttonTitle: (req.session.lang == "es") ? 'Duplicar Deezerlist' : 'Clone Deezerlist'
			});
		});
};

exports.changeLangES = function(req, res, next) {

	req.session.lang = "es";
	
	if(req.get('referer'))
		res.redirect(req.get('referer'));
	else
		res.redirect('')
}

exports.changeLangEN = function(req, res, next) {

	req.session.lang = "en";

	if(req.get('referer'))
		res.redirect(req.get('referer'));
	else
		res.redirect('')
}


exports.deezerCallback = function(req, res, next) {

	var code = req.param('code');

	if (!code) {

		var err = req.param('error_reason');

		if (err === 'user_denied') {
			return res.redirect('/');
		}

		if (!err) {
			return next('Deezer encountered an unknown error when ' +
				'logging in the specified user :: ' + util.inspect(req.body)
			);
		}

		return next('Deezer encountered an unknown error :: ' + util.inspect(err));
	}

	deezer.createSession(appId, appSecret, code, function (err, result) {
		
		if (err) return next(err);

		req.session.deezer = {

			lifespan	: result.expires,
			token		: result.accessToken,
			lastLogin	: new Date()
		};

		res.redirect('/dashboard');
	});
}