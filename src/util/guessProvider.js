
const sanitiseHtml = (html) => html
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, '\'')
  .replace(/&#\d+;/g, (match) => String.fromCharCode(Number(match.slice(2, -1))));


const tryMetaTag = (html, tag) => {
  const match = html.match(new RegExp(`<meta[^>]+property="og:${tag}"[^>]*>`));
  if (!match) return null;
  const content = match[0].match(/content="([^"]+)"/);
  if (!content) return null;
  return sanitiseHtml(content[1]);
};

const tryTitle = (html) => {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/);
  return match ? sanitiseHtml(match[1]) : null;
};

// see if there's a .pdf etc in the uri, and if so, return the file name
const tryUriName = (uri) => {
  const match = uri.match(/\/([^/]+)\.(pdf|docx|doc|xls|xlsx|ppt|pptx|csv|txt|md|json|xml|png|jpg|jpeg|gif|svg|webp|mp4|flv|mkv|mp3|wav|flac|ogg)($|\?)/);
  return match ? match[1] : null;
};

const sniffUri = async (uri) => {
  const head = await fetch(uri, { method: 'HEAD' }).then(res => res.ok ? res.headers : null);
  if (!head) return { uri };
  let html = '';
  const contentType = head.get('content-type');
  const contentLength = Number(head.get('content-length') || 0);
  if (contentType.includes('text/html') && contentLength < 5 * 1024 * 1024) {
    html = await fetch(uri).then(res => res.ok ? res.text() : '');
    const headEnd = html.indexOf('</head>');
    if (headEnd !== -1) html = html.slice(0, headEnd);
    else html = '';
  }
  const name = tryMetaTag(html, 'title') || tryTitle(html) || tryUriName(uri);
  const description = tryMetaTag(html, 'description');
  return {
    uri,
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
  };
};

module.exports = async (uri, skipSniff = false) => {
  // youtube regex from https://regexr.com/3dj5t / https://stackoverflow.com/questions/19377262/regex-for-youtube-url
  // eslint-disable-next-line no-useless-escape
  const youtubeRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu\.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/i;
  // vimeo regex from https://regexr.com/3begm
  // eslint-disable-next-line no-useless-escape
  const vimeoRegex = /^(http|https)?:\/\/(www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/i;

  // https://docs.google.com/document/d/1VBFFT0S05sJrJ0uwtuYASO_nZ_c8XS8v7-hOK9960vA/edit?usp=sharing
  const googleDriveRegex = /^https:\/\/\w+\.google\.com\//i;

  const sharepointRegex = /^https:\/\/\w+\.sharepoint\.com\//i;

  const sniff = (!skipSniff && uri.startsWith('http'))
    ? await sniffUri(uri)
    : { uri };

  if (youtubeRegex.test(uri)) {
    const ref = uri.match(youtubeRegex)[5]; // fith group is the youtube code
    const url = `https://www.youtube.com/embed/${ref}`;
    return {
      provider: 'youtube',
      ...sniff,
      uri: url,
    };
  }

  if (vimeoRegex.test(uri)) {
    const ref = uri.match(vimeoRegex)[4]; // fouth group is the vimeo code
    const url = `https://player.vimeo.com/video/${ref}`;
    return {
      provider: 'vimeo',
      ...sniff,
      uri: url,
    };
  }

  let provider = 'link';
  if (googleDriveRegex.test(uri)) {
    provider = 'google-drive';
  } else if (sharepointRegex.test(uri)) {
    provider = 'sharepoint';
  }

  return {
    provider,
    ...sniff,
  };
};
