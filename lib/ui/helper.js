// all the helper functions and prototypes are bundled here
let Helper;
module.exports =
(Helper = (function() {
  Helper = class Helper {
    static initClass() {
      String.prototype.isRegistered = function() {
        return document.createElement(this).constructor !== HTMLElement;
      };
    }

    // create a new component
    createComponent(name) {
      // create a custom element for the inner panel if not already done
      let component;
      if (!name.isRegistered()) {
        document.registerElement(name);
      }

      return component = document.createElement(name);
    }

    // add element to the panel
    add(element) {
      return this.component.appendChild(element.component);
    }

    // delete the element from it's parentNode
    delete(el) {
      if (el != null) {
        return el.parentNode.removeChild(el);
      } else {
        return this.component.parentNode.removeChild(this.component);
      }
    }

    // add class to the panel
    addClass(classes) {
      return this.component.classList.add(classes);
    }

    // remove class from the panel
    removeClass(classes) {
      return this.component.classList.remove(classes);
    }

    // set focusable
    setFocusable(el, value) {
      if (value == null) { value = 1; }
      if (el) {
        return el.tabIndex = value;
      } else {
        return this.component.tabIndex = value;
      }
    }

    // remove focusable
    removeFocusable(el) {
      if (el) {
        return el.tabIndex = '-1';
      } else {
        return this.component.tabIndex = '-1';
      }
    }

    // delete focusable
    deleteFocusable(el) {
      if (el) {
        return el.removeAttribute('tabindex');
      } else {
        return this.component.removeAttribute('tabindex');
      }
    }
  };
  Helper.initClass();
  return Helper;
})());