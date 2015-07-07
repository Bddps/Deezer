
var Auth = require('../../../'),
	appCredentials = require('../deezerCredentials'),
	appId = appCredentials.id,
	appSecret = appCredentials.secret,
	deezer = new Auth();

module.exports = {

	wildcard: function (req, res, next) {
		var path = req.params[0];

		console.log(
			'Debug:: Raw request to Deezer API','\n',
			'Path :: ', path,'\n',
			'Fields :: ', req.query
		);

		deezer.request(req.session.deezer.token,
		{
			resource: path,
			method: 'get',
			fields: req.query
		},
		function done (err, result) {
			if (err) return next(err);
			res.json(result);
		});
	},

	clonePlaylist: function (req, res, next) {

		deezer.request(req.session.deezer.token,
		{
			resource: '/playlist/'+ req.param('playlist') +'/',
			method: 'get',
			fields: {}
		}, 

		function done (err, result) {

			if (err){
				res.status(404)
				return res.send('The Deezerlist ID does exist ');
			}

			console.log('DeezerlistID: ' + req.param('playlist'));

			var SongsIDS = [];
			var i = 0;

			while(result.tracks.data[i]){
				SongsIDS.push(result.tracks.data[i].id)
				i++;
			}

			deezer.request(req.session.deezer.token,
			{
				resource: '/playlist/'+ req.param('playlistTo') +'/tracks',
				method: 'post',
				fields: {songs: SongsIDS.join()}
			}, 

			function done(err, result) {
				if(err){
					return next('An error ocurred cloning your Deezerlist' + err);
				}

				console.log('Your Deezerlist is clone' + result);
			});

			res.send('Your DeezerlistID ' + req.param('playlist') + ' is cloned successfull');
		});
	},

	me: function(req, res, next) {
		deezer.request(req.session.deezer.token,
		{
			resource: 'user/me',
			method: 'get'
		},
		function done (err, result) {
			if (err) return next(err);
			res.json(result);
		});
	}
};