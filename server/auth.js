const { Router } = require('express');
const { Issuer } = require('openid-client');
const {
  oidcIssuerUrl,
  oidcClientId,
  oidcClientSecret,
  publicUrl,
} = require('../config');

const callbackUri = `${publicUrl}/auth/callback`;

let client;

(async () => {
  const issuer = await Issuer.discover(oidcIssuerUrl);
  client = new issuer.Client({
    client_id: oidcClientId,
    client_secret: oidcClientSecret,
    redirect_uris: [callbackUri],
    response_types: ['code'],
  });
})();

const router = new Router();

router.get('/login', (req, res) => {
  const authUrl = client.authorizationUrl({
    scope: 'openid email profile',
    response_mode: 'form_post',
  });
  res.redirect(authUrl);
});

router.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
});

router.post('/callback', async (req, res) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(callbackUri, params);
    const claims = tokenSet.claims();
    req.session.user = claims;
    console.log(claims);
    const url = '/';
    res.send(`<meta http-equiv="refresh" content="0;URL=${url}">`);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/status', (req, res) => {
  res.json(req.session.user);
});

module.exports = router;
