/* eslint-disable no-unused-vars */
const { NotImplemented } = require('@feathersjs/errors');
const axios = require('axios');
const messages = require('./createMessage');

exports.Feedback = class Feedback {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    throw new NotImplemented('Create is the only supported operation');
  }

  async get(id, params) {
    throw new NotImplemented('Create is the only supported operation');
  }

  async create(data, params) {
    const { msg } = data;
    const firstName = params.user.firstName || 'Anonymous';
    const lastName = params.user.lastName || 'Turtle';
    const fullName = `${firstName} ${lastName}`;
    if (process.env.FEEDBACK_WEBHOOK) {
      axios.post(process.env.FEEDBACK_WEBHOOK, messages.createMessage(fullName, msg));
    }
    return data;
  }

  async update(id, data, params) {
    throw new NotImplemented('Create is the only supported operation');
  }

  async patch(id, data, params) {
    throw new NotImplemented('Create is the only supported operation');
  }

  async remove(id, params) {
    throw new NotImplemented('Create is the only supported operation');
  }
};
