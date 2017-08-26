
import passport from 'koa-passport'

import LocalStrategy from 'passport-local';

module.exports = (app) => {
	app.passport = passport;
	app.koa.use(app.passport.initialize());
	app.koa.use(app.passport.session());

	const fetchUser = (() => {
  		// This is an example! Use password hashing in your
  		const user = {'test':{ id: 1, username: 'test', password: 'test' }}
  		return async (username) => {
  			return user[username];
  		}
	})()

	app.passport.serializeUser(function(user, done) {
		done(null, user.username)
	})

	app.passport.deserializeUser(async function(id, done) {
		try {
			const user = await fetchUser(id)
			done(null, user)
		} catch(err) {
			done(err)
		}
	})

	const LocalStrategy = require('passport-local').Strategy
	app.passport.use(new LocalStrategy(function(username, password, done) {
		fetchUser(username)
		.then(user => {
			if (username === user.username && password === user.password) {
				done(null, user)
			} else {
				done(null, false)
			}
		})
		.catch(err => done(err))
	}))

} 