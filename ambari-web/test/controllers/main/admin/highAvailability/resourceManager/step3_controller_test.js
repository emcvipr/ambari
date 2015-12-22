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
require('controllers/main/admin/highAvailability/resourceManager/step3_controller');

describe('App.RMHighAvailabilityWizardStep3Controller', function () {

  describe('#isSubmitDisabled', function () {

    var controller = App.RMHighAvailabilityWizardStep3Controller.create({
        content: Em.Object.create({})
      }),
      cases = [
        {
          isLoaded: false,
          isSubmitDisabled: true,
          title: 'wizard step content not loaded'
        },
        {
          isLoaded: true,
          isSubmitDisabled: false,
          title: 'wizard step content loaded'
        }
      ];

    cases.forEach(function (item) {
      it(item.title, function () {
        controller.set('isLoaded', item.isLoaded);
        expect(controller.get('isSubmitDisabled')).to.equal(item.isSubmitDisabled);
      });
    });

  });

  describe('#loadConfigTagsSuccessCallback', function () {

    var controller = App.RMHighAvailabilityWizardStep3Controller.create({
      content: Em.Object.create({})
    });

    beforeEach(function () {
      sinon.stub(App.ajax, 'send', Em.K);
    });

    afterEach(function () {
      App.ajax.send.restore();
    });

    it('should send proper ajax request', function () {
      controller.loadConfigTagsSuccessCallback({
        'Clusters': {
          'desired_configs': {
            'zoo.cfg': {
              'tag': 1
            },
            'yarn-site': {
              'tag': 1
            }
          }
        }
      }, {}, {
        'serviceConfig': {}
      });
      var data = App.ajax.send.args[0][0].data;
      expect(data.urlParams).to.equal('(type=zoo.cfg&tag=1)|(type=yarn-site&tag=1)');
      expect(data.serviceConfig).to.eql({});
    });

  });

  describe('#loadConfigsSuccessCallback', function () {

    var controller = App.RMHighAvailabilityWizardStep3Controller.create({
        content: Em.Object.create({})
      }),
      cases = [
        {
          'items': [],
          'params': {
            'serviceConfig': {}
          },
          'port': '2181',
          'webAddressPort' : ':8088',
          'httpsWebAddressPort' : ':8090',
          'title': 'empty response'
        },
        {
          'items': [
            {
              'type': 'zoo.cfg'
            },
            {
              'type': 'yarn-site'
            }
          ],
          'params': {
            'serviceConfig': {}
          },
          'port': '2181',
          'webAddressPort' : ':8088',
          'httpsWebAddressPort' : ':8090',
          'title': 'no zoo.cfg properties received'
        },
        {
          'items': [
            {
              'type': 'zoo.cfg',
              'properties': {
                'n': 'v'
              }
            },
            {
              'type': 'yarn-site',
              'properties': {
                'n': 'v'
              }
            }
          ],
          'params': {
            'serviceConfig': {}
          },
          'port': '2181',
          'webAddressPort' : ':8088',
          'httpsWebAddressPort' : ':8090',
          'title': 'no clientPort property received'
        },
        {
          'items': [
            {
              'type': 'zoo.cfg',
              'properties': {
                'clientPort': '2182'
              }
            },
            {
              'type': 'yarn-site',
              'properties': {
                'yarn.resourcemanager.webapp.address' : 'c6402.ambari.apache.org:7777',
                'yarn.resourcemanager.webapp.https.address' : 'c6402.ambari.apache.org:8888'
              }
            }
          ],
          'params': {
            'serviceConfig': {}
          },
          'port': '2182',
          'webAddressPort' : ':7777',
          'httpsWebAddressPort' : ':8888',
          'title': 'clientPort property received'
        }
      ];

    beforeEach(function () {
      sinon.stub(controller, 'setDynamicConfigValues', Em.K);
    });

    afterEach(function () {
      controller.setDynamicConfigValues.restore();
    });

    cases.forEach(function (item) {
      it(item.title, function () {
        controller.loadConfigsSuccessCallback({
          items: item.items
        }, {}, item.params);
        expect(controller.get('selectedService')).to.eql({});
        expect(controller.get('isLoaded')).to.be.true;
      });
    });

  });

  describe('#loadConfigsSuccessCallback=loadConfigsErrorCallback(we have one callback for bouth cases)', function () {

    var controller = App.RMHighAvailabilityWizardStep3Controller.create({
      content: Em.Object.create({})
    });

    beforeEach(function () {
      sinon.stub(controller, 'setDynamicConfigValues', Em.K);
    });

    afterEach(function () {
      controller.setDynamicConfigValues.restore();
    });

    it('should proceed with default value', function () {
      controller.loadConfigsSuccessCallback({}, {}, {}, {}, {
        serviceConfig: {}
      });
      expect(controller.get('selectedService')).to.eql({});
      expect(controller.get('isLoaded')).to.be.true;
    });

  });

  describe('#setDynamicConfigValues', function () {

    var data = {
      items: [
        {
          type: 'zoo.cfg',
          properties: {
            clientPort: 2222
          }
        },
        {
          type: 'yarn-site',
          properties: {
            'yarn.resourcemanager.webapp.address': 'lclhst:1234',
            'yarn.resourcemanager.webapp.https.address': 'lclhst:4321'
          }
        }
      ]
    };

    var controller = App.RMHighAvailabilityWizardStep3Controller.create({
        content: Em.Object.create({
          masterComponentHosts: [
            {component: 'RESOURCEMANAGER', hostName: 'h0', isInstalled: true},
            {component: 'RESOURCEMANAGER', hostName: 'h1', isInstalled: false},
            {component: 'ZOOKEEPER_SERVER', hostName: 'h2', isInstalled: true},
            {component: 'ZOOKEEPER_SERVER', hostName: 'h3', isInstalled: true}
          ],
          slaveComponentHosts: [],
          hosts: {},
          rmHosts: {
            currentRM: 'h0',
            additionalRM: 'h1'
          }
        })
      }),
      configs = {
        configs: [
          Em.Object.create({
            name: 'yarn.resourcemanager.hostname.rm1'
          }),
          Em.Object.create({
            name: 'yarn.resourcemanager.hostname.rm2'
          }),
          Em.Object.create({
            name: 'yarn.resourcemanager.zk-address'
          }),
          Em.Object.create({
            name: 'yarn.resourcemanager.webapp.address.rm1'
          }),
          Em.Object.create({
            name: 'yarn.resourcemanager.webapp.address.rm2'
          }),
          Em.Object.create({
            name: 'yarn.resourcemanager.webapp.https.address.rm1'
          }),
          Em.Object.create({
            name: 'yarn.resourcemanager.webapp.https.address.rm2'
          }),
          Em.Object.create({
            name: 'yarn.resourcemanager.ha'
          }),
          Em.Object.create({
            name: 'yarn.resourcemanager.scheduler.ha'
          })
        ]
      };

    beforeEach(function () {
      sinon.stub(App.HostComponent, 'find', function () {
        return [
          Em.Object.create({
            componentName: 'ZOOKEEPER_SERVER',
              hostName: 'h2'
          }),
          Em.Object.create({
            componentName: 'ZOOKEEPER_SERVER',
              hostName: 'h3'
          }),
          Em.Object.create({
            componentName: 'RESOURCEMANAGER',
              hostName: 'h4'
          })
        ];
      });
    });

    afterEach(function () {
      App.HostComponent.find.restore();
    });

    it('setting new RM properties values', function () {
      controller.setDynamicConfigValues(configs, data);
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.hostname.rm1').get('value')).to.equal('h0');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.hostname.rm1').get('recommendedValue')).to.equal('h0');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.hostname.rm2').get('value')).to.equal('h1');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.hostname.rm2').get('recommendedValue')).to.equal('h1');

      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.webapp.address.rm1').get('value')).to.equal('h0:1234');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.webapp.address.rm1').get('recommendedValue')).to.equal('h0:1234');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.webapp.address.rm2').get('value')).to.equal('h1:1234');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.webapp.address.rm2').get('recommendedValue')).to.equal('h1:1234');

      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.webapp.https.address.rm1').get('value')).to.equal('h0:4321');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.webapp.https.address.rm1').get('recommendedValue')).to.equal('h0:4321');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.webapp.https.address.rm2').get('value')).to.equal('h1:4321');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.webapp.https.address.rm2').get('recommendedValue')).to.equal('h1:4321');

      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.zk-address').get('value')).to.equal('h2:2222,h3:2222');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.zk-address').get('recommendedValue')).to.equal('h2:2222,h3:2222');
    });

    it('Setting new HAWQ RM properties values', function () {
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.ha').get('value')).to.equal('h0:8032,h1:8032');
      expect(configs.configs.findProperty('name', 'yarn.resourcemanager.scheduler.ha').get('recommendedValue')).to.equal('h0:8030,h1:8030');
    });

  });

});
