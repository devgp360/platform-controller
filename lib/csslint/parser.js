module.exports = (text) => {
  let tokenizer = /([\s\S]+?)\{([\s\S]*?)\}/gi,
      rules = [],
      rule, token;
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');

  while ( (token=tokenizer.exec(text)) ) {
    style = parseRule( token[2].trim() );
    style.cssText = stringifyRule(style);
    rule = {
      selectorText : token[1].trim().replace(/\s*\,\s*/, ', '),
      style : style
    };
    rule.cssText = rule.selectorText + ' { ' + rule.style.cssText + ' }';
    rules.push(rule);
  }
  return rules;

  function parseRule(css) {
    let tokenizer = /\s*([a-z\-]+)\s*:\s*((?:[^;]*url\(.*?\)[^;]*|[^;]*)*)\s*(?:;|$)/gi,
      obj = {},
      token;
    while ( (token=tokenizer.exec(css)) ) {
      obj[token[1].toLowerCase()] = token[2];
    }
    return obj;
  }

  function stringifyRule(style) {
    let text = '',
      keys = Object.keys(style).sort();
    for (let i=0; i<keys.length; i++) {
      text += ' ' + keys[i] + ': ' + style[keys[i]] + ';';
    }
    return text.substring(1);
  }
}
