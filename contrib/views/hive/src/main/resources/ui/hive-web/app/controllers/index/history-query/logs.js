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
import utils from 'hive/utils/functions';

export default Ember.ObjectController.extend({
  needs: [ constants.namingConventions.queryTabs,
           constants.namingConventions.loadedFiles ],

  queryTabs: Ember.computed.alias('controllers.' + constants.namingConventions.queryTabs),
  files: Ember.computed.alias('controllers.' + constants.namingConventions.loadedFiles),

  reloadJobLogs: function (job) {
    var self = this,
        defer = Ember.RSVP.defer(),
        handleError = function (error) {
          job.set('isRunning', false);

          if (typeof error === "string") {
            self.notify.error(error);
          } else {
            self.notify.error(error.responseJSON.message, error.responseJSON.trace);
          }
          defer.reject();
        };

    job.reload().then(function () {
      if (utils.insensitiveCompare(job.get('status'), constants.statuses.error)) {
        handleError(job.get('statusMessage'));
      } else {
        self.get('files').reload(job.get('logFile')).then(function (file) {
        var fileContent = file.get('fileContent');

        if (fileContent) {
          job.set('log', fileContent);
        }

        defer.resolve();
        },function (err) {
          handleError(err);
        });
      }
    }, function (err) {
      handleError(err);
    });

    return defer.promise;
  },

  listenForUpdates: function (job) {
    Ember.run.later(this, function () {
      var self = this;

      this.reloadJobLogs(job).then(function () {
        var stillRunning = self.isJobRunning(job);
        var currentContentId = self.get('content.id');
        var currentActiveTab = self.get('queryTabs.activeTab.name');

        //if the current model is the same with the one displayed, continue reloading job
        if (stillRunning && job.get('id') === currentContentId) {
          self.listenForUpdates(job);
        } else if (!stillRunning) {
          job.set('isRunning', undefined);

          if (job.get('id') === currentContentId &&
              currentActiveTab === constants.namingConventions.index) {
            self.transitionToRoute(constants.namingConventions.subroutes.jobResults);
          }
        }
      });
    }, 10000);
  },

  isJobRunning: function (job) {
    return utils.insensitiveCompare(job.get('status'),
                                    constants.statuses.unknown,
                                    constants.statuses.initialized,
                                    constants.statuses.running,
                                    constants.statuses.pending);
  },

  getLogs: function () {
    var self = this,
        job = this.get('content');

    if (this.isJobRunning(job)) {
      job.set('isRunning', true);
      this.reloadJobLogs(job).then(function () {
        self.listenForUpdates(job);
      });
    }
  }.observes('content')
});
