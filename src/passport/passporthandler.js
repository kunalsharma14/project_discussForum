/* PASSPORT LOCAL AUTHENTICATION */

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passUtils = require('../../../utils/passwordUtils')
const {findUserByParams, createUserLocal} = require('../../../controllers/user')

passport.serializeUser(function (user, done) {
    done(null, user.username)
})

passport.deserializeUser( function (username, done) {
	try {
		const user =findUserByParams({email:username});
		if(!user) {
			return done(new Error("No such user"))
		}
		return done(null, user);
	}
	catch (err){
		done(err)
	}	
})

passport.use({
		usernameField: 'email',
		passwordField: 'password'
	  },
	new LocalStrategy(function (username, password, done) {
	try {
		const user =findUserByParams({email:username});
        if (!user) {
            return done(null, false, {message: "No such user"})
		}
		let passhash=await pass2hash(password);
        if (user.password !== password) {
            return done(null, false, {message: "Wrong password"})
        }
        return done(null, user)
	}
	catch(err){
        return done(err)
    }
}))

exports = module.exports = passport

