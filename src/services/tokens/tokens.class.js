const { Service } = require('feathers-mongoose');

exports.Tokens = class Tokens extends Service {
  _removeExpiredTokens() {
    // Remove tokens that expired more than 7 days ago
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return this.Model.deleteMany({ expiresAt: { $lt: new Date(sevenDaysAgo) } });
  }
};
