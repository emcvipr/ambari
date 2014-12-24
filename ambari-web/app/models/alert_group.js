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

/**
 * Represents an alert-group on the cluster.
 * A alert group is a collection of alert definitions
 *
 * Alert group hierarchy is at 2 levels. For
 * each service there is a 'Default' alert group
 * containing all definitions , this group is read-only
 *
 * User can create new alert group containing alert definitions from
 * any service.
 */
App.AlertGroup = DS.Model.extend({

  name: DS.attr('string'),

  description: DS.attr('string'),

  /**
   * Is this group default for some service
   * @type {boolean}
   */
  default: DS.attr('boolean'),

  /**
   * @type {App.AlertDefinition[]}
   */
  definitions: function () {
    return Array.prototype.concat.call(
      Array.prototype, this.get('portAlertDefinitions').toArray(),
      this.get('metricsAlertDefinitions').toArray(),
      this.get('webAlertDefinitions').toArray(),
      this.get('aggregateAlertDefinitions').toArray(),
      this.get('scriptAlertDefinitions').toArray()
    );
  }.property('portAlertDefinitions.length', 'metricsAlertDefinitions.length', 'webAlertDefinitions.length', 'aggregateAlertDefinitions.length', 'scriptAlertDefinitions.length'),

  /**
   * @type {App.PortAlertDefinition[]}
   */
  portAlertDefinitions: DS.hasMany('App.PortAlertDefinition'),

  /**
   * @type {App.MetricsAlertDefinition[]}
   */
  metricsAlertDefinitions: DS.hasMany('App.MetricsAlertDefinition'),

  /**
   * @type {App.WebAlertDefinition[]}
   */
  webAlertDefinitions: DS.hasMany('App.WebAlertDefinition'),

  /**
   * @type {App.AggregateAlertDefinition[]}
   */
  aggregateAlertDefinitions: DS.hasMany('App.AggregateAlertDefinition'),

  /**
   * @type {App.ScriptAlertDefinition[]}
   */
  scriptAlertDefinitions: DS.hasMany('App.ScriptAlertDefinition'),

  /**
   * @type {App.AlertNotification[]}
   */
  targets: DS.hasMany('App.AlertNotification'),

  /**
   * @type {string}
   */
  displayName: function () {
    var name = this.get('name');
    if (name && name.length > App.config.CONFIG_GROUP_NAME_MAX_LENGTH) {
      var middle = Math.floor(App.config.CONFIG_GROUP_NAME_MAX_LENGTH / 2);
      name = name.substring(0, middle) + "..." + name.substring(name.length - middle);
    }
    return this.get('default') ? (name + ' Default') : name;
  }.property('name', 'default'),

  /**
   * @type {string}
   */
  displayNameDefinitions: function () {
    return this.get('displayName') + ' (' + this.get('definitions.length') + ')';
  }.property('displayName', 'definitions.length'),

  isAddDefinitionsDisabled: function () {
    return this.get('default');
  }.property('default')
});
App.AlertGroup.FIXTURES = [];


