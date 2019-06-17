// lib/ui/toolbar-view

let ToolbarView;
const {CompositeDisposable} = require('atom');
const {$, $$, View}  = require('atom-space-pen-views');
const _ = require('underscore-plus');
const subAtom = require('sub-atom');

module.exports =
  (ToolbarView = class ToolbarView extends View {

    static content() {
      return this.div({class: 'platform'}, () => {
        return this.div({outlet: 'newBtn', class:'new-btn platform-toolbar-btn'});
      });
    }

    initialize(platformController) {
      // @subs = new subAtom
      this.$workspace = $(atom.views.getView(atom.workspace));
      this.updateSide('bottom', true);

      return this.newBtn.on('click', e => {
        platformController.validateCode();
        return platformController.bp.refreshPage();
      });
    }

    updateSide(side, refresh) {
      const lftRight = () => {
        this.removeClass('toolbar-vert').addClass('toolbar-horiz');
        return this.find('.btn').css({display: 'inline-block'});
      };
      const topBottom = () => {
        this.removeClass('toolbar-horiz').addClass('toolbar-vert');
        return this.find('.btn').css({display: 'block'});
      };
      this.detach();

      return setTimeout(() => {
        return atom.workspace.element.getElementsByClassName('pane-column')[0].appendChild(this[0]);
      }
      , 750);
    }

    get$Btn(e) { return $(e.target).closest('.btn'); }
  });
