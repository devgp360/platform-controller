const _ = require("underscore-plus");
const cheerio = require("cheerio");
const esprima = require("esprima");
const htmlHint = require('./htmlhint/linter');
const cssParser = require('./csslint/parser');
const cssLinter = require('./csslint/linter');
const jsLinter = require('./jslint/linter');
const editor = null;
let compareCss = null;
let loadHtml = null;
const getcheckValue = null;
let checkPoint = 'incomplete';
let checkValue = null;
let promise = null;
const codeErrors = [];
const nameGrammar = null;

module.exports = function(currentPlatform, indexChallenge, editor) {
  if (!editor) { return; }

  const content = editor.getText();

  const compareHTML = function() {
    const editorParsed = loadHtml(content);

    const elements = editorParsed("body").find(checkValue.selector);

    if (elements.length > 0) {
      return checkPoint = 'complete';
    } else {
      return checkPoint = 'incomplete';
    }
  };

  loadHtml = function(text) {
    const dom = cheerio.load(text);
    if (!dom) { return; }
    return dom;
  };

  compareCss = function() {
    const parsedValue = cssParser(checkValue);
    const editorParsed = cssParser(content);

    return (() => {
      const result = [];
      for (let i = 0; i < parsedValue.length; i++) {
        const rule = parsedValue[i];
        const selectorValue = checkRules(editorParsed, rule);
        if (selectorValue) {
          if (checkCssStyle(selectorValue, rule)) {
            result.push(checkPoint = 'complete');
          } else {
            checkPoint = 'incomplete';
            break;
          }
        } else {
          checkPoint = 'incomplete';
          break;
        }
      }
      return result;
    })();
  };

  var checkRules = (editorParsed, parsedValue) => _.find(editorParsed, {selectorText: parsedValue.selectorText});

  var checkCssStyle = function(selectorValue, parsedValue) {
    if (!selectorValue) { return; }
    if (!parsedValue) { return; }

    return _.isEqual(selectorValue.style, parsedValue.style);
  };

  const compareJs = function() {
    let editorParsed;
    const parsedValue = esprima.parseScript(checkValue);

    try {
      editorParsed = esprima.parseScript(content);
    } catch (e) {
      return;
    }

    return _.forEach(parsedValue.body, token => {
      return (() => {
        const result = [];
        for (let i = 0; i < editorParsed.body.length; i++) {
          const editorToken = editorParsed.body[i];
          if (_.isEqual(token, editorToken)) {
            checkPoint = 'complete';
            break;
          } else {
            result.push(checkPoint = 'incomplete');
          }
        }
        return result;
      })();
    });
  };

  switch (editor.getGrammar().name) {
    case "HTML":
      if (currentPlatform.editors.HTML.challenges.length > 0) {
        checkValue = currentPlatform.editors.HTML.challenges[indexChallenge.HTML].code;
        promise = Promise.resolve(htmlHint(content));
        compareHTML();
      }
      break;
    case "CSS":
      if (currentPlatform.editors.CSS.challenges.length > 0) {
        checkValue = currentPlatform.editors.CSS.challenges[indexChallenge.CSS].code;
        promise = cssLinter(content);
        compareCss();
      }
      break;
    case "JavaScript":
      if (currentPlatform.editors.JavaScript.challenges.length > 0) {
        checkValue = currentPlatform.editors.JavaScript.challenges[indexChallenge.JavaScript].code;
        promise = Promise.resolve(jsLinter(content));
        compareJs();
      }
      break;

    default: return;
  }

  return Promise.resolve(promise).then( data =>
    ({
      grammar: editor.getGrammar().name,
      checkPoint,
      codeErrors: data
    })
  );
};
