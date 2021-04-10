const axios = require('axios');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAuthenticated } = require('@feathersjs/errors');

if(process.env.NODE_ENV !== 'production'){
  console.warn('Warning: not in production mode, enabling demo user'); // eslint-disable-line
}

class PhemeStrategy extends LocalStrategy {
  // eslint-disable-next-line no-unused-vars
  async authenticate(data, params) {
    const { username, password } = data;
    const isDemoUser = process.env.NODE_ENV !== 'production' && username === '12345678' && password === 'demo';
    let body = null;
    if(isDemoUser){
      body = {success: true, user: {username, email: '12345678@example.uwa.edu.au', firstname: 'Jo', lastname: 'Blogs'}};
    } else {
      try {
        const res = await axios.post('https://auth.systemhealthlab.com/api/login', {
          user: username,
          pass: password,
          token: process.env.AUTH_TOKEN,
        });
        body = res.data;
      } catch(err) {
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          console.error(err); // eslint-disable-line
          throw new NotAuthenticated(err.response.data.message);
        }
        console.error(err); // eslint-disable-line
        throw new NotAuthenticated('Unknown login issue occured, please contact an administrator.');
      }
      if(!body.success) throw new NotAuthenticated(body.message);
      const users = await this.app.service('users').find({query: {username: body.user.username}, paginate: false});
      let user = null;
      const data = {
        username: body.user.username,
        email: body.user.email,
        firstName: body.user.firstname,
        lastName: body.user.lastname,
        displayName: body.user.firstname,
      };
      if(users.length === 0) {
        user = await this.app.service('users').create(data);
      } else {
        data.displayName = users[0].displayName || data.displayName;
        user = await this.app.service('users').patch(users[0]._id, data);
      }
      return {
        authentication: { strategy: this.name },
        user,
      };
    }
  }
}

module.exports = PhemeStrategy;