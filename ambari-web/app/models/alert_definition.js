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
var dateUtils = require('utils/date');

App.AlertDefinition = DS.Model.extend({

  name: DS.attr('string'),
  label: DS.attr('string'),
  description: DS.attr('string'),
  service: DS.belongsTo('App.Service'),
  serviceName: DS.attr('string'),
  componentName: DS.attr('string'),
  enabled: DS.attr('boolean'),
  scope: DS.attr('string'),
  interval: DS.attr('number'),
  type: DS.attr('string'),
  groups: DS.hasMany('App.AlertGroup'),
  reporting: DS.hasMany('App.AlertReportDefinition'),
  lastTriggered: DS.attr('number'),

  /**
   * Raw data from AlertDefinition/source
   * used to format request content for updating alert definition
   * @type {Object}
   */
  rawSourceData: {},

  /**
   * Counts of alert grouped by their status
   * Format:
   * <code>
   *   {
   *    "CRITICAL": 1,
   *    "OK": 1,
   *    "UNKNOWN": 0,
   *    "WARN": 0
   *   }
   * </code>
   * @type {object}
   */
  summary: {},

  /**
   * Formatted timestamp for latest alert triggering for current alertDefinition
   * @type {string}
   */
  lastTriggeredFormatted: function () {
    return dateUtils.dateFormat(this.get('lastTriggered'));
  }.property('lastTriggered'),

  /**
   * Formatted timestamp with <code>$.timeago</code>
   * @type {string}
   */
  lastTriggeredAgoFormatted: function () {
    var lastTriggered = this.get('lastTriggered');
    return lastTriggered ? $.timeago(new Date(lastTriggered)) : '';
  }.property('lastTriggered'),

  lastTriggeredVerboseDisplay: function () {
    var lastTriggered = this.get('lastTriggered');
    return Em.I18n.t('models.alert_definition.triggered.verbose').format(dateUtils.dateFormat(lastTriggered));
  }.property('lastTriggered'),

  /**
   * Formatted timestamp in format: for 4 days
   * @type {string}
   */
  lastTriggeredForFormatted: function () {
    var lastTriggered = this.get('lastTriggered');
    var previousSuffixAgo = $.timeago.settings.strings.suffixAgo;
    var previousPrefixAgo = $.timeago.settings.strings.prefixAgo;
    $.timeago.settings.strings.suffixAgo = null;
    $.timeago.settings.strings.prefixAgo = 'for';
    var triggeredFor = lastTriggered ? $.timeago(new Date(lastTriggered)) : '';
    $.timeago.settings.strings.suffixAgo = previousSuffixAgo;
    $.timeago.settings.strings.prefixAgo = previousPrefixAgo;
    return triggeredFor;
  }.property('lastTriggered'),

  /**
   * Formatted displayName for <code>componentName</code>
   * @type {String}
   */
  componentNameFormatted: function () {
    return App.format.role(this.get('componentName'));
  }.property('componentName'),

  /**
   * Status generates from child-alerts
   * Format: OK(1)  WARN(2)  CRIT(1)  UNKN(1)
   * If single host: show: OK/WARNING/CRITICAL/UNKNOWN
   * If some there are no alerts with some state, this state isn't shown
   * If no OK/WARN/CRIT/UNKN state, then show PENDING
   * Order is equal to example
   * @type {string}
   */
  status: function () {
    var order = this.get('order'),
        summary = this.get('summary'),
        hostCnt = 0,
        self = this;
    order.forEach(function (state) {
      var cnt = summary[state] ? summary[state] : 0;
      hostCnt += cnt;
    });
    if (hostCnt > 1) {
      // multiple hosts
      return order.map(function (state) {
        var shortState = self.get('shortState')[state];
        return summary[state] ? '<span class="alert-state-single-host label alert-state-' + state + '">' + shortState + ' (' + summary[state] + ')</span>' : null;
      }).compact().join(' ');
    } else if (hostCnt == 1) {
      // single host, single status
      return order.map(function (state) {
        var shortState = self.get('shortState')[state];
        return summary[state] ? '<span class="alert-state-single-host label alert-state-' + state + '">' + shortState + '</span>' : null;
      }).compact().join(' ');
    } else if (hostCnt == 0) {
      // none
      return '<span class="alert-state-single-host label alert-state-PENDING">NONE</span>';
    }
    return null;
  }.property('summary'),

  isHostAlertDefinition: function () {
    var serviceID = (this.get('service')._id === "AMBARI"),
        component = (this.get('componentName') === "AMBARI_AGENT");
    return serviceID && component;
  }.property('service', 'componentName'),

  typeIconClass: function () {
    var typeIcons = this.get('typeIcons'),
        type = this.get('type');
    return typeIcons[type];
  }.property('type'),

  /**
   * if this definition is in state: CRIT / WARNING, if true, will show up in alerts fast access popup
   * @type {boolean}
   */
  isCriticalOrWarning: function () {
    return this.get('isCritical') || this.get('isWarning');
  }.property('isCritical', 'isWarning'),

  /**
   * if this definition is in state: CRIT
   * @type {boolean}
   */
  isCritical: function () {
    var summary = this.get('summary');
    var state = 'CRITICAL';
    return !!summary[state];
  }.property('summary'),

  /**
   * if this definition is in state: WARNING
   * @type {boolean}
   */
  isWarning: function () {
    var summary = this.get('summary');
    var state = 'WARNING';
    return !!summary[state];
  }.property('summary'),

  /**
   * if this definition is in state: OK
   * @type {boolean}
   */
  isOK: function () {
    var summary = this.get('summary');
    var state = 'OK';
    return !!summary[state];
  }.property('summary'),

  /**
   * if this definition is in state: OK
   * @type {boolean}
   */
  isUnknown: function () {
    var summary = this.get('summary');
    var state = 'UNKNOWN';
    return !!summary[state];
  }.property('summary'),

  /**
   * For alerts we will have processes which are not typical
   * cluster services - like Ambari-Server. This method unifies
   * cluster services and other services into a common display-name.
   * @see App.AlertInstance#serviceDisplayName()
   */
  serviceDisplayName: function () {
    var serviceName = this.get('service.displayName');
    if (!serviceName) {
      serviceName = this.get('serviceName');
      if (serviceName) {
        serviceName = serviceName.toCapital();
      }
    }
    return serviceName;
  }.property('serviceName', 'service.displayName'),

  /**
   * List of css-classes for alert types
   * @type {object}
   */
  typeIcons: {
    'METRIC': 'icon-bolt',
    'SCRIPT': 'icon-file-text',
    'WEB': 'icon-globe',
    'PORT': 'icon-signin',
    'AGGREGATE': 'icon-plus'
  },

  /**
   * Sort on load definitions by this severity order
   */
  severityOrder: ['CRITICAL', 'WARNING', 'OK', 'UNKNOWN', 'PENDING'],
  order: ['OK', 'WARNING', 'CRITICAL', 'UNKNOWN'],

  shortState: {
    'CRITICAL': 'CRIT',
    'WARNING': 'WARN',
    'OK': 'OK',
    'UNKNOWN': 'UNKWN',
    'PENDING': 'NONE'
  }
});

App.AlertDefinition.reopenClass({

  getAllDefinitions: function () {
    return Array.prototype.concat.call(
        Array.prototype, App.PortAlertDefinition.find().toArray(),
        App.MetricsAlertDefinition.find().toArray(),
        App.WebAlertDefinition.find().toArray(),
        App.AggregateAlertDefinition.find().toArray(),
        App.ScriptAlertDefinition.find().toArray()
    )
  }

});

App.AlertReportDefinition = DS.Model.extend({
  type: DS.attr('string'),
  text: DS.attr('string'),
  value: DS.attr('number')
});

App.AlertMetricsSourceDefinition = DS.Model.extend({
  propertyList: [],
  value: DS.attr('string')
});

App.AlertMetricsUriDefinition = DS.Model.extend({
  http: DS.attr('string'),
  https: DS.attr('string'),
  httpsProperty: DS.attr('string'),
  httpsPropertyValue: DS.attr('string')
});

App.PortAlertDefinition = App.AlertDefinition.extend({
  defaultPort: DS.attr('number'),
  uri: DS.attr('string')
});

App.MetricsAlertDefinition = App.AlertDefinition.extend({
  jmx: DS.belongsTo('App.AlertMetricsSourceDefinition'),
  ganglia: DS.belongsTo('App.AlertMetricsSourceDefinition'),
  uri: DS.belongsTo('App.AlertMetricsUriDefinition')
});

App.WebAlertDefinition = App.AlertDefinition.extend({
  uri: DS.belongsTo('App.AlertMetricsUriDefinition')
});

App.AggregateAlertDefinition = App.AlertDefinition.extend({
  alertName: DS.attr('string')
});

App.ScriptAlertDefinition = App.AlertDefinition.extend({
  location: DS.attr('string')
});

App.AlertDefinition.FIXTURES = [];
App.AlertReportDefinition.FIXTURES = [];
App.AlertMetricsSourceDefinition.FIXTURES = [];
App.PortAlertDefinition.FIXTURES = [];
App.AlertMetricsUriDefinition.FIXTURES = [];
App.MetricsAlertDefinition.FIXTURES = [];
App.WebAlertDefinition.FIXTURES = [];
App.AggregateAlertDefinition.FIXTURES = [];
App.ScriptAlertDefinition.FIXTURES = [];
