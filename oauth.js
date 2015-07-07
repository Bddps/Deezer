/**
 * Module dependencies
 */

var request			= require('request'),
	_				= require('lodash'),
	querystring		= require('querystring'),
	Err				= require('./errors'),
	handleApiError	= require('./util/apiError'),
	toCSV			= require('./util/toCSV');


module.exports = {

	getLoginUrl: function (appId, redirectUrl, perms) {
		
		if ( typeof appId !== 'string' && typeof appId !== 'number' ) {
			throw Err.invalidArgument('appId', appId, ['string', 'number']);
		}

		if ( typeof redirectUrl !== 'string' ) {
			throw Err.invalidArgument('redirectUrl', redirectUrl, ['string']);
		}

		if ( !_.isArray(perms) && typeof perms !== 'undefined' ) {
			throw Err.invalidArgument('perms', perms, ['Array', 'undefined']);
		}

		if (!perms) perms = ['basic_access', 'manage_library'];

		perms = toCSV(perms);

		return this.endpoints.userAuth +
			'?' + querystring.stringify({
				app_id			: appId,
				redirect_uri	: redirectUrl,
				perms			: perms
			});
	},
	
	createSession: function (appId, secret, code, cb) {
		
		if ( typeof appId !== 'string' && typeof appId !== 'number' ) {
			throw Err.invalidArgument('appId', appId, ['string', 'number']);
		}

		if ( typeof code !== 'string' ) {
			throw Err.invalidArgument('code', code, ['string']);
		}

		if ( typeof secret !== 'string' ) {
			throw Err.invalidArgument('secret', secret, ['string']);
		}

		if ( !_.isFunction(cb) ) {
			throw Err.invalidArgument('cb', cb, ['Function']);
		}

		request.get({
			url: this.endpoints.accessToken,
			qs: {
				app_id	: appId,
				secret	: secret,
				code	: code
			}

		}, function createSessionResponse (err, r, body) {

			err = handleApiError(err, r, body);

			if (err) return cb(err);

			var parsedResponse = querystring.parse(body);
			
			if (!parsedResponse.access_token) return cb(body);
			
			if (!parsedResponse.expires) parsedResponse.expires = 0;
			
			if (typeof parsedResponse.expires === 'string') {
				parsedResponse.expires.replace(/\s*/g, '');
			}

			parsedResponse.expires = +parsedResponse.expires;
			
			cb(null, {
				accessToken	: parsedResponse.access_token,
				expires		: parsedResponse.expires
			});
		});
	},


	checkSession: function (accessToken, cb) {

		throw errors.notYetSupported('checkSession');
	},
	
	destroySession: function (accessToken, cb) {

		throw errors.notYetSupported('destroySession');
	}
};