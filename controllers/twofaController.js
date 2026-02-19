const speakeasy = require('speakeasy');
const qrcode    = require('qrcode');
const userModel = require('../models/userModel');

/**
 * GET /twofa/setup
 * Generate a TOTP secret, store it in the session, and render the 2FA setup page
 */
exports.getTwofaSetup = (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  req.session.twofa_temp_secret = secret.base32;
  qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
    if (err) throw err;
    res.render('twofa-setup', {
      qrCodeUrl: dataUrl,
      error: null         // define error to avoid ReferenceError
    });
  });
};

/**
 * POST /twofa/setup
 * Verify the setup token and enable 2FA in the database
 */
exports.postTwofaSetup = async (req, res) => {
  const userId = req.session.user?.id || req.user?.id;
  if (!userId) return res.redirect('/login');

  const token  = req.body.token;
  const secret = req.session.twofa_temp_secret;

  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1
  });

  if (verified) {
    await userModel.enableTwoFactor(userId, secret);
    delete req.session.twofa_temp_secret;
    return res.redirect('/dashboard');
  }

  // If verification fails, generate a new secret and QR code
  const newSecret = speakeasy.generateSecret({ length: 20 });
  req.session.twofa_temp_secret = newSecret.base32;
  qrcode.toDataURL(newSecret.otpauth_url, (err, dataUrl) => {
    if (err) throw err;
    res.render('twofa-setup', {
      qrCodeUrl: dataUrl,
      error: 'Invalid code, please try again.'
    });
  });
};

/**
 * GET /twofa/verify
 * Render the 2FA verification page after login
 */
exports.getTwofaVerify = (req, res) => {
  if (!req.session.temp_twofa_user) {
    return res.redirect('/login');
  }
  res.render('twofa-verify');
};

/**
 * POST /twofa/verify
 * Verify the 2FA token at login and finalize the user session
 */
exports.postTwofaVerify = async (req, res) => {
  const userId = req.session.temp_twofa_user.id;
  const token  = req.body.token;

  const user = await userModel.getUserById(userId);
  const verified = speakeasy.totp.verify({
    secret: user.twofa_secret,
    encoding: 'base32',
    token,
    window: 1
  });

  if (!verified) {
    return res.render('twofa-verify', { error: 'Invalid 2FA code.' });
  }

  delete req.session.temp_twofa_user;
  req.session.user = { id: user.id, username: user.username };
  res.redirect('/dashboard');
};

/**
 * GET /twofa/disable
 * Disable two-factor authentication and redirect to dashboard
 */
exports.disableTwofa = async (req, res) => {
  await userModel.disableTwoFactor(req.user.id);
  delete req.session.user.twofa_enabled; 
  res.redirect('/dashboard');
};
