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

import Ember from 'ember';
import constants from 'hive/utils/constants';

export default Ember.Controller.extend({
  needs: [ constants.namingConventions.index,
           constants.namingConventions.jobProgress ],

  index: Ember.computed.alias('controllers.' + constants.namingConventions.index),
  jobProgress: Ember.computed.alias('controllers.' + constants.namingConventions.jobProgress),

  updateProgress: function () {
    this.set('verticesProgress', this.get('jobProgress.stages'));
  }.observes('jobProgress.stages', 'jobProgress.stages.@each.value'),

  actions: {
    onTabOpen: function () {
      var self = this;

      this.get('index')._executeQuery(true, true).then(function (json) {
        //this condition should be changed once we change the way of retrieving this json
        if (json['STAGE PLANS']['Stage-1']) {
          self.set('json', json);
        }
      }, function (err) {
        self.notify.error(err.responseJSON.message, err.responseJSON.trace);
      });
    }
  }
});
