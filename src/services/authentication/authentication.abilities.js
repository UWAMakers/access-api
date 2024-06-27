// src/services/authentication/authentication.abilities.js
const {
  createMongoAbility,
  AbilityBuilder,
  createAliasResolver,
} = require('@casl/ability');

// don't forget this, as `read` is used internally
const resolveAction = createAliasResolver({
  update: 'patch', // define the same rules for update & patch
  read: ['get', 'find'], // use 'read' as a equivalent for 'get' & 'find'
  delete: 'remove', // use 'delete' or 'remove'
});

const defineRulesFor = async (user, app) => {
  // also see https://casl.js.org/v5/en/guide/define-rules
  const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);

  if (user.isLabelPrinter) {
    can('manage', 'labels', { printerId: user._id });
    can('read', 'label-printers', { _id: user._id });
    can('update', 'label-printers', ['lastHeartbeat'], { _id: user._id });
    return rules;
  }

  if (user.roles?.includes('super_admin')) {
    // super_admin can do evil
    can('manage', 'all');
    return rules;
  }

  if (user.roles?.includes('admin')) {
    can('manage', 'home-links');
    can('manage', 'trainings');
    can('manage', 'training-items');
    can('manage', 'notification-templates');
    can('manage', 'inductions');
    can('manage', 'reviews');
    can('read', 'completions');
    can('read', 'users');
    can('read', 'access');
    can('update', 'users', ['displayName', 'preferences']);
    return rules;
  }

  const userId = (field = '_id') => ({ [field]: { $in: [`${user._id}`] } });
  const inductItems = await app.service('training-items').find({
    query: { inductorIds: user._id, $select: { _id: 1 } },
    paginate: false,
  });

  can('read', 'home-links');
  can('read', 'trainings');
  can('read', 'training-items');
  can('read', 'inductions-pending');
  can('read', 'completions', userId('userId'));
  can('read', 'reviews', userId('userId'));
  can('update', 'users', ['displayName', 'preferences'], userId());
  cannot('delete', 'users', userId());
  can('create', 'reviews', ['itemId', 'userId', 'url'], userId('userId'));
  can('update', 'reviews', userId('userId'));

  if (inductItems.length) {
    const itemId = { $in: inductItems.map(({ _id }) => _id) };
    can('read', 'inductions', { ...userId('inductorId'), itemId });
    can('create', 'inductions', { ...userId('inductorId'), itemId });
    can('update', 'inductions', { ...userId('inductorId'), itemId });
    can('read', 'users');
  } else {
    can('read', 'users', userId());
  }

  return rules;
};

const defineAbilitiesFor = async (user, app) => {
  const rules = await defineRulesFor(user, app);

  return createMongoAbility(rules, { resolveAction });
};

module.exports = {
  defineRulesFor,
  defineAbilitiesFor,
};
