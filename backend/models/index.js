// Models Index for EcoLens
// Export all MongoDB models from a single entry point

const User = require('./User');
const Emission = require('./Emission');

module.exports = {
  User,
  Emission
};
