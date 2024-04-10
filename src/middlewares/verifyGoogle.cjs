const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');

dotenv.config();

const client = new OAuth2Client();

async function validateGoogleToken(token) {
  // console.log(`verifyGoogleToken: ${token}`);
  console.log(`google client id: ${process.env.GOOGLE_CLIENT_ID}`);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
}

async function verifyGoogleToken(req, res, next) {
  try {
    const googleToken = req.headers['x-access-token'];
    const error = new Error('Unauthorized');
    error.status = 404;
    const { email } = await validateGoogleToken(googleToken).catch(console.error);

    if (!email) throw error;

    req.email = email;
    return req.email;
  } catch (error) {
    const status = error.status || error.code || 500;
    const message = error.message || 'Erro ao se conectar com o banco de dados';
    console.error(`${status}: ${message}`);
    return `${status}: ${message}`;
    // return res.status(status).json(message).end();
  } finally {
    next();
  }
}

exports.validateGoogleToken = validateGoogleToken;
exports.verifyGoogleToken = verifyGoogleToken;
