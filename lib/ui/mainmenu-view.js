// lib/ui/leftdock-view

let LeftDockView;
const {CompositeDisposable} = require('atom');
const {$, $$, View} = require('atom-space-pen-views');
const cheerio = require('cheerio');

module.exports =
  (LeftDockView = class LeftDockView extends View {
    static content() {
      return this.div({class: 'dock-menu left', outlet: 'dockWrap'}, () => {
        this.button({class: 'btn-show icon-gear', outlet: 'showMenu'});
        return this.div({class: 'menu-modal invisible', outlet: 'menuModal'}, () => {
          this.button({class: 'btn-close', outlet: 'closeMenu'});
          this.button({class: 'btn-pane-change icon-three-bars btn', outlet: 'changePane', text: 'change'});
          return this.div({class: 'dock-menu-content-wrapper'});
        });
      });
    }

    initialize(platformController) {
      this.controller = platformController;
      this.workspace = document.querySelector('atom-workspace');
      this.wrapper = this[0];
      this.modal = document.getElementsByClassName('menu-modal');
      this.workspace.appendChild(this[0]);

      this.closeMenu.on('click', evt => {
        return this.hide();
      });

      this.showMenu.on('click', evt => {
        return this.show();
      });

      return this.changePane.on('click', evt => {
        return this.controller.changePanePosition();
      });
    }

    show() {
      return this.modal[0].classList.remove('invisible');
    }

    hide() {
      return this.modal[0].classList.add('invisible');
    }
  });
