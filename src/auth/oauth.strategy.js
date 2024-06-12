const { OAuthStrategy: OriginalOAuthStrategy } = require('@feathersjs/authentication-oauth');
const errors = require('@feathersjs/errors');
const _ = require('lodash');
const { dataToToken } = require('../util/cryptMeTimbers');

class OAuthStrategy extends OriginalOAuthStrategy {

  getAvatarUrl(profile) {
    if (this.name === 'google') {
      return profile.picture;
    }
    if (this.name === 'discord') {
      return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
    }
    return null;
  }

  // eslint-disable-next-line no-unused-vars
  async getEntityData(profile, _existingEntity, _params) {
    if (!profile?.verified && !profile?.verified_email) {
      throw new errors.BadRequest('Email not verified');
    }
    const avatar = this.getAvatarUrl(profile);
    const email = _existingEntity?.preferredEmail
      || profile.email
      || profile.emails?.[0]?.value;
    return {
      [`${this.name}Id`]: profile.sub || profile.id,
      ...(email ? { preferredEmail: email, 'preferences.email': email } : {}),
      ...(avatar ? { 'preferences.avatarUrl': avatar } : {}),
    };
  }

  async getRedirect(data, params) {
    const redirect = await this.getAllowedOrigin(params);

    if (!redirect) {
      return null;
    }

    if (!data.accessToken && data.data?.linkToken) {
      return `${redirect}/login?linkToken=${encodeURIComponent(data.data.linkToken)}`;
    }
    
    const res = await super.getRedirect(data, params);
    return res;
  }

  async createEntity(profile, params) {
    const data = await this.getEntityData(profile, null, params);

    // debug('createEntity with data', data)

    // return this.entityService.create(data, _.omit(params, 'query'))

    throw new errors.NotFound('User not found. Please setup with pheme first.', {
      linkToken: dataToToken(data, this.app.get('authentication').secret),
    });
  }

  async updateEntity(entity, profile, params) {
    const id = entity[this.entityId];
    const data = await this.getEntityData(profile, entity, params);

    // debug(`updateEntity with id ${id} and data`, data)

    return this.entityService._patch(id, data, _.omit(params, 'query'));
  }

  async getEntity(result) {
    return result;
  }
}

module.exports = OAuthStrategy;