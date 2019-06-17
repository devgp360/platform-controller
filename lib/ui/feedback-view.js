// lib/ui/feedback-view

let FeedBackView;
const {CompositeDisposable} = require('atom');
const {$, $$, View} = require('atom-space-pen-views');
const _ = require('underscore-plus');

module.exports =
  (FeedBackView = class FeedBackView extends View {
    static content() {
      return this.div({class: 'platform-feedback invisible'}, () => {
        this.button({class: 'btn-close',outlet: 'close'});
        this.div({class: 'nav-buttons invisible',outlet: 'nav'}, () => {
          this.button({class: 'btn-arrow btn-left',outlet: 'arrowLeft'});
          return this.button({class: 'btn-arrow btn-right',outlet: 'arrowRight'});
        });
        this.div({class: 'nav-buttons-welcome invisible',outlet: 'navWel'}, () => {
          this.button({class: 'btn-arrow btn-left',outlet: 'arrowLeftWel'});
          return this.button({class: 'btn-arrow btn-right',outlet: 'arrowRightWel'});
        });
        return this.div({class: 'platform-feedback-wrap'}, () => {
          this.img({class: 'character', src: 'images/platform-home/character-guide.png'});
          return this.div({class: 'feedback-wrapper native-key-bindings run-command', tabindex: -1, outlet: 'feedbackWrap'});
        });
      });
    }

    initialize(platformController) {
      this.workspace = document.querySelector('atom-workspace');
      this.wrapper = this[0];
      this.controller = platformController;
      this.workspace.appendChild(this[0]);
      this.currentIndex = {
        welcome: 0,
        HTML: 0,
        CSS: 0,
        JavaScript: 0
      };

      this.close.on('click', evt => {
        return this.hide();
      });

      this.arrowLeft.on('click', evt => {
        return this.loadMessages('prev');
      });

      this.arrowRight.on('click', evt => {
        return this.loadMessages('next');
      });

      this.arrowLeftWel.on('click', evt => {
        return this.prevWel();
      });

      return this.arrowRightWel.on('click', evt => {
        return this.nextWel();
      });
    }

    escape(string) {
      const tagsToReplace = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;'
      };
      return string.replace(/[&<>]/g, tag => {
        return tagsToReplace[tag] || tag;
      });
    }

    loadMessages(action) {
      let messageOutput = '';
      this.nav[0].classList.add('invisible');
      this.navWel[0].classList.add('invisible');

      if (this.messages.welcome) {
        this.navWel[0].classList.remove('invisible');
        this.feedbackWrap[0].innerHTML = this.messages.welcome.description;
        return this.currentIndex.welcome = this.messages.welcomeIndex;
      } else {
        let details = '';
        _.forEach(this.messages, (messageGrammar, i) => {
          if (_.isEmpty(messageGrammar)) { return; }

          const classTag = i.toLowerCase();

          messageOutput += `<div class='${classTag}'><h2 class='context'>${i}</h2>`;
          if (messageGrammar.error) {
            const messageError = messageGrammar.error.description;
            if (messageGrammar.error.details.length) {
              _.forEach(messageGrammar.error.details, detail => {
                detail = this.escape(detail);
                return details = `${details}<p>${detail}</p>`;
              });
            } else {
              details = '';
            }

            return messageOutput += `<div class='error'>${messageError} ${details}</div></div>`;
          } else {
            if (messageGrammar.hint) {
              let nextMessage;
              this.nav[0].classList.remove('invisible');

              switch (action) {
                case 'next':
                  if (messageGrammar.hint && (messageGrammar.hints.length > 0)) {
                    this.currentIndex[i]++;
                    nextMessage = messageGrammar.hints[this.currentIndex[i]];

                    if (nextMessage != null) {
                      // @feedbackWrap[0].innerHTML = nextMessage.description
                      return messageOutput += `<div class='hint'>${nextMessage.description}</div></div>`;
                    } else {
                      this.currentIndex[i] = 0;
                      return messageOutput += `<div class='hint'>${messageGrammar.hints[this.currentIndex[i]].description}</div></div>`;
                    }
                  }
                  break;
                      // @feedbackWrap[0].innerHTML = messageGrammar.hints[@currentIndex].description
                case 'prev':
                  if (messageGrammar.hint && (messageGrammar.hints.length > 0)) {
                    this.currentIndex[i]--;
                    nextMessage = messageGrammar.hints[this.currentIndex[i]];

                    if (nextMessage != null) {
                      // @feedbackWrap[0].innerHTML = nextMessage.description
                      return messageOutput += `<div class='hint'>${nextMessage.description}</div></div>`;
                    } else {
                      this.currentIndex[i] = messageGrammar.hints.length - 1;
                      // @feedbackWrap[0].innerHTML = @messages.hints[@currentIndex].description
                      return messageOutput += `<div class='hint'>${messageGrammar.hints[this.currentIndex[i]].description}</div></div>`;
                    }
                  }
                  break;

                default:
                  messageOutput += `<div class='hint'>${messageGrammar.hint.description}</div>`;
                  return this.currentIndex[i] = messageGrammar.hintIndex;
              }

            } else {
              if (messageGrammar.success) {
                return messageOutput += `<div class='success'>${messageGrammar.success.description}</div></div>`;
              }
            }
          }
        });

        return this.feedbackWrap[0].innerHTML = messageOutput;
      }
    }

    nextWel() {
      if (this.messages.welcome && (this.messages.welcomeMessages.length > 0)) {
        this.currentIndex.welcome++;
        const nextMessage = this.messages.welcomeMessages[this.currentIndex.welcome];

        if (nextMessage != null) {
          return this.feedbackWrap[0].innerHTML = nextMessage.description;
        } else {
          this.currentIndex.welcome = 0;
          return this.feedbackWrap[0].innerHTML = this.messages.welcomeMessages[this.currentIndex.welcome].description;
        }
      }
    }

    prevWel() {
      if (this.messages.welcome && (this.messages.welcomeMessages.length > 0)) {
        this.currentIndex.welcome--;
        const nextMessage = this.messages.welcomeMessages[this.currentIndex.welcome];

        if (nextMessage != null) {
          return this.feedbackWrap[0].innerHTML = nextMessage.description;
        } else {
          this.currentIndex.welcome = this.messages.welcomeMessages.length - 1;
          return this.feedbackWrap[0].innerHTML = this.messages.welcomeMessages[this.currentIndex.welcome].description;
        }
      }
    }

    show() {
      this.feedbackWrap[0].innerHTML = '';
      this.wrapper.classList.remove('invisible');
      this.messages = this.controller.getMessages();
      return this.loadMessages();
    }

    hide() {
      this.wrapper.classList.add('invisible');
      return this.feedbackWrap[0].innerHTML = '';
    }
  });