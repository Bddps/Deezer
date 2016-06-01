/**
 * Module dependencies
 */

var _				= require('lodash'),
	mapObj			= require('./util/mapObj'),
	Request			= require('./request'),
	OAuth			= require('./oauth')
	//affordances		= require('./affordances');


function DZ (options) {

	// Pulled from http://developers.deezer.com/api and http://developers.deezer.com/api/oauth
	this.endpoints = {

		resources: 'https://api.deezer.com',
		userAuth: 'https://connect.deezer.com/oauth/auth.php',
		accessToken: 'https://connect.deezer.com/oauth/access_token.php/'
	};

	_.extend(this, OAuth);
	_.extend(this, Request);

	this.endpoints = mapObj(this.endpoints, function (url) {
		return url.replace(/\/$/, '');
	});
}

module.exports = DZ;

