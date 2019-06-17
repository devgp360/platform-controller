const config = require("./config");
const htmlHint = require("htmlhint").HTMLHint;
const editor = null;
const content = null;
let result = null;

module.exports = function(content) {
  if (!content) { return []; }

  result = htmlHint.verify(content, config());

  return result;
};
