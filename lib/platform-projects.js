const {CompositeDisposable} = require('atom');
const path   = require('path');
const fsPlus = require('fs-plus');
const _      = require('underscore');
const fs     = require('fs');

module.exports = function() {
  this.templatesRoot = path.join(atom.getUserInitScriptPath(), '../../Documents', 'PathWorlds');
  this.assetsRoot    = path.join(__dirname, "../", "projects");

  fsPlus.makeTreeSync(this.templatesRoot);

  if (fsPlus.existsSync( path.join(this.templatesRoot) )) {
    return fsPlus.copySync(this.assetsRoot, path.join(this.templatesRoot, "projects"), {overwrite: true});
  }
};
