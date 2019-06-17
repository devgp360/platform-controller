const config = require("./config");
const jsLint = require("jslint").load(atom.config.get("jslint.jslintVersion"));
const jsLinter = require("jslint").linter.doLint;
const editor = null;
const content = null;
let result = null;

module.exports = function(content) {
  if (!content) { return []; }

  result = jsLinter(jsLint, content, config());

  for (let i = 0; i < result.errors.length; i++) {
    const message = result.errors[i];
    if ((message != null) && (message.code != null)) {
      if (message.code === "missing_use_strict") {
        result.errors.splice(i, 1);
      }
    }
  }

  return result.errors;
};
