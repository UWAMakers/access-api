// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
// take in a token and return a boolean
const { NotImplemented } = require('@feathersjs/errors');

const verifyToken = async (token) => {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    throw new NotImplemented('TURNSTILE_SECRET_KEY is not set');
  }
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });
  const data = await response.json();
  return data.success;
};

module.exports = {
  verifyToken,
};
