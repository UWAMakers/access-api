const { checkContext } = require('feathers-hooks-common');
const axios = require('axios');
const errors = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    checkContext(context, 'before', ['get']);

    const { id, params, app, service } = context;
    let { query = {} } = params;
    
    if (!query.uuid) return context;

    const uuid = query.uuid
      .toLowerCase()
      .split(/[^0-9a-z]+/)
      .map((v) => Number.parseInt(v, query.encoding || 16));

    let body;
    try {
      const res = await axios.post(
        `${app.get('authEndpoint')}/api/${uuid ? 'card' : 'login'}`,
        {
          uuid,
          token: process.env.AUTH_TOKEN,
        }
      );
      body = res.data;
    } catch (err) {
      if (
        err.response &&
          err.response.status >= 400 &&
          err.response.status < 500
      ) {
        throw new errors.NotAuthenticated(err.response.data.message);
      }
      console.error(err); // eslint-disable-line
      throw new errors.NotAuthenticated(
        'Unknown login issue occured, please contact an administrator.'
      );
    }
    if (!body.success) throw new errors.NotAuthenticated(body.message);

    const { data } = await app.service('users').find({
      query: {
        username: body.user.username,
        $select: { _id: 1 },
      },
    });

    if (!data.length) throw new errors.NotFound('User not found');
    
    const { total } = await app.service('completions').find({
      query: {
        userId: data[0]._id,
        trainingId: id,
        status: 'complete',
        $limit: 0,
      },
    });

    context.result = await service.create({
      userId: data[0]._id,
      trainingId: id,
      granted: !!total,
      test: !!query.test,
    });

    if (!total) throw new errors.Forbidden('You do not have access to this.');

    return context;
  };
};
