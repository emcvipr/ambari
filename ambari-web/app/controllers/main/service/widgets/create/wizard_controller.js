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

App.WidgetWizardController = App.WizardController.extend({

  name: 'widgetWizardController',

  totalSteps: 3,

  /**
   * Used for hiding back button in wizard
   */
  hideBackButton: true,


  content: Em.Object.create({
    controllerName: 'widgetWizardController',
    widgetService: null,
    widgetType: "",

    /**
     * @type {number}
     * @default null
     */
    layoutId: null,

    /**
     * Example:
     * {
     *  "display_unit": "%",
     *  "warning_threshold": 70,
     *  "error_threshold": 90
     * }
     */
    widgetProperties: {},

    /**
     * Example:
     * [{
     *  widget_id: "metrics/rpc/closeRegion_num_ops",
     *  name: "rpc.rpc.closeRegion_num_ops",
     *  pointInTime: true,
     *  temporal: true,
     *  category: "default"
     *  serviceName: "HBASE"
     *  componentName: "HBASE_CLIENT"
     *  type: "GANGLIA"//or JMX
     *  level: "COMPONENT"//or HOSTCOMPONENT
     * }]
     * @type {Array}
     */
    allMetrics: [],

    /**
     * Example:
     * [{
     *  "name": "regionserver.Server.percentFilesLocal",
     *  "serviceName": "HBASE",
     *  "componentName": "HBASE_REGIONSERVER"
     * }]
     */
    widgetMetrics: [],

    /**
     * Example:
     * [{
     *  "name": "Files Local",
     *  "value": "${regionserver.Server.percentFilesLocal}"
     * }]
     */
    widgetValues: [],
    widgetName: "",
    widgetDescription: "",
    widgetAuthor: function () {
      return App.router.get('loginName');
    }.property('App.router.loginName'),
    widgetScope: null
  }),

  loadMap: {
    '1': [
      {
        type: 'sync',
        callback: function () {
          this.load('widgetService');
          this.load('widgetType');
        }
      }
    ],
    '2': [
      {
        type: 'sync',
        callback: function () {
          this.load('widgetProperties', true);
          this.load('widgetValues', true);
          this.load('widgetMetrics', true);
          this.load('expressions', true);
          this.load('dataSets', true);
          this.load('templateValue', true);
        }
      },
      {
        type: 'async',
        callback: function () {
          return this.loadAllMetrics();
        }
      }
    ]
  },

  /**
   * set current step
   * @param {string} currentStep
   * @param {boolean} completed
   * @param {boolean} skipStateSave
   */
  setCurrentStep: function (currentStep, completed, skipStateSave) {
    this._super(currentStep, completed);
    if (App.get('testMode') || skipStateSave) {
      return;
    }
    this.saveClusterStatus('WIDGET_DEPLOY');
  },

  setStepsEnable: function () {
    for (var i = 1; i <= this.get('totalSteps'); i++) {
      var step = this.get('isStepDisabled').findProperty('step', i);
      if (i <= this.get('currentStep') && App.get('router.clusterController.isLoaded')) {
        step.set('value', false);
      } else {
        step.set('value', i != this.get('currentStep'));
      }
    }
  }.observes('currentStep', 'App.router.clusterController.isLoaded'),


  /**
   * save status of the cluster.
   * @param {object} clusterStatus
   */
  saveClusterStatus: function (clusterStatus) {
    App.clusterStatus.setClusterStatus({
      clusterState: clusterStatus,
      wizardControllerName: 'widgetWizardController',
      localdb: App.db.data
    });
  },

  /**
   * save wizard properties to controller and localStorage
   * @param {string} name
   * @param value
   */
  save: function (name, value) {
    this.set('content.' + name, value);
    this._super(name);
  },

  /**
   * load widget metrics
   * on resolve deferred return array of widget metrics
   * @returns {$.Deferred}
   */
  loadAllMetrics: function () {
    var widgetMetrics = this.getDBProperty('allMetrics');
    var self = this;
    var dfd = $.Deferred();

    if (widgetMetrics.length === 0) {
      this.loadAllMetricsFromServer(function () {
        dfd.resolve(self.get('content.allMetrics'));
      });
    } else {
      this.set('content.allMetrics', widgetMetrics);
      dfd.resolve(widgetMetrics);
    }
    return dfd.promise();
  },

  /**
   * load metrics from server
   * @param {function} callback
   * @returns {$.ajax}
   */
  loadAllMetricsFromServer: function (callback) {
    return App.ajax.send({
      name: 'widgets.wizard.metrics.get',
      sender: this,
      data: {
        stackVersionURL: App.get('stackVersionURL'),
        serviceNames: App.Service.find().filter(function (item) {
          return App.StackService.find(item.get('id')).get('isServiceWithWidgets');
        }).mapProperty('serviceName').join(',')
      },
      callback: callback,
      success: 'loadAllMetricsFromServerCallback'
    });
  },

  /**
   *
   * @param {object} json
   */
  loadAllMetricsFromServerCallback: function (json) {
    var self = this;
    var result = [];
    var metrics = {};

    if (json) {
      json.items.forEach(function (service) {
        var data = service.artifacts[0].artifact_data[service.StackServices.service_name];
        for (var componentName in data) {
          for (var level in data[componentName]) {
            var metricTypes = data[componentName][level]; //Ganglia or JMX
            metricTypes.forEach(function (_metricType) {
              metrics = _metricType['metrics']['default'];
              var type = _metricType["type"].toUpperCase();
              if (!(type === 'JMX' && level.toUpperCase() === 'COMPONENT')) {
                for (var widgetId in metrics) {
                  var metricObj = {
                    widget_id: widgetId,
                    point_in_time: metrics[widgetId].pointInTime,
                    temporal: metrics[widgetId].temporal,
                    name: metrics[widgetId].name,
                    level: level.toUpperCase(),
                    type: type,
                    component_name: componentName,
                    service_name: service.StackServices.service_name
                  };
                  result.push(metricObj);
                  if (metricObj.level === 'HOSTCOMPONENT') {
                    self.insertHostComponentCriteria(metricObj);
                  }
                }
              }
            }, this);
          }
        }
      }, this);
    }
    this.save('allMetrics', result);
  },

  /**
   *
   * @param metricObj {Object}
   */
  insertHostComponentCriteria: function (metricObj) {
    switch (metricObj.component_name) {
      case 'NAMENODE':
        metricObj.host_component_criteria = 'host_components/metrics/dfs/FSNamesystem/HAState=active';
        break;
      case 'RESOURCEMANAGER':
        metricObj.host_component_criteria = 'host_components/HostRoles/ha_state=ACTIVE';
        break;
      default:
    }
  },

  /**
   * post widget definition to server
   * @returns {$.ajax}
   */
  postWidgetDefinition: function (data) {
    return App.ajax.send({
      name: 'widgets.wizard.add',
      sender: this,
      data: {
        data: data
      },
      success: 'postWidgetDefinitionSuccessCallback'
    });
  },

  /**
   * assign created widget to active layout if it present
   * @param data
   */
  postWidgetDefinitionSuccessCallback: function (data) {
    if (Em.isNone(this.get('content.layoutId'))) return;
    var widgets = App.WidgetLayout.find(this.get('content.layoutId')).get('widgets').toArray();
    widgets.pushObject(Em.Object.create({
      id: data.resources[0].WidgetInfo.id
    }));
    App.router.get('mainServiceInfoSummaryController').saveWidgetLayout(widgets);
  },

  /**
   * Remove all loaded data.
   * Created as copy for App.router.clearAllSteps
   */
  clearAllSteps: function () {
    this.clearInstallOptions();
    // clear temporary information stored during the install
    this.set('content.cluster', this.getCluster());
  },

  clearTasksData: function () {
    this.saveTasksStatuses(undefined);
    this.saveRequestIds(undefined);
    this.saveTasksRequestIds(undefined);
  },

  cancel: function () {
    var self = this;
    var step3Controller = App.router.get('widgetWizardStep3Controller');
    return App.ModalPopup.show({
      header: Em.I18n.t('common.warning'),
      bodyClass: Em.View.extend({
        template: Ember.Handlebars.compile('{{t alerts.saveChanges}}')
      }),
      primary: Em.I18n.t('common.save'),
      secondary: Em.I18n.t('common.discard'),
      third: Em.I18n.t('common.cancel'),
      disablePrimary: function () {
        return !(parseInt(self.get('currentStep')) === self.get('totalSteps') && !step3Controller.get('isSubmitDisabled'));
      }.property(''),
      onPrimary: function () {
        App.router.send('complete', step3Controller.collectWidgetData());
        this.onSecondary();
      },
      onSecondary: function () {
        this.hide();
        self.finishWizard();
      },
      onThird: function () {
        this.hide();
      }
    });
  },

  /**
   * finish wizard
   */
  finishWizard: function () {
    this.finish();
    this.get('popup').hide();
    var serviceName = this.get('content.widgetService');
    var service = App.Service.find(serviceName);
    App.router.transitionTo('main.services.service.summary', service);
    if (!App.get('testMode')) {
      App.clusterStatus.setClusterStatus({
        clusterName: App.router.getClusterName(),
        clusterState: 'DEFAULT',
        localdb: App.db.data
      });
    }
  },


  /**
   * Clear all temporary data
   */
  finish: function () {
    this.setCurrentStep('1', false, true);
    this.save('widgetType', '');
    this.resetDbNamespace();
    App.get('router.updateController').updateAll();
  }
});
