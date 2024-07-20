const { Service } = require('feathers-mongoose');
const { BadRequest } = require('@feathersjs/errors');
const guessProvider = require('../../util/guessProvider');

exports.Thing = class Thing extends Service {
  
  constructor(options, app) {
    super(options);
    this.app = app;
  }

  // eslint-disable-next-line no-unused-vars
  async addFile(data, params) {
    const { id, field, file, token } = data;
    if (token) {
      return this.app.presignPutFinal(token);
    }
    const { name, type, fileType, provider } = file;
    if (!id || !field || !name || !type || !fileType) {
      throw new BadRequest('id, field, name, type, fileType, are required');
    }
    if (field === 'images' || field === 'mainImage') {
      if (provider && provider !== 'fraser-image') {
        throw new BadRequest('provider must be fraser-image');
      }
      if (fileType !== 'image') {
        throw new BadRequest('fileType must be image');
      }
    } else if (field !== 'resources') {
      throw new BadRequest('field must be images or resources');
    }
    let isSingle = field === 'mainImage';
    if (!provider || ['fraser-image', 'fraser-object', 's3'].includes(provider)) {
      return this.app.presignPutInit(file, { service: 'things', id, field, isSingle });
    }
    if (!file.uri) throw new BadRequest('uri is required');
    const guessed = await guessProvider(file.uri, true);
    file.provider = guessed.provider || provider;
    file.uri = guessed.uri || file.uri;
    const thing = await this.get(id);
    await this.patch(id, { [field]: [...(thing[field] || []), file] });
    return { status: 'upload_complete' };
  }

  // eslint-disable-next-line no-unused-vars
  async removeFile(data, params) {
    const { id, field, uri } = data;
    if (!id || !field || !uri) {
      throw new BadRequest('id, field, uri are required');
    }
    if (field === 'mainImage') {
      throw new BadRequest('cannot remove mainImage');
    }
    const thing = await this.get(id);
    const files = thing[field] || [];
    const newFiles = files.filter(f => f.uri !== uri);
    const removed = files.length !== newFiles.length;
    if (!removed) {
      throw new BadRequest('file not found');
    }
    if (uri.startsWith('s3://')) await this.app.removeFile(uri);
    return this.patch(id, { [field]: newFiles });
  }

  // eslint-disable-next-line no-unused-vars
  async editFile(data, params) {
    const { id, field, uri, name, description, type } = data;
    if (!id || !field || !uri || !name) {
      throw new BadRequest('id, field, uri, name are required');
    }
    if (field === 'mainImage') {
      throw new BadRequest('cannot edit mainImage');
    }
    const thing = await this.get(id);
    const files = thing[field] || [];
    const newFiles = files.map(f => {
      if (f.uri === uri) {
        return { ...f, name, description, type };
      }
      return f;
    });
    return this.patch(id, { [field]: newFiles });
  }

  checkFileLink({ uri }) {
    if (!uri) throw new BadRequest('uri is required');
    return guessProvider(uri, false);
  }
};
