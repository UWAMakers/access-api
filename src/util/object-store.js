const {
  PutObjectCommand,
  // HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } =require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const { tokenToData, dataToToken } = require('./cryptMeTimbers');
const { generateImageUrl } = require('@imgproxy/imgproxy-node');
const _ = require('lodash');

const defaultImgUrl = (url, height = 300, options = {}) => generateImageUrl({
  endpoint: process.env.IMGPROXY_ENDPOINT,
  url,
  options: {
    resizing_type: 'fit',
    height,
    gravity: { type: 'no' },
    enlarge: 1,
    expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    ...options,
  },
});

module.exports = (app) => {

  const client = new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true,
  });

  app.presignPutInit = async (file = {}, options = {}) => {
    const { name, fileType } = file;
    if (!name || !fileType) throw new Error('name and fileType are required');
    if (fileType === 'image' && !file.blurhash) {
      throw new Error('blurhash is required for images');
    }
    const bucket = fileType === 'image' 
      ? process.env.IMG_BUCKET
      : process.env.OBJ_BUCKET;
    const { service, id, field = 'files', isSingle = false } = options;
    if (!service || !id) throw new Error('service and id are required');
    await app.service(service).get(id); // check if item/service exists
    const ext = name.split('.').pop();
    const key = `${service}/${id}/${field}/${uuidv4()}.${ext}`;
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return {
      status: 'upload_required',
      url,
      token: dataToToken({
        file: {
          ...file,
          provider: fileType === 'image' ? 'fraser-image' : 'fraser-object',
          uri: `s3://${bucket}/${key}`,
        },
        key,
        bucket,
        options: { service, id, field, isSingle },
        url,
      }, app.get('authentication').secret),
    };
  };

  app.presignPutFinal = async (token) => {
    const { file, options, /* key, bucket */ } = tokenToData(token, app.get('authentication').secret);
    // for some reason, this is very broken
    // const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
    // console.log(command);
    // const res = await client.send(command);
    // console.log(res);
    // if (!Number(res.ContentLength)) throw new Error('File not found');
    const { service, id, field, isSingle } = options;
    const item = await app.service(service).get(id);
    if (!item) throw new Error('Item not found');
    if (isSingle && _.get(item, field)?.uri) {
      await app.removeFile(_.get(item, field).uri);
    }
    await app.service(service).patch(id, _.set(
      {},
      field,
      isSingle ? file : [..._.get(item, field, []), file],
    ));
    return { status: 'upload_complete' };
  };

  app.presignGet = async (file, options = {}) => {
    const { provider, blurhash } = file;
    if (!provider) return {};
    if (provider === 'fraser-image') {
      return {
        massiveUrl: defaultImgUrl(file.uri, 2000, options),
        largeUrl: defaultImgUrl(file.uri, 800, options),
        url: defaultImgUrl(file.uri, 400, options),
        smallUrl: defaultImgUrl(file.uri, 200, options),
        tinyUrl: defaultImgUrl(file.uri, 100, options),
        blurhash,
      };
    }
    const [bucket, ...keyParts] = file.uri.replace('s3://', '').split('/');
    const key = keyParts.join('/');
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return { url };
  };

  app.removeFile = async (uri) => {
    const [bucket, ...keyParts] = uri.replace('s3://', '').split('/');
    const key = keyParts.join('/');
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await client.send(command);
  };

};
