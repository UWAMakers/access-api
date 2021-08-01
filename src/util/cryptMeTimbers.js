const crypto = require('crypto');

const algorithm = 'aes-256-ctr';

const encrypt = (text, iv, secretKey) => {

  const cipher = crypto.createCipheriv(algorithm, secretKey.padEnd(32, secretKey), Buffer.from(iv.padEnd(32, iv), 'hex'));

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return encrypted.toString('base64');
};

const decrypt = (content, iv, secretKey) => {

  const decipher = crypto.createDecipheriv(algorithm, secretKey.padEnd(32, secretKey), Buffer.from(iv.padEnd(32, iv), 'hex'));

  const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'base64')), decipher.final()]);

  return decrpyted.toString();
};

module.exports = {
  encrypt,
  decrypt,
};