// lib/ui/home-view
let HomeView;
// const HomePlatform = require('./HomePlatform');

const {CompositeDisposable} = require('atom');
const {$, $$, View} = require('atom-space-pen-views');
const cheerio = require("cheerio");

module.exports =
  (HomeView = class HomeView extends View {
    static content() {
      return this.div({class: 'platform-home'});
    }

    initialize(platformController) {
      this.controller = platformController;
      this.workspace = document.querySelector('atom-workspace');
      this.wrapper = this[0];
      this.open = true;
      const platforms = [1, 2];

      for (let i = 0; i < platforms.length; i++) {
        const d = platforms[i];
        this.HomePlatform = document.createElement('platform-child');

        console.log(this.HomePlatform);
        this.HomePlatform.classList.add(`platform-child-${d}`);
        this.HomePlatform.setAttribute('id', d);
        this.wrapper.append(this.HomePlatform);

        this.HomePlatform.addEventListener('click', e => {
          if (this.wrapper.classList.contains("zoomin")) {
            this.controller.loadProject(e.target.id);
            return this.toggle();
          } else {
            return this.wrapper.classList.add("zoomin");
          }
        });
      }

      return this.workspace.appendChild(this[0]);
    }

    toggle() {
      // check if the home is openable
      if (this.open) {
        this.wrapper.classList.add('invisible');
        return this.open = false;
      } else {
        this.wrapper.classList.remove('invisible');
        return this.open = true;
      }
    }
  });
