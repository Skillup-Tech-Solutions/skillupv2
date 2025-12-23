const passport = require("passport");
const { OIDCStrategy } = require("passport-azure-ad");

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new OIDCStrategy({
  identityMetadata: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  responseType: 'code',
  responseMode: 'form_post',
  redirectUrl: process.env.MICROSOFT_REDIRECT_URI,
  allowHttpForRedirectUrl: true,
  scope: ['profile', 'email'],
  passReqToCallback: false
}, (iss, sub, profile, accessToken, refreshToken, done) => {
  if (!profile.oid) return done(new Error("No OID found."), null);
  return done(null, profile);
}));
