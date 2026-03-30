const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserDAO = require('../dao/UserDAO');

const userDAO = new UserDAO();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName || 'Google User';

        if (!email) {
          return done(new Error('Google account did not return an email address.'), null);
        }

        let user = await userDAO.findByEmail(email);

        if (!user) {
          await userDAO.createOAuthUser(fullName, email);
          user = await userDAO.findByEmail(email);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id }));

module.exports = passport;
