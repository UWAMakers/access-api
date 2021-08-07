const axios = require('axios');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAuthenticated } = require('@feathersjs/errors');
const { encrypt } = require('../util/cryptMeTimbers');

const fix = (name = '') => name.trim().replace(/\s+\(\d+\)$/, '');

if (process.env.NODE_ENV !== 'production') {
  console.warn('Warning: not in production mode, enabling demo user'); // eslint-disable-line
}

class PhemeStrategy extends LocalStrategy {
  // eslint-disable-next-line no-unused-vars
  async authenticate(data, params) {
    const { username, password, uuid } = data;
    const isDemoUser =
      process.env.NODE_ENV !== 'production' &&
      username === '12345678' &&
      password === 'demo';
    let body = null;
    if (isDemoUser) {
      body = {
        success: true,
        user: {
          username,
          email: '12345678@example.uwa.edu.au',
          firstname: 'Jo',
          lastname: 'Blogs',
        },
      };
    } else {
      try {
        const res = await axios.post(
          `${this.app.get('authEndpoint')}/api/${uuid ? 'card' : 'login'}`,
          {
            user: username,
            pass: password,
            uuid,
            token: process.env.AUTH_TOKEN,
            userToken: true,
          }
        );
        body = res.data;
      } catch (err) {
        if (
          err.response &&
          err.response.status >= 400 &&
          err.response.status < 500
        ) {
          throw new NotAuthenticated(err.response.data.message);
        }
        console.error(err); // eslint-disable-line
        throw new NotAuthenticated(
          'Unknown login issue occured, please contact an administrator.'
        );
      }
    }
    if (!body.success) throw new NotAuthenticated(body.message);
    const users = await this.app
      .service('users')
      .find({ query: { username: body.user.username }, paginate: false });
    let user = null;
    const fixedFirstName = fix(body.user.firstname);

    const userObj = {
      username: body.user.username,
      email: body.user.email,
      firstName: fixedFirstName,
      lastName: body.user.lastname,
      displayName: fixedFirstName,
    };
    if (users.length === 0) {
      user = await this.app.service('users').create(userObj);
    } else {
      userObj.displayName = users[0].displayName || userObj.displayName;
      user = await this.app.service('users').patch(users[0]._id, userObj);
    }
    if (body.userToken && params.payload) {
      params.payload.utok = encrypt(body.userToken, `${user._id}`, this.app.get('authentication').secret);
    }
    return {
      authentication: { strategy: this.name },
      user,
    };
  }
}

module.exports = PhemeStrategy;
