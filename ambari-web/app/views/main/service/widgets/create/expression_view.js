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

var misc = require('utils/misc');

App.WidgetWizardExpressionView = Em.View.extend({
  templateName: require('templates/main/service/widgets/create/expression'),

  /**
   * @type {Array}
   */
  classNames: ['metric-container'],

  /**
   * @type {Array}
   */
  classNameBindings: ['isInvalid'],

  /**
   * list of operators that can be used in expression
   * @type {Array}
   * @constant
   */
  OPERATORS: ["+", "-", "*", "/", "(", ")"],

  /**
   * contains expression data before editing in order to restore previous state
   */
  dataBefore: [],

  /**
   * @type {Ember.Object}
   */
  expression: null,

  /**
   * @type {boolean}
   */
  isInvalid: false,

  /**
   * add operator to expression data
   * @param event
   */
  addOperator: function (event) {
    var data = this.get('expression.data');
    var lastId = (data.length > 0) ? Math.max.apply(this, data.mapProperty('id')) : 0;

    data.pushObject(Em.Object.create({
      id: ++lastId,
      name: event.context,
      isOperator: true
    }));
  },

  /**
   * redraw expression
   * NOTE: needed in order to avoid collision between scrollable lib and metric action event
   */
  redrawField: function () {
    this.set('expression.data', misc.sortByOrder($(this.get('element')).find('.metric-instance').map(function () {
      return this.id;
    }), this.get('expression.data')));
  },

  /**
   * enable metric edit area
   */
  didInsertElement: function () {
    var self = this;
    this.propertyDidChange('expression');
    Em.run.next(function () {
      $(self.get('element')).find('.metric-field').sortable({
        items: "> div",
        tolerance: "pointer",
        scroll: false,
        update: function () {
          self.redrawField();
        }
      }).disableSelection();
    });
  },

  /**
   * remove metric or operator from expression
   * @param {object} event
   */
  removeElement: function (event) {
    this.get('expression.data').removeObject(event.context);
  },

  validate: function () {
    //number 1 used as substitute to test expression to be mathematically correct
    var testNumber = 1;
    var isInvalid = true;
    var expression = this.get('expression.data').map(function (element) {
      if (element.isMetric) {
        return testNumber;
      } else {
        return element.name;
      }
    }, this).join(" ");

    if (expression.length > 0) {
      if (/^((\(\s)*[\d]+)[\(\)\+\-\*\/\d\s]*[\d\)]*$/.test(expression)) {
        try {
          isInvalid = !isFinite(window.eval(expression));
        } catch (e) {
          isInvalid = true;
        }
      }
    } else {
      isInvalid = false;
    }

    this.set('isInvalid', isInvalid);
    this.set('expression.isInvalid', isInvalid);
    this.get('controller').propertyDidChange('isSubmitDisabled');
    if (!isInvalid) {
      this.get('controller').updateExpressions();
    }
  }.observes('expression.data.length'),

  /**
   * @type {Array}
   * @const
   */
  AGGREGATE_FUNCTIONS: ['avg', 'sum', 'min', 'max']
});


/**
 * show menu view that provide ability to add metric
 */
App.AddMetricExpressionView = Em.View.extend({
  templateName: require('templates/main/service/widgets/create/step2_add_metric'),
  controller: function () {
    return this.get('parentView.controller');
  }.property('parentView.controller'),
  elementId: 'add-metric-menu',
  didInsertElement: function () {
    //prevent dropdown closing on click select
    $('html').on('click.dropdown', '.dropdown-menu li', function (e) {
      $(this).hasClass('keep-open') && e.stopPropagation();
    });
    $('html').on('click.dropdown', '.dropdown-menu chosen-drop', function (e) {
      $(this).hasClass('keep-open') && e.stopPropagation();
    });
    var self = this;
    Em.run.later(this, function () {
      $(".metrics-select.chosen-select").chosen({
        placeholder_text: Em.I18n.t('dashboard.widgets.wizard.step2.selectMetric'),
        no_results_text: Em.I18n.t('widget.create.wizard.step2.noMetricFound')
      }).change(function (event, obj) {
          var filteredComponentMetrics = self.get('controller.filteredMetrics').filterProperty('component_name', self.get('currentSelectedComponent.componentName')).filterProperty('level',self.get('currentSelectedComponent.level'));
          var filteredMetric = filteredComponentMetrics.findProperty('name', obj.selected);
          var selectedMetric =  Em.Object.create({
            name: obj.selected,
            componentName: self.get('currentSelectedComponent.componentName'),
            serviceName: self.get('currentSelectedComponent.serviceName'),
            metricPath: filteredMetric.widget_id,
            isMetric: true
          });
          if (self.get('currentSelectedComponent.hostComponentCriteria')) {
            selectedMetric.hostComponentCriteria = self.get('currentSelectedComponent.hostComponentCriteria');
          }
          self.set('currentSelectedComponent.selectedMetric', selectedMetric);
      });

      $(".aggregate-function-select.chosen-select").chosen({
        placeholder_text: Em.I18n.t('dashboard.widgets.wizard.step2.aggregateFunction.scanOps')
      }).change(function (event, obj) {
          self.set('currentSelectedComponent.selectedAggregation', obj.selected);
      });
    }, 1600);
  },

  /**
   * @type {Ember.Object}
   * @default null
   */
  currentSelectedComponent: null,

  /**
   * select component
   * @param {object} event
   */
  selectComponents: function (event) {
    var component = this.get('componentMap').findProperty('serviceName', event.context.get('serviceName'))
      .get('components').findProperty('id', event.context.get('id'));
    this.set('currentSelectedComponent', component);
  },

  /**
   * add current metrics and aggregation to expression
   * @param event
   */
  addMetric: function (event) {
    var selectedMetric = event.context.get('selectedMetric'),
      aggregateFunction = event.context.get('selectedAggregation');
    var isAddEnabled = event.context.get('isAddEnabled');
    var result =  jQuery.extend(true, {}, selectedMetric);
    if (isAddEnabled) {
      var data = this.get('parentView').get('expression.data'),
        id = (data.length > 0) ? Math.max.apply(this.get('parentView'), data.mapProperty('id')) + 1 : 1;
      result.set('id', id);
      if (event.context.get('showAggregateSelect') && aggregateFunction !== 'avg') {
        result.set('metricPath', result.get('metricPath') + '._' + aggregateFunction);
        result.set('name', result.get('name') + '._' + aggregateFunction);
      }
      data.pushObject(result);
      this.cancel();
    }
  },

  /**
   * cancel adding metric, close add metric menu
   */
  cancel: function () {
    $(".service-level-dropdown").parent().removeClass('open');
  },


  /**
   * map of components
   * has following hierarchy: service -> component -> metrics
   */
  componentMap: function () {
    var servicesMap = {};
    var result = [];
    var components = [];
    var masterNames = App.StackServiceComponent.find().filterProperty('isMaster').mapProperty('componentName');
    var parentView = this.get('parentView');

    if (this.get('controller.filteredMetrics')) {
      this.get('controller.filteredMetrics').forEach(function (metric) {
        var service = servicesMap[metric.service_name];
        var componentId = masterNames.contains(metric.component_name) ? metric.component_name + '_' + metric.level : metric.component_name;
        if (service) {
          service.count++;
          if (service.components[componentId]) {
            service.components[componentId].count++;
            service.components[componentId].metrics.push(metric.name);
          } else {
            service.components[componentId] = {
              component_name: metric.component_name,
              level: metric.level,
              count: 1,
              hostComponentCriteria: metric.host_component_criteria,
              metrics: [metric.name]
            };
          }
        } else {
          servicesMap[metric.service_name] = {
            count: 1,
            components: {}
          };
        }
      }, this);
    }

    for (var serviceName in servicesMap) {
      components = [];
      for (var componentId in servicesMap[serviceName].components) {

        //HBase service should not show "Active HBase master"
        if (servicesMap[serviceName].components[componentId].component_name === 'HBASE_MASTER' &&
          servicesMap[serviceName].components[componentId].level === 'HOSTCOMPONENT') continue;

        var component = Em.Object.create({
          componentName: servicesMap[serviceName].components[componentId].component_name,
          level: servicesMap[serviceName].components[componentId].level,
          displayName: function() {
            var stackComponent = App.StackServiceComponent.find(this.get('componentName'));
            if (stackComponent.get('isMaster')) {
              if (this.get('level') === 'HOSTCOMPONENT') {
                return Em.I18n.t('widget.create.wizard.step2.activeComponents').format(stackComponent.get('displayName'));
              }
            }
            return Em.I18n.t('widget.create.wizard.step2.allComponents').format(stackComponent.get('displayName'));
          }.property('componentName', 'level'),
          count: servicesMap[serviceName].components[componentId].count,
          metrics: servicesMap[serviceName].components[componentId].metrics.uniq().sort(),
          selected: false,
          id: componentId,
          serviceName: serviceName,
          showAggregateSelect: function () {
            return this.get('level') === 'COMPONENT';
          }.property('level'),
          selectedMetric: null,
          selectedAggregation: Em.I18n.t('dashboard.widgets.wizard.step2.aggregateFunction.scanOps'),
          isAddEnabled: function () {
            var selectedMetric = this.get('selectedMetric'),
              aggregateFunction = this.get('selectedAggregation');
            if (this.get('showAggregateSelect')) {
              return (!!selectedMetric && !!aggregateFunction &&
                aggregateFunction != Em.I18n.t('dashboard.widgets.wizard.step2.aggregateFunction.scanOps'));
            } else {
              return (!!selectedMetric);
            }
          }.property('selectedMetric', 'selectedAggregation')
        });
        if (component.get('level') === 'HOSTCOMPONENT') {
          component.set('hostComponentCriteria', servicesMap[serviceName].components[componentId].hostComponentCriteria);
        }
        components.push(component);
      }
      result.push(Em.Object.create({
        serviceName: serviceName,
        //in order to support accordion lists
        href: '#' + serviceName,
        displayName: App.StackService.find(serviceName).get('displayName'),
        count: servicesMap[serviceName].count,
        components: components
      }));
    }

    return result;
  }.property('controller.filteredMetrics')
});

App.InputCursorTextfieldView = Ember.TextField.extend({
  placeholder: "",
  classNameBindings: ['isInvalid'],
  isInvalid: false,

  didInsertElement: function () {
    this.focusCursor();
  },

  focusCursor: function () {
    Em.run.next( function() { $('.add-item-input .ember-text-field').focus(); });
  }.observes('parentView.expression.data.length'),

  validateInput: function () {
    var value = this.get('value');
    var parentView = this.get('parentView');
    this.set('isInvalid', false);
    if (value && parentView.get('OPERATORS').contains(value)) {
      // add operator
      var data = parentView.get('expression.data');
      var lastId = (data.length > 0) ? Math.max.apply(parentView, data.mapProperty('id')) : 0;
      data.pushObject(Em.Object.create({
        id: ++lastId,
        name: value,
        isOperator: true
      }));
      this.set('value', '');
    } else if (value && value == 'm') {
      // open add metric menu
      $('#add-metric-menu > div > a').click();
      this.set('value', '');
    } else if (value) {
      // invalid operator
      this.set('isInvalid', true);
    }
  }.observes('value'),

  keyDown: function (event) {
    if ((event.keyCode == 8 || event.which == 8) && !this.get('value')) { // backspace
      var data = this.get('parentView.expression.data');
      if (data.length >= 1) {
        data.removeObject(data[data.length - 1]);
      }
    }
  }
});
