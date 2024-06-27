
const isDev = process.env.NODE_ENV !== 'production';

const hasPort = (domain) => /:\d+/.test(domain);

const normalise = (dirty) => {
  const protocol = !hasPort(dirty) || dirty.startsWith('https://') ? 'https' : 'http';
  return `${protocol}://${
    dirty
      .replace(/^https?:\/\//, '')
      .replace(/\//g, '')
  }`;
};

const validDomains = [
  'uwamakers.com',
  'access-neo.pages.dev',
];

module.exports = (params, app) => {
  const { CLIENT_DOMAIN } = app.get('CLIENT_DOMAIN');
  let domain = params.headers.origin
    || params.headers.referer
    || CLIENT_DOMAIN;
  domain = normalise(domain);
  if (!isDev && hasPort(domain)) return normalise(CLIENT_DOMAIN);
  if (isDev && hasPort(domain)) return domain;
  const isValid = validDomains.map((d) => `https://${d}`).includes(domain)
    || validDomains.some((d) => new RegExp(`\\.${d.replace(/\./g, '\\.')}$`).test(domain));
  return isValid ? domain : normalise(CLIENT_DOMAIN);
};
