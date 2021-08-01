const axios = require('axios');
const errors = require('@feathersjs/errors');
const { decrypt } = require('../../util/cryptMeTimbers');

const setId = (card) => ({ _id: card.cardId, ...card });

/* eslint-disable no-unused-vars */
exports.Cards = class Cards {
  constructor (options) {
    this.options = options || {};
    this.app = this.options.app;
  }

  getUserToken (params) {
    const { accessToken } = params.authentication;
    const { utok } = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString('utf8'));
    return decrypt(utok, `${params.user._id}`, this.app.get('authentication').secret);
  }

  async request (opts, params) {
    const token = this.getUserToken(params);
    try {
      const { data } = await axios({
        ...opts,
        params: {
          ...opts.params,
          token
        },
      });
      if (!data.success) throw new errors.GeneralError(data.message);
      return data;
    } catch (err) {
      if (
        err.response &&
        err.response.status >= 400 &&
        err.response.status < 500
      ) {
        throw new errors.GeneralError(err.response.data.message);
      }
      console.error(err); // eslint-disable-line
      throw new errors.GeneralError(
        'Unknown issue occured, please contact an administrator.'
      );
    }
  }

  async find (params) {
    const { cards } = await this.request({
      method: 'get',
      url: `${this.app.get('authEndpoint')}/api/user/cards`,
    }, params);
    return { data: cards.map(setId), total: cards.length, limit: cards.length, skip: 0 };
  }

  async get (id, params) {
    const { card } = await this.request({
      method: 'get',
      url: `${this.app.get('authEndpoint')}/api/user/cards/${id}`,
    }, params);
    return setId(card);
  }

  async create ({ uuid, name }, params) {
    if (
      !Array.isArray(uuid)
      || uuid.length !== 4
      || uuid.some(x => !Number.isInteger(x) || x < 0 || x > 255)
    ) {
      throw new errors.BadRequest('Invalid UUID');
    }
    if (name && typeof name !== 'string') {
      throw new errors.BadRequest('Invalid name');
    }
    const { card } = await this.request({
      method: 'post',
      url: `${this.app.get('authEndpoint')}/api/user/cards`,
      data: { uuid, name },
    }, params);
    return setId(card);
  }

  async update (id, data, params) {
    return this.patch(id, data, params);
  }

  async patch (id, { name }, params) {
    if (typeof name !== 'string') {
      throw new errors.BadRequest('Invalid name');
    }
    const { card } = await this.request({
      method: 'post',
      url: `${this.app.get('authEndpoint')}/api/user/cards/${id}`,
      data: { name },
    }, params);
    return setId(card);
  }

  async remove (id, params) {
    const { card } = await this.request({
      method: 'delete',
      url: `${this.app.get('authEndpoint')}/api/user/cards/${id}`,
    }, params);
    return setId(card);
  }
};
