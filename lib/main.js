let jQ;
const {CompositeDisposable} = require('atom');
const FeedBackView = require('./ui/feedback-view');
const ToolbarView = require('./ui/toolbar-view');
const MainMenuView = require('./ui/mainmenu-view');
const HomeView = require('./ui/home-view');
const codeParser = require('./codeParser');
const disposables = new CompositeDisposable;
const {name} = require('../package.json');
const PlatformModel = require('./platform-model');
const PlatformProjects = require('./platform-projects');
const config = require('./config');
const path = require("path");
const fs = require("fs");
const fsPlus = require('fs-plus');
const $ = (jQ = require('jquery'));
const checkCode = null;
let validateCode = null;
let userAdvance = null;
let currentPlatform = null;
let userPlatform = null;
const currentChallenge = {
  HTML: null,
  CSS: null,
  JavaScript: null
};
let messages = {
  HTML: {},
  CSS: {},
  JavaScript: {}
};
const currentAdvance = {
  welcome: 0,
  editors: {
    HTML: {
      challenge: 0,
      complete: "incomplete",
      hint: 0,
      messageError: 0,
      messageSuccess: 0
    },
    CSS: {
      challenge: 0,
      complete: "incomplete",
      messageError: 0,
      messageSuccess: 0
    },
    JavaScript: {
      challenge: 0,
      complete: "incomplete",
      messageError: 0,
      messageSuccess: 0
    }
  }
};
let markers = [];

module.exports = {
  config: {
    validateOnChange: {
      title: "Validate while typing",
      type: "boolean",
      default: false
    }
  },

  activate(state) {
    this.start();
    this.dataPlatforms = config();
    ({ validateCode } = this);
    userAdvance = PlatformModel.getItem('PathWorlds');
    this.orientation = 'horizontal';

    if (userAdvance === null) {
      userAdvance = PlatformModel.getModel();
    }

    this.templatesRoot = path.join(atom.getUserInitScriptPath(), '../../Documents', 'PathWorlds');

    if ((userAdvance.projectsInstalled === false) || (fsPlus.existsSync( path.join(this.templatesRoot) ) === false)) {
      PlatformProjects();
      userAdvance.projectsInstalled = true;
      PlatformModel.saveItem('PathWorlds', userAdvance);
    }

    disposables.add(atom.workspace.observeTextEditors(function(editor) {
      const buff = editor.getBuffer();
      return disposables.add(buff.onDidStopChanging(function() {
        if (atom.config.get("platform-controller.validateOnChange") === true) { return validateCode(); }
      })
      );
    })
    );

    return this.closeAllTabs();
  },

  showMessage(type, grammar) {
    let indexMessage;
    switch (type) {
      case 'error':
        if (currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].messagesError.length > 0) {
          indexMessage = userPlatform.editors[grammar].messageError;
          messages[grammar].error = currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].messagesError[indexMessage];

          if (messages[grammar].error != null) {
            currentAdvance.editors[grammar].messageError = indexMessage + 1;
          } else {
            indexMessage = 0;
            messages[grammar].error = currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].messagesError[indexMessage];
            currentAdvance.editors[grammar].messageError = indexMessage + 1;
          }

          return messages[grammar].error.details = [];
        }
        break;

      case 'hint':
        if (currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].hints.length > 0) {
          indexMessage = userPlatform.editors[grammar].hint;
          messages[grammar].hint = currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].hints[indexMessage];

          if (messages[grammar].hint != null) {
            currentAdvance.editors[grammar].hint = indexMessage + 1;
          } else {
            indexMessage = 0;
            messages[grammar].hint = currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].hints[indexMessage];
            currentAdvance.editors[grammar].hint = indexMessage + 1;
          }

          messages[grammar].hints = currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].hints;
          return messages[grammar].hintIndex = indexMessage;
        }
        break;

      case 'success':
        if (currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].messagesSuccess.length > 0) {
          indexMessage = userPlatform.editors[grammar].messageSuccess;
          messages[grammar].success = currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].messagesSuccess[indexMessage];

          if (messages[grammar].success != null) {
            return currentAdvance.editors[grammar].messageSuccess = indexMessage + 1;
          } else {
            indexMessage = 0;
            messages[grammar].success = currentPlatform.editors[grammar].challenges[currentChallenge[grammar]].messagesSuccess[indexMessage];
            return currentAdvance.editors[grammar].messageSuccess = indexMessage + 1;
          }
        }
        break;

      case 'welcome':
        if (currentPlatform.welcome.length > 0) {
          indexMessage = userPlatform.welcome;
          messages.welcome = currentPlatform.welcome[indexMessage];

          if (messages.welcome != null) {
            currentAdvance.welcome = indexMessage + 1;
          } else {
            indexMessage = 0;
            messages.welcome = currentPlatform.welcome[indexMessage];
            currentAdvance.welcome = indexMessage + 1;
          }

          messages.welcomeMessages = currentPlatform.welcome;
          return messages.welcomeIndex = indexMessage;
        }
        break;
    }
  },

  start() {
    this.homeView = new HomeView(this);
    this.leftDock = new MainMenuView(this);
    return this.feedBackView = new FeedBackView(this);
  },

  loadProject(idPlatform) {
    this.closeAllTabs();
    this.idPlatform = idPlatform;
    userPlatform = PlatformModel.getCurrentPlatform(this.idPlatform, userAdvance.platforms);
    currentPlatform = PlatformModel.getCurrentPlatform(this.idPlatform, this.dataPlatforms);

    if (userPlatform == null) {
      userPlatform = currentAdvance;
      userPlatform.id = idPlatform;
    }

    this.openFilesProject();
    this.showMessage('welcome');
    this.feedBackView.show();
    this.toolbarView = new ToolbarView(this);
    return this.toolbarView.show();
  },

  evaluation(checkCode, editor) {
    currentChallenge[checkCode.grammar] = currentAdvance.editors[checkCode.grammar].challenge;

    if (checkCode.codeErrors.length > 0) {
      this.showMessage('error', checkCode.grammar);

      return (() => {
        const result = [];
        for (let i = 0; i < checkCode.codeErrors.length; i++) {
          const error = checkCode.codeErrors[i];
          if (error) {
            let messageText = error.message || error.reason || error.text;

            if (error.line) {
              messageText = `${messageText} At line: ${error.line}`;
              this.addMark(editor, error.line);
            }

            result.push(messages[checkCode.grammar].error.details.push(messageText));
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();

    } else {
      if (checkCode.checkPoint === 'incomplete') {
        this.showMessage('hint', checkCode.grammar);
        return currentAdvance.editors[checkCode.grammar].complete = 'incomplete';
      } else {
        this.showMessage('success', checkCode.grammar);
        if (currentPlatform.editors[checkCode.grammar].challenges[currentChallenge[checkCode.grammar] + 1]) {
          currentChallenge[checkCode.grammar]++;
          currentAdvance.editors[checkCode.grammar].challenge++;
          currentAdvance.editors[checkCode.grammar].hint = 0;
        }
        return currentAdvance.editors[checkCode.grammar].complete = 'complete';
      }
    }
  },

  addMark(editor, line) {
    const marker = editor.markBufferPosition({row: line - 1, column: 0});

    editor.decorateMarker(marker, {
      type: 'line-number',
      class: 'marked',
    });

    return markers.push(marker);
  },

  clearMark() {
    if (markers.length > 0) {
      for (let i = 0; i < markers.length; i++) {
        const marker = markers[i];
        marker.destroy();
      }
    }

    return markers = [];
  },

  validateCode() {
    if (!currentPlatform) { return; }

    messages = {
      HTML: {},
      CSS: {},
      JavaScript: {}
    };

    return atom.workspace.getTextEditors().forEach(editor => {
      editor.save();
      const grammar = editor.getGrammar().name;

      this.clearMark();
      if (currentPlatform.editors[grammar].challenges.length > 0) {
        switch (grammar) {
          case "HTML":
            currentChallenge[grammar] = currentChallenge[grammar] || userPlatform.editors.HTML.challenge;
            break;
          case "CSS":
            currentChallenge[grammar] = currentChallenge[grammar] || userPlatform.editors.CSS.challenge;
            break;
          case "JavaScript":
            currentChallenge[grammar] = currentChallenge[grammar] || userPlatform.editors.JavaScript.challenge;
            break;
        }

        codeParser(currentPlatform, currentChallenge, editor)
          .then(data => {

            if (data.codeErrors.results != null) {
              data.codeErrors = data.codeErrors.results[0].warnings;

              this.evaluation(data, editor);
            } else {
              this.evaluation(data, editor);
            }

            return this.feedBackView.show();
        });

        currentAdvance.id = currentPlatform.id;

        PlatformModel.updateAdvace(userAdvance, currentAdvance);
        return PlatformModel.saveItem('PathWorlds', userAdvance);
      }
    });
  },


  consumeRefreshPage(bp) {
    this.bp = bp;
    this.refresh = this.bp.refreshPage;
    return this.bpOpen = this.bp.openPage;
  },

  getMessages() {
    return messages;
  },

  openFilesProject() {
    let splitPane;
    const dirPaths = path.join(atom.getUserInitScriptPath(), '../../Documents', 'PathWorlds/projects');

    if (this.orientation === 'vertical') {
      atom.workspace.element.classList.remove('vertical-layout');
      splitPane = 'left';
      this.orientation = 'horizontal';
    } else {
      atom.workspace.element.classList.add('vertical-layout');
      splitPane = 'down';
      this.orientation = 'vertical';
    }

    const projectPath = dirPaths;
    atom.project.setPaths([projectPath]);

    if (fs.existsSync(`${dirPaths}/${currentPlatform.editors.HTML.file}`)) {
      this.bpOpen(`${dirPaths}/${currentPlatform.editors.HTML.file}`);
    }

    if (this.orientation === 'vertical') {
      atom.workspace.open(`${dirPaths}/${currentPlatform.editors.HTML.file}`, {split: 'left'});
      this.addColapse();
    }

    if (fs.existsSync(`${dirPaths}/${currentPlatform.editors.CSS.file}`)) {
      atom.workspace.open(`${dirPaths}/${currentPlatform.editors.CSS.file}`, {split: splitPane});
    }

    if (fs.existsSync(`${dirPaths}/${currentPlatform.editors.JavaScript.file}`)) {
      atom.workspace.open(`${dirPaths}/${currentPlatform.editors.JavaScript.file}`, {split: splitPane});
    }

    if (this.orientation === 'horizontal') {
      return atom.workspace.open(`${dirPaths}/${currentPlatform.editors.HTML.file}`, {split: 'left'});
    }
  },


  addColapse() {
    jQ( window ).resize(e => {
      return jQ('[data-active-item-name]').map((i, pane) => {
        jQ(pane)
          .css({'flex-grow': 1})
          .addClass('expand')
          .removeClass('collapsed');
        return jQ(pane)
          .find('.collapse-pane')
          .addClass('icon-chevron-down')
          .removeClass('icon-chevron-right');
      });
    });

    return setTimeout(() => {
      return jQ('[data-active-item-name]').map((i, pane) => {
        const cssFlex = this.getFlex(pane);
        const button = jQ("<button>", {
          class: 'collapse-pane icon-chevron-down'
        }).click(e => {
          const heightPane = jQ('[data-active-item-name]').parent().outerHeight() / 3;
          const grow = 60 / heightPane;
          const parent = jQ(e.target).parent();
          const next = parent.next().next();
          const editor = jQ(parent).find('atom-text-editor');
          if (jQ(e.target).hasClass('icon-chevron-down')) {
            if (jQ('atom-pane.expand').length > 1) {
              jQ(e.target).removeClass('icon-chevron-down');
              jQ(e.target).addClass('icon-chevron-right');
              jQ(parent)
                .css({'flex-grow': grow})
                .addClass('collapsed')
                .removeClass('expand');
              return this.addGrow(grow);
            } else {
              const activePane = jQ('atom-pane.expand')[0];
              const flex = this.getFlex(activePane);
              let firstPane = $(activePane).next().next();
              if (firstPane.length < 1) {
                firstPane = jQ('atom-pane.collapsed')[0];
              }

              jQ(firstPane)
                .css({'flex-grow': flex.grow})
                .addClass('expand')
                .removeClass('collapsed');
              jQ(firstPane)
                .find('.collapse-pane')
                .addClass('icon-chevron-down')
                .removeClass('icon-chevron-right');

              jQ(activePane)
                .css({'flex-grow': grow})
                .addClass('collapsed')
                .removeClass('expand');
              return jQ(activePane)
                .find('.collapse-pane')
                .addClass('icon-chevron-right')
                .removeClass('icon-chevron-down');
            }

          } else {
            jQ(e.target).addClass('icon-chevron-down');
            jQ(e.target).removeClass('icon-chevron-right');
            jQ(parent)
              .css({'flex-grow': 1})
              .removeClass('collapsed')
              .addClass('expand');
            return this.addGrow(grow);
          }
        });

        return jQ(pane).append(button[0]).addClass('expand');
      });
    }
    , 500);
  },

  addGrow(grow) {
    grow = jQ('atom-pane.collapsed').length - ( grow * jQ('atom-pane.collapsed').length );
    grow = grow / jQ('atom-pane.expand').length;

    return jQ('atom-pane.expand').map((i, pane) => {
      return jQ(pane).css({'flex-grow': grow + 1});
    });
  },

  getFlex(pane) {
    const [grow,shrink,basis] = Array.from(jQ(pane).css('-webkit-flex').split(' '));
    return {grow,shrink,basis};
  },

  closeAllTabs() {
    const _panes = atom.workspace.getPanes();  // grab object representing all items in panes
    for (let _pane of Array.from(_panes)) { _pane.destroy(); }  // not all items can close; tree-view / dev-tools / ++ is kept open
    return true;
  },

  changePanePosition() {
    this.closeAllTabs();
    return setTimeout(() => {
      return this.openFilesProject();
    }
    , 500);
  }
};
