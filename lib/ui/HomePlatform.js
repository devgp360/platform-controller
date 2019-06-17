let HomePlatform;
const helper = require('./helper');

module.exports =
(HomePlatform = class HomePlatform extends helper {
  /**
  * [constructor HomePlatform in atom]
  *
  * @method constructor
  *
  * @param  {[tag]}         name  [name of the element like x-foo]
  */

  constructor(name) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.component = this.createComponent(name);
  }
});
