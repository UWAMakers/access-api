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

const hash = (texts) => {
  const shaHash = crypto.createHash('sha256');
  if (Array.isArray(texts)) texts.forEach(text => shaHash.update(text));
  else shaHash.update(texts);
  return shaHash.digest('base64');
};

const dataToToken = (data, secret) => {
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64');
  const sign = hash([encoded, secret]);
  return `${encoded}.${sign}`;
};

const tokenToData = (token, secret) => {
  const [encoded, sign] = token.split('.');
  const check = hash([encoded, secret]);
  if (check !== sign) throw new Error('Invalid token');
  return JSON.parse(Buffer.from(encoded, 'base64').toString());
};

module.exports = {
  encrypt,
  decrypt,
  hash,
  dataToToken,
  tokenToData,
};