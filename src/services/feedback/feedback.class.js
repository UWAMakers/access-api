/* eslint-disable no-unused-vars */
const { NotImplemented } = require('@feathersjs/errors');
const messages = require('./createMessage');

exports.Feedback = class Feedback {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  async find(params) {
    throw new NotImplemented('Create is the only supported operation');
  }

  async get(id, params) {
    throw new NotImplemented('Create is the only supported operation');
  }

  async create(data, params) {
    const { msg, versions } = data;
    const firstName = params.user?.firstName || 'Anonymous';
    const lastName = params.user?.lastName || 'Turtle';
    const fullName = `${firstName} ${lastName}`;
    const msgJson = messages.createMessage(fullName, msg, versions);
    // console.log(JSON.stringify(msgJson, null, 2));
    this.app.service('notifications').create({
      slack: {
        msgJson,
        // Text not actually needed but notification catcher crashes without it
        text: msg,
      },
    });
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
