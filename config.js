require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  storagePath: process.env.STORAGE_PATH,
  secretKey: process.env.SECRET_KEY || '5oMeR@nd0ms3cret!',
  publicUrl: process.env.PUBLIC_URL,
  oidcIssuerUrl: process.env.OIDC_ISSUER_URL || 'https://accounts.google.com',
  oidcClientId: process.env.OIDC_CLIENT_ID,
  oidcClientSecret: process.env.OIDC_CLIENT_SECRET,
};
