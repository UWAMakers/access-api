/* eslint-disable no-unused-vars */
const _ = require('lodash');
const { NotImplemented } = require('@feathersjs/errors');
const {compileTemplate, getRenderContext} = require('../../util/email/template.js');

const marked = require('marked');

const compileMarkdown = (text) => {
  return marked(text);
};

exports.NotificationsPreview = class NotificationsPreview  {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  async create(data, params) { 
    const {body, ctaText = '', ctaLink = ''} = data;
    const markdownHtml = compileMarkdown(body);
    const template = {
      body: markdownHtml,
      buttonLink: ctaLink,
      buttonText: ctaText,
      subject: 'Your cool induction'
    };
    const recipient = {
      'firstName': 'Jo'
    };
    const training = {};
    const users = [
      {
        name: 'Austin Powers',
        username: '12345678',
        _id: 'b288fb37-6f67-4797-8301-c8270ca9ad9e',
      },
      {
        name: 'Nathan Lyon',
        username: '87654321',
        _id: 'b288fb37-6f67-4797-8301-c8270ca9ad9f',
      },
    ];
    const renderContext = getRenderContext(template, recipient, training, users);
    const emailHtml = compileTemplate(renderContext);
    return {body, emailHtml};
  }

  async find(params) {
    throw new NotImplemented('Create is the only supported operation');
  }
  async get(params) {
    throw NotImplemented('Create is the only supported operation');
  }
  async update(id, data, params) {
    throw NotImplemented('Create is the only supported operation');
  }
  async patch(id, data, params) {
    throw NotImplemented('Create is the only supported operation');
  }
  async remove(id, params) {
    throw NotImplemented('Create is the only supported operation');
  }
};
