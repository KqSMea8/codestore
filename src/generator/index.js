require('core-js'); // es2015 polyfill
const nodePlop = require('./node-plop');

/**
 * Main node-plop module
 *
 * @param {string} plopfilePath - The absolute path to the plopfile we are interested in working with
 * @param {object} plopCfg - A config object to be passed into the plopfile when it's executed
 * @returns {object} the node-plop API for the plopfile requested
 */
module.exports = nodePlop;
