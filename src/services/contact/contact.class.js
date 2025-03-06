/* eslint-disable no-unused-vars */
const { NotImplemented, BadRequest } = require('@feathersjs/errors');
const { sendMessage } = require('../../util/discordWebhook');
const { verifyToken } = require('../../util/turnstile');

exports.Contact = class Contact {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  async find(params) {
    throw new NotImplemented('Create is the only supported operation');
  }

  async get(id, params) {
    if (id === 'sitekey') {
      return { sitekey: process.env.TURNSTILE_SITE_KEY };
    }
    throw new NotImplemented('Create is the only supported operation');
  }

  async create(data, params) {
    const { name, email, message, token } = data;
    console.log(data);
    if (!token) {
      throw new BadRequest('Missing token');
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      throw new BadRequest('Invalid token');
    }
    if (!message || !name || !email) {
      throw new BadRequest('Missing required fields');
    }
    if (message.length > 4096) {
      throw new BadRequest('Message too long');
    }
    if (name.length > 1024) {
      throw new BadRequest('Name too long');
    }
    if (email.length > 1024) {
      throw new BadRequest('Email too long');
    }
    const success = await sendMessage({
      embeds: [{
        type: 'rich',
        title: 'Contact Form Submission',
        fields: [
          { name: 'Name', value: name },
          { name: 'Email', value: email },
        ],
        description: message,
      }],
    });
    return { success };
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
