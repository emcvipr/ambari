/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var App = require('app');
require('views/common/controls_view');
/**
 * Common view for config widgets
 * @type {Em.View}
 */
App.ConfigWidgetView = Em.View.extend(App.SupportsDependentConfigs, App.WidgetPopoverSupport, App.ConvertUnitWidgetViewMixin, App.ServiceConfigCalculateId, {

  /**
   * @type {App.ConfigProperty}
   */
  config: null,

  /**
   * Determines if user hover on widget-view
   * @type {boolean}
   */
  isHover: false,

  /**
   * Determines if widget controls should be disabled
   * @type {boolean}
   */
  disabled: false,

  /**
   * Determines if widget is editable
   * It true - show all control-elements (undo, override, finalize etc) for widget
   * If false - no widget control-elements will be shown
   * Bound from template
   * @type {boolean}
   */
  canEdit: true,

  /**
   * Config label class attribute. Displays validation status of config.
   * @type {string}
   */
  configLabelClass: '',

  /**
   * Tab where current widget placed
   * Bound in the template
   * @type {App.Tab}
   */
  tab: null,

  /**
   * Section where current widget placed
   * Bound in the template
   * @type {App.Section}
   */
  section: null,

  /**
   * Subsection where current widget placed
   * Bound in the template
   * @type {App.SubSection}
   */
  subSection: null,

  /**
   * Determines if user can switch custom widget-view to the input-field
   * @type {boolean}
   */
  supportSwitchToCheckBox: false,

  /**
   * @type {boolean}
   */
  showPencil: function () {
    return this.get('supportSwitchToCheckBox') && !this.get('disabled');
  }.property('supportSwitchToCheckBox', 'disabled'),

  /**
   * Alias to <code>config.isOriginalSCP</code>
   * Should be used in the templates
   * Don't use original <code>config.isOriginalSCP</code> in the widget-templates!!!
   * @type {boolean}
   */
  isOriginalSCPBinding: 'config.isOriginalSCP',

  /**
   * Alias to <code>config.isComparison</code>
   * Should be used in the templates
   * Don't use original <code>config.isComparison</code> in the widget-templates!!!
   * @type {boolean}
   */
  isComparisonBinding: 'config.isComparison',

  classNameBindings:['isComparison:compare-mode'],

  issueView: Em.View.extend({

    tagName: 'i',

    classNames: ['icon-warning-sign'],

    classNameBindings: ['issueIconClass'],

    attributeBindings:['issueMessage:data-original-title'],

    /**
     * @type {App.ServiceConfigProperty}
     */
    config: null,

    /**
     * @type {string}
     */
    issueIconClass: '',

    /**
     * @type {string}
     */
    issueMessage: '',

    didInsertElement: function() {
      App.tooltip($(this.get('element')));
      this.errorLevelObserver();
      this.addObserver('issuedConfig.warnMessage', this, this.errorLevelObserver);
      this.addObserver('issuedConfig.errorMessage', this, this.errorLevelObserver);
    },

    willDestroyElement: function() {
      this.removeObserver('issuedConfig.warnMessage', this, this.errorLevelObserver);
      this.removeObserver('issuedConfig.errorMessage', this, this.errorLevelObserver);
    },

    /**
     *
     * @method errorLevelObserver
     */
    errorLevelObserver: function() {
      var messageLevel = this.get('issuedConfig.errorMessage') ? 'ERROR': this.get('issuedConfig.warnMessage') ? 'WARN' : 'NONE';
      var issue = {
        ERROR: {
          iconClass: '',
          message: this.get('issuedConfig.errorMessage'),
          configLabelClass: 'text-error'
        },
        WARN: {
          iconClass: 'warning',
          message: this.get('issuedConfig.warnMessage'),
          configLabelClass: 'text-warning'
        },
        NONE: {
          iconClass: 'hide',
          message: false,
          configLabelClass: ''
        }
      }[messageLevel];
      this.set('parentView.configLabelClass', issue.configLabelClass);
      this.set('issueIconClass', issue.iconClass);
      this.set('issueMessage', issue.message);
    },

    /**
     * @type {App.ServiceConfigProperty}
     */
    issuedConfig: function() {
      var config = this.get('config');
      // check editable overrides
      if (!config.get('isEditable') && config.get('overrides.length') && config.get('overrides').someProperty('isEditable', true)) {
        config = config.get('overrides').findProperty('isEditable', true);
      }
      return config;
    }.property('config.isEditable', 'config.overrides.length')

  }),

  /**
   * Config name to display.
   * @type {String}
   */
  configLabel: function() {
    return this.get('config.stackConfigProperty.displayName') || this.get('config.displayName') || this.get('config.name');
  }.property('config.name', 'config.displayName'),


  /**
   * Error message computed in config property model
   * @type {String}
   */
  configErrorMessageBinding: 'config.errorMessage',

  /**
   * Determines if config-value was changed
   * @type {boolean}
   */
  valueIsChanged: function () {
    return this.get('config.value') != this.get('config.defaultValue');
  }.property('config.value'),

  /**
   * Enable/disable widget state
   * @method toggleWidgetState
   */
  toggleWidgetState: function () {
    this.set('disabled', !this.get('config.isEditable'));
  }.observes('config.isEditable'),

  /**
   * Reset config-value to its default
   * @method restoreValue
   */
  restoreValue: function () {
    var self = this;
    this.set('config.value', this.get('config.defaultValue'));
    this.sendRequestRorDependentConfigs(this.get('config')).done(function() {
      self.restoreDependentConfigs(self.get('config'));
    });

    if (this.get('config.supportsFinal')) {
      this.get('config').set('isFinal', this.get('config.defaultIsFinal'));
    }
    Em.$('body > .tooltip').remove();
  },

  /**
   * Determines if override is allowed for <code>config</code>
   * @type {boolean}
   */
  overrideAllowed: function () {
    var config = this.get('config');
    if (!config) return false;
    return config.get('isOriginalSCP') && config.get('isPropertyOverridable') && !this.get('config.isComparison');
  }.property('config.isOriginalSCP', 'config.isPropertyOverridable', 'config.isComparison'),

  /**
   * Determines if undo is allowed for <code>config</code>
   * @type {boolean}
   */
  undoAllowed: function () {
    var config = this.get('config');
    if (!config) return false;
    if (!this.get('isOriginalSCP') || this.get('disabled')) return false;
    return !config.get('cantBeUndone') && config.get('isNotDefaultValue');
  }.property('config.cantBeUndone', 'config.isNotDefaultValue', 'isOriginalSCP', 'disabled'),

  /**
   * Determines if "final"-button should be shown
   * @type {boolean}
   */
  showFinalConfig: function () {
    var config = this.get('config');
    return config.get('isFinal') || (!config.get('isNotEditable') && this.get('isHover'));
  }.property('config.isFinal', 'config.isNotEditable', 'isHover'),

  /**
   *
   * @param {{context: App.ServiceConfigProperty}} event
   * @method toggleFinalFlag
   */
  toggleFinalFlag: function (event) {
    var configProperty = event.context;
    if (configProperty.get('isNotEditable')) {
      return;
    }
    configProperty.toggleProperty('isFinal');
  },

  /**
   * sync widget value with config value when dependent properties
   * have been loaded or changed
   * @method syncValueWithConfig
   */
  syncValueWithConfig: function() {
    this.setValue(this.get('config.value'));
  }.observes('controller.recommendationTimeStamp'),

  didInsertElement: function () {
    var self = this;
    var element = this.$();
    if (element) {
      element.hover(function() {
        self.set('isHover', true);
      }, function() {
        self.set('isHover', false);
      });
    }
  },

  /**
   * set widget value same as config value
   * useful for widgets that work with intermediate config value, not original
   * for now used in slider widget
   * @abstract
   */
  setValue: Em.K,

  /**
   * Config group bound property. Needed for correct render process in template.
   *
   * @returns {App.ConfigGroup|Boolean}
   */
  configGroup: function() {
    return !this.get('config.group') || this.get('config.group.isDefault') ? false : this.get('config.group');
  }.property('config.group.name'),

  /**
   * switcher to display config as widget or text field
   * @method toggleWidgetView
   */
  toggleWidgetView: function() {
    if (!this.get('isWidgetViewAllowed')) {
      return false;
    }
    if (this.get('config.showAsTextBox')) {
      this.textBoxToWidget();
    } else {
      this.widgetToTextBox();
    }
  },

  /**
   * switch display of config to text field
   * @method widgetToTextBox
   */
  widgetToTextBox: function() {
    this.set("config.showAsTextBox", true);
  },

  /**
   * switch display of config to widget
   * @method textBoxToWidget
   */
  textBoxToWidget: function() {
    if (this.isValueCompatibleWithWidget()) {
      this.setValue(this.get('config.value'));
      this.set("config.showAsTextBox", false);
    }
  },

  /**
   * check if config value can be converted to config widget value
   * @returns {boolean}
   */
  isValueCompatibleWithWidget: function() {
    return this.get('config.isValid');
  },

  /**
   * Returns <code>true</code> if raw value can be used by widget or widget view is activated.
   * @returns {Boolean}
   */
  isWidgetViewAllowed: function() {
    if (!this.get('config.showAsTextBox')) {
      return true;
    }
    return this.isValueCompatibleWithWidget();
  }.property('config.value', 'config.showAsTextBox'),

  /**
   * @method setRecommendedValue
   */
  setRecommendedValue: Em.required(Function)

});
