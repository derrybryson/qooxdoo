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

/**
 * @require(qx.module.Template)
 */
qx.Bootstrap.define("qx.ui.website.Calendar", {
  extend : qx.ui.website.Widget,

  statics : {
    _templates : {
      controls : "<tr>" +
                   "<td colspan='1'><button class='qx-calendar-prev' title='Previous Month'>&lt;</button></td>" +
                   "<td colspan='5'>{{month}} {{year}}</td>" +
                   "<td colspan='1'><button class='qx-calendar-next' title='Next Month'>&gt;</button></td>" +
                 "</tr>",
      dayRow : "<tr>" +
                 "{{#row}}<td>{{.}}</td>{{/row}}" +
               "</tr>",
      row : "<tr>" +
              "{{#row}}<td class='{{cssClass}}'><button class='qx-calendar-day' value='{{date}}'>{{day}}</button></td>{{/row}}" +
            "</tr>",
      table : "<table><thead>{{{thead}}}</thead><tbody>{{{tbody}}}</tbody></table>"
    },

    _config : {
      monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      dayNames : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  events : {
    /** Fired at each value change */
    "changeValue" : "Date"
  },


  members : {

    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      this._forEachElementWrapped(function(calendar) {
        calendar.showValue(new Date());
        calendar.addClass("qx-calendar");
      });

      return true;
    },

    /**
     * Re-render the calendar(s), e.g. if templates or config options changed
     *
     * @return {qxWeb} The collection for chaining
     */
    render : function() {
      this.showValue(this.getProperty("shownValue"));
      return this;
    },


    /**
     * Sets the given date as the current value displays it
     *
     * @param value {Date} Date to display
     * @return {qxWeb} The collection for chaining
     */
    setValue : function(value) {
      this.setProperty("value", value);
      this.showValue(value);
      this.emit("changeValue", value);
      return this;
    },


    /**
     * Returns the currently selected date of the first
     * calendar widget in the collection
     *
     * @return {qxWeb} The collection for chaining
     */
    getValue : function() {
      var value = this.getProperty("value");
      return value ? new Date(value) : null;
    },


    /**
     * Displays the given date
     *
     * @param value {Date} Date to display
     * @return {qxWeb} The collection for chaining
     */
    showValue : function(value) {
      this.setProperty("shownValue", value);

      this._forEachElementWrapped(function(item) {
        if (item.getAttribute("tabindex") < 0) {
          item.setAttribute("tabindex", 0);
        }
        item.find(".qx-calendar-prev").offWidget("click", this._prevMonth, item);
        item.find(".qx-calendar-next").offWidget("click", this._nextMonth, item);
        item.find(".qx-calendar-day").offWidget("click", this._selectDay, item);
        item.offWidget("focus", this._onFocus, item, true)
        .offWidget("blur", this._onBlur, item, true);
      }, this);

      this.setHtml(this._getTable(value));

      this._forEachElementWrapped(function(item) {
        item.find(".qx-calendar-prev").onWidget("click", this._prevMonth, item);
        item.find(".qx-calendar-next").onWidget("click", this._nextMonth, item);
        item.find(".qx-calendar-day").onWidget("click", this._selectDay, item);
        item.onWidget("focus", this._onFocus, item, true)
        .onWidget("blur", this._onBlur, item, true);
      }, this);

      return this;
    },


    /**
     * Displays the previous month
     */
    _prevMonth : function() {
      var shownValue = this.getProperty("shownValue");
      this.showValue(new Date(shownValue.getFullYear(), shownValue.getMonth() - 1));
    },


    /**
     * Displays the next month
     */
    _nextMonth : function() {
      var shownValue = this.getProperty("shownValue");
      this.showValue(new Date(shownValue.getFullYear(), shownValue.getMonth() + 1));
    },


    /**
     * Sets the current value to the day selected by the user
     * @param e {Event} click event
     */
    _selectDay : function(e) {
      var day = qxWeb(e.getTarget());
      var newStr = day.getAttribute("value");
      var newValue = new Date(newStr);
      this.setValue(newValue);
      this.find(".qx-calendar-day[value='" + newStr + "']").focus();
    },


    /**
     * Renders the calendar for the given date
     *
     * @param date {Date} date to render
     * @return {String} calendar HTML
     */
    _getTable : function(date) {
      var controls = qxWeb.template.render(this.getTemplate("controls"), this._getControlsData(date));
      var dayRow = qxWeb.template.render(this.getTemplate("dayRow"), this._getDayRowData());

      var data = {
        thead: controls + dayRow,
        tbody: this._getWeekRows(date)
      };

      return qxWeb.template.render(this.getTemplate("table"), data);
    },


    /**
     * Returns the month and year to be displayed in the calendar controls
     *
     * @param date {Date} date to be displayed
     * @return {Map} map containing the month and year
     */
    _getControlsData : function(date) {
      return {
        month: this.getConfig("monthNames")[date.getMonth()],
        year: date.getFullYear()
      };
    },


    /**
     * Returns the week day names to be displayed in the calendar
     *
     * @return {String[]} Array of day names
     */
    _getDayRowData : function() {
      return {
        row: this.getConfig("dayNames")
      };
    },


    /**
     * Returns the table rows displaying the days of the month
     *
     * @param date {Date} date to be displayed
     * @return {String} the table rows as an HTML string
     */
    _getWeekRows : function(date) {
      var weeks = [];
      var startOfWeek = 1;

      var helpDate = new Date(date.getFullYear(), date.getMonth(), 1);

      var firstDayOfWeek = helpDate.getDay();
      var today = new Date();

      helpDate = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0);
      var nrDaysOfLastMonth = (7 + firstDayOfWeek - startOfWeek) % 7;
      helpDate.setDate(helpDate.getDate() - nrDaysOfLastMonth);

      for (var week=0; week<6; week++) {
        var data = {row: []};

        for (var i=0; i<7; i++) {
          var cssClasses = helpDate.getMonth() !== date.getMonth() ? "othermonth" : "";
          if (this.getProperty("value")) {
            cssClasses += helpDate.toDateString() === this.getProperty("value").toDateString() ? " selected" : "";
          }
          cssClasses += today.toDateString() === helpDate.toDateString() ? " today" : "";

          data.row.push({
            day: helpDate.getDate(),
            date: helpDate.toDateString(),
            cssClass: cssClasses
          });
          helpDate.setDate(helpDate.getDate() + 1);
        }

        weeks.push(qxWeb.template.render(this.getTemplate("row"), data));
      }

      return weeks.join("");
    },


    /**
     * Attaches the keydown listener
     * @param e {Event} focus event
     */
    _onFocus : function(e) {
      this.onWidget("keydown", this._onKeyDown, this);
    },


    /**
     * Removes the keydown listener if the focus moves outside of the calendar
     * @param e {Event} blur event
     */
    _onBlur : function(e) {
      if (this.contains(e.getRelatedTarget()).length === 0) {
        this.offWidget("keydown", this._onKeyDown, this);
      }
    },


    /**
     * Keyboard handling
     *
     * @param e {Event} keydown event
     */
    _onKeyDown : function(e) {
      var target = qxWeb(e.getTarget());
      var key = e.getKeyIdentifier();
      var isDayButton = target.hasClass("qx-calendar-day");

      if (isDayButton) {
        if (key == "Space") {
          this._selectDay(e);
        }
        else if (key == "Right") {
          e.preventDefault();
          this._focusNextDay(target);
        }
        else if (key == "Left") {
          e.preventDefault();
          this._focusPrevDay(target);
        }
      } else {
        if (key == "Space") {
          if (target.hasClass("qx-calendar-prev")) {
            e.preventDefault();
            this._prevMonth();
            this.find(".qx-calendar-prev").focus();
          } else if (target.hasClass("qx-calendar-next")) {
            e.preventDefault();
            this._nextMonth();
            this.find(".qx-calendar-next").focus();
          }
        } else if (key == "Right") {
          e.preventDefault();
          this._nextMonth();
          this.find(".qx-calendar-next").focus();
        } else if (key == "Left") {
          e.preventDefault();
          this._prevMonth();
          this.find(".qx-calendar-prev").focus();
        }
      }

      e.stopPropagation();
    },


    /**
     * Focuses the day button following the given one
     * @param currentDay {qxWeb} the button for the current day
     */
    _focusNextDay : function(currentDay) {
      var nextDayInWeek = currentDay.getParents().getNext();
      if (nextDayInWeek.length > 0) {
        nextDayInWeek.getChildren(".qx-calendar-day").focus();
      } else {
        var nextWeekRow = currentDay.getParents().getParents().getNext();
        if (nextWeekRow.length > 0) {
          nextWeekRow.find("> td > .qx-calendar-day").getFirst().focus();
        } else {
          this._nextMonth();
          var oldDate = new Date(currentDay.getAttribute("value"));
          var newDate = new Date(oldDate.valueOf());
          newDate.setDate(oldDate.getDate() + 1);
          var buttonVal = newDate.toDateString();
          this.find(".qx-calendar-day[value='" + buttonVal + "']").focus();
        }
      }
    },


    /**
     * Focuses the day button preceding the given one
     * @param currentDay {qxWeb} the button for the current day
     */
    _focusPrevDay : function(currentDay) {
      var prevDayInWeek = currentDay.getParents().getPrev();
      if (prevDayInWeek.length > 0) {
        prevDayInWeek.getChildren(".qx-calendar-day").focus();
      } else {
        var prevWeekRow = currentDay.getParents().getParents().getPrev();
        if (prevWeekRow.length > 0) {
          prevWeekRow.find("> td > .qx-calendar-day").getLast().focus();
        } else {
          this._prevMonth();
          var oldDate = new Date(currentDay.getAttribute("value"));
          var newDate = new Date(oldDate.valueOf());
          newDate.setDate(oldDate.getDate() - 1);
          var buttonVal = newDate.toDateString();
          this.find(".qx-calendar-day[value='" + buttonVal + "']").focus();
        }
      }
    },


    dispose : function() {
      this._forEachElementWrapped(function(item) {
        item.find(".qx-calendar-prev").offWidget("click", this._prevMonth, item);
        item.find(".qx-calendar-next").offWidget("click", this._nextMonth, item);
        item.find(".qx-calendar-day").offWidget("click", this._selectDay, item);
        item.offWidget("focus", this._onFocus, item, true)
        .offWidget("blur", this._onBlur, item, true)
        .offWidget("keydown", this._onKeyDown, item);
      }, this);

      this.setHtml("");

      return this.base(arguments);
    }

  },


  defer : function(statics) {
    qxWeb.$attach({
      calendar : function(date) {
        var calendar =  new qx.ui.website.Calendar(this);
        calendar.init();

        if (date !== undefined) {
          calendar.setValue(date);
        }

        return calendar;
      }
    });
  }
});
