(function(module) {
	"use strict";

	var User = module.parent.require('./user'),
		meta = module.parent.require('./meta'),
		db = module.parent.require('../src/database'),
		shortId = require('shortid'),
		passport = module.parent.require('passport'),
		passportInstagram = require('passport-instagram').Strategy,
		fs = module.parent.require('fs'),
		path = module.parent.require('path'),
		async = module.parent.require('async'),
		winston = module.parent.require('winston'),
		nconf = module.parent.require('nconf');

	var constants = Object.freeze({
		'name': "Instagram",
		'admin': {
			'route': '/plugins/sso-instagram',
			'icon': 'fa-instagram'
		}
	});

	var Instagram = {};

	Instagram.init = function(params, callback) {
		function render(req, res, next) {
			res.render('admin/plugins/sso-instagram', {});
		}

		params.router.get('/admin/plugins/sso-instagram', params.middleware.admin.buildHeader, render);
		params.router.get('/api/admin/plugins/sso-instagram', render);

		callback();
	}

	Instagram.getStrategy = function(strategies, callback) {
		meta.settings.get('sso-instagram', function(err, settings) {
			if (!err && settings['id'] && settings['secret']) {
				passport.use(new passportInstagram({
					clientID: settings['id'],
					clientSecret: settings['secret'],
					callbackURL: nconf.get('url') + '/auth/instagram/callback'
				}, function(accessToken, refreshToken, profile, done) {
					Instagram.login(profile.id, profile.username, profile.displayName, profile._json.data.profile_picture, profile._json.data.website, function(err, user) {
						if (err) {
							return done(err);
						}
						done(null, user);
					});
				}));

				strategies.push({
					name: 'instagram',
					url: '/auth/instagram',
					callbackURL: '/auth/instagram/callback',
					icon: 'fa-instagram',
					scope: ''
				});
			}

			callback(null, strategies);
		});
	};

	Instagram.login = function(instagramId, username, displayName, picture, website, callback) {
		Instagram.getUidByInstagramId(instagramId, function(err, uid) {
			if(err) {
				return callback(err);
			}

			if (uid !== null) {
				// Existing User
				callback(null, {
					uid: uid
				});
			} else {
				// New User
				var success = function(uid, merge) {
					// Save instagram-specific information to the user
					var data = {
						instagramId: instagramId,
						'email:confirmed': 1
					};

					if (!merge) {

						if (displayName && 0 < displayName.length) {
							data.fullname = displayName;
						}

						if (picture && 0 < picture.length) {
							data.uploadedpicture = picture;
							data.picture = picture;
						}

						if (website && 0 < website.length) {
							data.website = website;
						}
					}

					async.parallel([
						function(callback2) {
							db.setObjectField('instagramId:uid', instagramId, uid, callback2);
						},
						function(callback2) {
							User.setUserFields(uid, data, callback2);
						}
					], function(err, results) {
						if (err) {
							return callback(err);
						}

						callback(null, {
							uid: uid
						});
					});
				};

				var sid = shortId.generate();

				// Create user with fake email because Instagram doesn't give it back to us.
				var fakeEmail = sid + '@instagram.com';
				User.create({username: sid, email: fakeEmail}, function(err, uid) {
					if(err) {
						return callback(err);
					}

					success(uid, false);
				});
			}
		});
	};

	Instagram.getUidByInstagramId = function(instagramId, callback) {
		db.getObjectField('instagramId:uid', instagramId, function(err, uid) {
			if (err) {
				return callback(err);
			}
			callback(null, uid);
		});
	};

	Instagram.addMenuItem = function(custom_header, callback) {
		custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		callback(null, custom_header);
	};

	Instagram.deleteUserData = function(uid, callback) {
		async.waterfall([
			async.apply(User.getUserField, uid, 'instagramId'),
			function(oAuthIdToDelete, next) {
				db.deleteObjectField('instagramId:uid', oAuthIdToDelete, next);
			}
		], function(err) {
			if (err) {
				winston.error('[sso-instagram] Could not remove OAuthId data for uid ' + uid + '. Error: ' + err);
				return callback(err);
			}
			callback(null, uid);
		});
	};

	module.exports = Instagram;
}(module));
