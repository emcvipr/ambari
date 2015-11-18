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
require('utils/configs/config_initializer_class');

/**
 * Initializer for configs that are updated when Resource Manager HA-mode is activated
 *
 * @class {RmHaConfigInitializer}
 */
App.RmHaConfigInitializer = App.HaConfigInitializerClass.create({

  initializers: {
    'yarn.resourcemanager.hostname.rm1': App.HaConfigInitializerClass.getHostWithPortConfig('RESOURCEMANAGER', true, '', '', ''),
    'yarn.resourcemanager.hostname.rm2': App.HaConfigInitializerClass.getHostWithPortConfig('RESOURCEMANAGER', false,'', '', ''),
    'yarn.resourcemanager.zk-address': App.HaConfigInitializerClass.getHostsWithPortConfig('ZOOKEEPER_SERVER', '', '', ',', 'zkClientPort', true),
    'yarn.resourcemanager.webapp.address.rm1': App.HaConfigInitializerClass.getHostWithPortConfig('RESOURCEMANAGER', true, '', '', 'webAddressPort', true),
    'yarn.resourcemanager.webapp.address.rm2': App.HaConfigInitializerClass.getHostWithPortConfig('RESOURCEMANAGER', false, '', '', 'webAddressPort', true),
    'yarn.resourcemanager.webapp.https.address.rm1': App.HaConfigInitializerClass.getHostWithPortConfig('RESOURCEMANAGER', true, '', '', 'httpsWebAddressPort', true),
    'yarn.resourcemanager.webapp.https.address.rm2': App.HaConfigInitializerClass.getHostWithPortConfig('RESOURCEMANAGER', false, '', '', 'httpsWebAddressPort', true)
  }

});