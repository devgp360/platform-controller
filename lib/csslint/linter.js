const config = require('./config');
const stylelint = require('stylelint');
const editor = null;
const content = null;
const result = null;

module.exports = function(content) {
  if (!content) { return []; }

  return stylelint.lint({
    config: config(),
    code: content
  });
};
