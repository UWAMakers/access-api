/* eslint-disable no-unused-vars */
const mjml2html = require('mjml');
const { NotImplemented, BadRequest } = require('@feathersjs/errors');
const { sendMessage } = require('../../util/discordWebhook');
const { verifyToken } = require('../../util/turnstile');
const { fromMd, sanitize } = require('../../util/markdown');

const contactHtml = mjml2html(`
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Someone has submitted the contact form on the Access website.
          </mj-text>
          <mj-text>
            Name: {{name}}
          </mj-text>
          <mj-text>
            Email: {{email}}
          </mj-text>
          <mj-text>
            Message:
            <br>
            {{message}}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`).html;
const getEmailBody = (name, email, message) => contactHtml
  .replace('{{name}}', sanitize(name, true))
  .replace('{{email}}', sanitize(email, true))
  .replace('{{message}}', fromMd(message));


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
    let discordSuccess = false;
    let emailSuccess = false;
    try {
      discordSuccess = await sendMessage({
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
    } catch (error) {
      console.error(error);
    }
    try {
      await this.app.service('notifications').create({
        email: {
          html: getEmailBody(name, email, message),
          to: 'exec@makeuwa.com',
          from: this.app.get('SMTP_USER'),
          replyTo: email,
          subject: 'Contact Form Submission',
        },
      });
      emailSuccess = true;
    } catch (error) {
      console.error(error);
    }
    return { success: discordSuccess || emailSuccess };
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
