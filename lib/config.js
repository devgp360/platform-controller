let path = require("path");
const fs = require("fs");
const os = require("os");

const PathWorlds = require('./schema-config.json');

module.exports = function() {
  let config = null;

  if (PathWorlds === null) {
    let pathPackage;
    const dirPaths = atom.packages.getPackageDirPaths();

    for (let i = 0; i < dirPaths.length; i++) {
      path = dirPaths[i];
      if (fs.existsSync(`${path}/platform-controller/lib/schema-config.json`)) {
        pathPackage = `${path}/platform-controller/lib/schema-config.json`;
      }
    }

    try {
      config = JSON.parse(fs.readFileSync(pathPackage, "utf-8"));
    } catch (err) {
      if (defaultConfigPath && (err.code !== "ENOENT")) { console.log(`Error reading config file "${defaultConfigPath}": ${err}`); }
    }
  } else {
    config = PathWorlds;
  }

  return config;
};