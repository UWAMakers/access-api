// src/services/authentication/authentication.abilities.js
const { AbilityBuilder, createAliasResolver, makeAbilityFromRules } = require('feathers-casl');

// don't forget this, as `read` is used internally
const resolveAction = createAliasResolver({
  update: 'patch',       // define the same rules for update & patch
  read: ['get', 'find'], // use 'read' as a equivalent for 'get' & 'find'
  delete: 'remove'       // use 'delete' or 'remove'
});

const defineRulesFor = (user) => {
  // also see https://casl.js.org/v5/en/guide/define-rules
  const { can, cannot, rules } = new AbilityBuilder();

  if (user.roles.includes('super_admin')) {
    // super_admin can do evil
    can('manage', 'all');
    return rules;
  }

  if (user.roles.includes('admin')) {
    can('manage', 'trainings');
    can('manage', 'trainingItems');
    can('read', 'completions');
    can('read', 'users');
    can('update', 'users', ['displayName', 'preferences']);
    return rules;
  }

  const userId = (field = '_id') => ({ [field]: { $in: [`${user._id}`] } });

  can('read', 'trainings');
  can('read', 'trainingItems');
  can('read', 'completions', userId('userId'));
  can('read', 'users', userId());
  can('update', 'users', ['displayName', 'preferences'], userId());
  cannot('delete', 'users', userId());

  return rules;
};

const defineAbilitiesFor = (user) => {
  const rules = defineRulesFor(user);

  return makeAbilityFromRules(rules, { resolveAction });
};

module.exports = {
  defineRulesFor,
  defineAbilitiesFor
};