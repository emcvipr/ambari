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

App.HBaseLinksView = App.LinkDashboardWidgetView.extend({

  templateName: require('templates/main/dashboard/widgets/hbase_links'),
  title: Em.I18n.t('dashboard.widgets.HBaseLinks'),
  id: '12',

  model_type: 'hbase',

  port: App.get('isHadoop23Stack') ? '16010' : '60010',

  componentName: 'HBASE_REGIONSERVER',

  /**
   * All master components
   */
  masters: Em.computed.filterBy('model.hostComponents', 'isMaster', true),
  /**
   * Passive master components
   */
  passiveMasters: Em.computed.filterBy('masters', 'haStatus', 'false'),
  /**
   * One(!) active master component
   */
  activeMaster: Em.computed.findBy('masters', 'haStatus', 'true'),

  activeMasterTitle: function(){
    return this.t('service.hbase.activeMaster');
  }.property('activeMaster'),

  hbaseMasterWebUrl: function () {
    if (this.get('activeMaster.host') && this.get('activeMaster.host').get('publicHostName')) {
      return "http://" + this.get('activeMaster.host').get('publicHostName') + ':' + this.get('port');
    }
    return '';
  }.property('activeMaster'),

  calcWebUrl: function() {
    return '';
  }

});