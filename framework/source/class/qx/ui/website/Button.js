/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

qx.Bootstrap.define("qx.ui.website.Button", {
  extend : qx.ui.website.Widget,

  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  members : {

    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      this._forEachElementWrapped(function(button) {
        if (!button.hasClass("qx-button")) {
          button.addClass("qx-button");
        }

        if (button.getChildren("span") == 0) {
          qxWeb.create("<span>").appendTo(button);
        }

        if (button.getChildren("img") == 0) {
          qxWeb.create("<img>").appendTo(button).setStyle("display", "none");
        }
      });

      return true;
    },


    /**
     * Sets the button's label text
     *
     * @param value {String} label text
     * @return {qxWeb} The collection for chaining
     */
    setLabel : function(value) {
      this.getChildren("span").setHtml(value);
      return this;
    },


    /**
     * Returns the button's label text
     *
     * @return {String} label text
     */
    getLabel : function() {
      return this.getChildren("span").getHtml();
    },


    /**
     * Sets the source of the button's icon
     *
     * @param src {String} source URI for the icon
     * @return {qxWeb} The collection for chaining
     */
    setIcon : function(src) {
      var img = this.getChildren("img");
      img.setAttribute("src", src);
      img.setStyle("display", src ? "inline" : "none");

      return this;
    },


    /**
     * Sets the menu to be shown when the button is clicked
     *
     * @param menu {qxWeb} menu element wrapped in a collection
     */
    setMenu : function(menu) {
      this.on("click", function(e) {
        menu.placeTo(this, "bottom-left");
        menu.show();
        qxWeb(document).once("click", function() {
          menu.hide();
        });
        e.stopPropagation();
      });
    }
  },


  defer : function() {
    qxWeb.$attach({
      button : function(label, icon) {
        var buttons = new qx.ui.website.Button(this);
        buttons.init();
        if (label != null) {
          buttons.setLabel(label);
        }
        if (icon != null) {
          buttons.setIcon(icon);
        }

        return buttons;
      }
    });
  }
});
