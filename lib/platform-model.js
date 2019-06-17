const _ = require("underscore-plus");

module.exports = {
  saveItem(index, content) {
    if (!index) { return; }
    if (!content) { return; }
    localStorage.setItem(index, JSON.stringify(content));
    return content;
  },

  getItem(index, content) {
    const item = localStorage.getItem(index);

    if (item === 'undefined') {
      return null;
    } else {
      return JSON.parse(item);
    }
  },

  getModel() {
    return {
      user: "guest",
      platforms: []
    };
  },

  getCurrentPlatform(id, dataPlatforms) {
    if (!id) { return; }
    if (!dataPlatforms) { return; }
    return _.find(dataPlatforms, {'id': id * 1});
  },

  updateAdvace(userAdvance, currentAdvance) {
    const indexPlatform = _.findIndex(userAdvance.platforms, {'id': currentAdvance.id});

    if (indexPlatform !== -1) {
      userAdvance.platforms[indexPlatform].id = currentAdvance.id;
      return userAdvance.platforms[indexPlatform].editors = currentAdvance.editors;
    } else {
      const newPlatform = {
        id: currentAdvance.id,
        editors: currentAdvance.editors
      };
      return userAdvance.platforms.push(newPlatform);
    }
  },

  remove(index) {}
};
