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

export default Ember.Object.create({
  appTitle: 'Hive',

  /**
   * This should reflect the naming conventions accross the application.
   * Changing one value also means changing the filenames for the chain of files
   * represented by that value (routes, controllers, models etc).
   * This dependency goes both ways.
  */
  namingConventions: {
    routes: {
      index: 'index',
      savedQuery: 'savedQuery',
      historyQuery: 'historyQuery',
      queries: 'queries',
      history: 'history',
      udfs: 'udfs',
      logs: 'logs',
      results: 'results',
      explain: 'explain'
    },

    subroutes: {
      savedQuery: 'index.savedQuery',
      historyQuery: 'index.historyQuery',
      jobLogs: 'index.historyQuery.logs',
      jobResults: 'index.historyQuery.results',
      jobExplain: 'index.historyQuery.explain'
    },

    index: 'index',
    udf: 'udf',
    udfs: 'udfs',
    udfInsertPrefix: 'create temporary function ',
    fileInsertPrefix: 'add jar ',
    explainPrefix: 'EXPLAIN ',
    insertUdfs: 'insert-udfs',
    job: 'job',
    jobs: 'jobs',
    history: 'history',
    savedQuery: 'saved-query',
    database: 'database',
    databases: 'databases',
    openQueries: 'open-queries',
    file: 'file',
    fileResource: 'file-resource',
    fileResources: 'file-resources',
    loadedFiles: 'loaded-files',
    alerts: 'alerts',
    logs: 'logs',
    results: 'results',
    jobResults: 'index/history-query/results',
    jobLogs: 'index/history-query/logs',
    jobExplain: 'index/history-query/explain',
    databaseTree: 'databases-tree',
    databaseSearch: 'databases-search-results',
    tables: 'tables',
    columns: 'columns',
    settings: 'settings'
  },

  statuses: {
    unknown: "Unknown",
    initialized: "Initialized",
    running: "Running",
    finished: "Finished",
    canceled: "Canceled",
    closed: "Closed",
    error: "Error",
    pending: "Pending"
  },

  alerts: {
    warning: 'warning',
    error: 'danger',
    success: 'success'
  },

  results: {
    save: {
      csv: 'Save as csv',
      hdfs: 'Save to HDFS'
    },
    statuses: {
      terminated: "TERMINATED",
      runnable: "RUNNABLE"
    }
  },

  //this can be replaced by a string.format implementation
  adapter: {
    version: '0.0.1',
    instance: 'Hive',
    apiPrefix: '/api/v1/views/HIVE/versions/',
    instancePrefix: '/instances/',
    resourcePrefix: 'resources/'
  },

  settings: {
    executionEngine: 'hive.execution.engine'
  }
});
