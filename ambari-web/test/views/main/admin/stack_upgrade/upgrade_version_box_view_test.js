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
require('views/main/admin/stack_upgrade/upgrade_version_box_view');

describe('App.UpgradeVersionBoxView', function () {
  var view = App.UpgradeVersionBoxView.create({
    controller: Em.Object.create({
      upgrade: Em.K
    }),
    content: Em.Object.create(),
    parentView: Em.Object.create({
      repoVersions: []
    })
  });

  describe("#isUpgrading", function () {
    afterEach(function () {
      App.set('upgradeState', 'INIT');
    });
    it("wrong version", function () {
      App.set('upgradeState', 'IN_PROGRESS');
      view.set('controller.upgradeVersion', 'HDP-2.2.1');
      view.set('content.displayName', 'HDP-2.2.2');
      view.propertyDidChange('isUpgrading');
      expect(view.get('isUpgrading')).to.be.false;
    });
    it("correct version", function () {
      App.set('upgradeState', 'IN_PROGRESS');
      view.set('controller.upgradeVersion', 'HDP-2.2.2');
      view.set('content.displayName', 'HDP-2.2.2');
      view.propertyDidChange('isUpgrading');
      expect(view.get('isUpgrading')).to.be.true;
    });
    it("upgradeState INIT", function () {
      App.set('upgradeState', 'INIT');
      view.set('controller.upgradeVersion', 'HDP-2.2.2');
      view.set('content.displayName', 'HDP-2.2.2');
      view.propertyDidChange('isUpgrading');
      expect(view.get('isUpgrading')).to.be.false;
    });
    it("upgradeState INIT and wrong version", function () {
      App.set('upgradeState', 'INIT');
      view.set('controller.upgradeVersion', 'HDP-2.2.2');
      view.set('content.displayName', 'HDP-2.2.1');
      view.propertyDidChange('isUpgrading');
      expect(view.get('isUpgrading')).to.be.false;
    });
  });

  describe("#installProgress", function () {
    beforeEach(function () {
      sinon.stub(App.db, 'get').returns(1);
      this.mock = sinon.stub(App.router, 'get');
    });
    afterEach(function () {
      App.db.get.restore();
      this.mock.restore();
    });
    it("request absent", function () {
      this.mock.returns([]);
      view.propertyDidChange('installProgress');
      expect(view.get('installProgress')).to.equal(0);
    });
    it("request present", function () {
      this.mock.returns([Em.Object.create({progress: 100})]);
      view.propertyDidChange('installProgress');
      expect(view.get('installProgress')).to.equal(100);
    });
  });

  describe("#versionClass", function () {
    it("status CURRENT", function () {
      view.set('content.status', 'CURRENT');
      view.propertyDidChange('versionClass');
      expect(view.get('versionClass')).to.equal('current-version-box');
    });
    it("status INSTALLED", function () {
      view.set('content.status', 'INSTALLED');
      view.propertyDidChange('versionClass');
      expect(view.get('versionClass')).to.equal('');
    });
  });

  describe("#isOutOfSync", function () {
    it("status OUT_OF_SYNC", function () {
      view.set('content.status', 'OUT_OF_SYNC');
      view.propertyDidChange('isOutOfSync');
      expect(view.get('isOutOfSync')).to.be.true;
    });
  });

  describe("#didInsertElement()", function () {
    beforeEach(function () {
      sinon.stub(App, 'tooltip').returns(1);
    });
    afterEach(function () {
      App.tooltip.restore();
    });
    it("init tooltips", function () {
      view.didInsertElement();
      expect(App.tooltip.callCount).to.equal(3);
    });
  });

  describe("#runAction()", function () {
    beforeEach(function () {
      sinon.stub(view.get('controller'), 'upgrade').returns(1);
    });
    afterEach(function () {
      view.get('controller').upgrade.restore();
    });
    it("action = null", function () {
      view.set('stateElement.action', null);
      view.runAction({context: null});
      expect(view.get('controller').upgrade.called).to.be.false;
    });
    it("action = 'upgrade'", function () {
      view.set('content', 'content');
      view.runAction({context: 'upgrade'});
      expect(view.get('controller').upgrade.calledWith('content')).to.be.true;
    });
    it("action is taken from stateElement", function () {
      view.setProperties({
        'content': 'content',
        'stateElement.action': 'upgrade'
      });
      view.runAction();
      expect(view.get('controller').upgrade.calledWith('content')).to.be.true;
    });
  });

  describe("#editRepositories()", function () {
    beforeEach(function () {
      sinon.stub(App.RepositoryVersion, 'find').returns(Em.Object.create({
        operatingSystems: []
      }));
      sinon.stub(App.ModalPopup, 'show', Em.K);
    });
    afterEach(function () {
      App.RepositoryVersion.find.restore();
      App.ModalPopup.show.restore();
    });
    it("show popup", function () {
      view.editRepositories();
      expect(App.ModalPopup.show.calledOnce).to.be.true;
    });
  });

  describe("#showHosts()", function () {
    beforeEach(function () {
      sinon.spy(App.ModalPopup, 'show');
      sinon.stub(view, 'filterHostsByStack', Em.K);
    });
    afterEach(function () {
      App.ModalPopup.show.restore();
      view.filterHostsByStack.restore();
    });
    it("no hosts", function () {
      view.set('content', Em.Object.create({
        p1: []
      }));
      view.showHosts({contexts: [
        {'property': 'p1'}
      ]});
      expect(App.ModalPopup.show.called).to.be.false;
    });
    it("one host", function () {
      view.set('content', Em.Object.create({
        p1: ['host1'],
        displayName: 'version'
      }));
      var popup = view.showHosts({contexts: [
        {id: 1, 'property': 'p1'}
      ]});
      expect(App.ModalPopup.show.calledOnce).to.be.true;
      popup.onPrimary();
      expect(view.filterHostsByStack.calledWith('version', 1)).to.be.true;
    });
  });

  describe("#filterHostsByStack()", function () {
    var mock = {
      set: Em.K,
      filterByStack: Em.K
    };
    beforeEach(function () {
      sinon.stub(App.router, 'get').withArgs('mainHostController').returns(mock);
      sinon.stub(App.router, 'transitionTo', Em.K);
      sinon.spy(mock, 'set');
      sinon.spy(mock, 'filterByStack');
    });
    afterEach(function () {
      App.router.get.restore();
      App.router.transitionTo.restore();
      mock.set.restore();
      mock.filterByStack.restore();
    });
    it("version and state are valid", function () {
      view.filterHostsByStack('version', 'state');
      expect(mock.set.calledWith('showFilterConditionsFirstLoad', true)).to.be.true;
      expect(mock.filterByStack.calledWith('version', 'state')).to.be.true;
      expect(App.router.transitionTo.calledWith('hosts.index')).to.be.true;
    });
    it("version is null", function () {
      view.filterHostsByStack(null, 'state');
      expect(mock.set.called).to.be.false;
      expect(mock.filterByStack.called).to.be.false;
      expect(App.router.transitionTo.called).to.be.false;
    });
    it("state is null", function () {
      view.filterHostsByStack('version', null);
      expect(mock.set.called).to.be.false;
      expect(mock.filterByStack.called).to.be.false;
      expect(App.router.transitionTo.called).to.be.false;
    });
    it("state and version are null", function () {
      view.filterHostsByStack(null, null);
      expect(mock.set.called).to.be.false;
      expect(mock.filterByStack.called).to.be.false;
      expect(App.router.transitionTo.called).to.be.false;
    });
  });

  describe('stateElement', function () {

    var cases = [
      {
        inputData: {
          'content.status': 'CURRENT'
        },
        expected: {
          status: 'CURRENT',
          isLabel: true,
          text: Em.I18n.t('common.current'),
          class: 'label label-success',
          hasMultipleButtons: false
        },
        title: 'current version'
      },
      {
        inputData: {
          'content.status': 'INIT',
          'controller.requestInProgress': false,
          'parentView.repoVersions': [
            Em.Object.create({
              status: 'INIT'
            })
          ]
        },
        setup: function () {
          this.isAccessibleMock.withArgs('ADMIN').returns(false);
        },
        expected: {
          status: 'INIT',
          isButton: true,
          buttons: [
            {
              text: Em.I18n.t('admin.stackVersions.version.installNow'),
              action: 'installRepoVersionConfirmation'
            }
          ],
          isDisabled: true,
          hasMultipleButtons: false
        },
        title: 'INIT state, no admin access, no requests in progress'
      },
      {
        inputData: {
          'content.status': 'INIT',
          'controller.requestInProgress': true,
          'parentView.repoVersions': [
            Em.Object.create({
              status: 'INIT'
            })
          ]
        },
        setup: function () {
          this.isAccessibleMock.withArgs('ADMIN').returns(false);
        },
        expected: {
          status: 'INIT',
          isButton: true,
          buttons: [
            {
              text: Em.I18n.t('admin.stackVersions.version.installNow'),
              action: 'installRepoVersionConfirmation'
            }
          ],
          isDisabled: true,
          hasMultipleButtons: false
        },
        title: 'INIT state, no admin access, request in progress, not installation'
      },
      {
        inputData: {
          'content.status': 'INSTALL_FAILED',
          'controller.requestInProgress': true,
          'parentView.repoVersions': [
            Em.Object.create({
              status: 'INSTALL_FAILED'
            }),
            Em.Object.create({
              status: 'INSTALLING'
            })
          ]
        },
        setup: function () {
          this.isAccessibleMock.withArgs('ADMIN').returns(false);
        },
        expected: {
          status: 'INSTALL_FAILED',
          isButton: true,
          buttons: [
            {
              text: Em.I18n.t('admin.stackVersions.version.installNow'),
              action: 'installRepoVersionConfirmation'
            }
          ],
          isDisabled: true,
          hasMultipleButtons: false
        },
        title: 'install failed, no admin access, request in progress, another installation running'
      },
      {
        inputData: {
          'content.status': 'INSTALL_FAILED',
          'controller.requestInProgress': false,
          'parentView.repoVersions': [
            Em.Object.create({
              status: 'INSTALL_FAILED'
            }),
            Em.Object.create({
              status: 'INSTALLING'
            })
          ]
        },
        setup: function () {
          this.isAccessibleMock.withArgs('ADMIN').returns(false);
        },
        expected: {
          status: 'INSTALL_FAILED',
          isButton: true,
          buttons: [
            {
              text: Em.I18n.t('admin.stackVersions.version.installNow'),
              action: 'installRepoVersionConfirmation'
            }
          ],
          isDisabled: true,
          hasMultipleButtons: false
        },
        title: 'install failed, no admin access, no requests in progress, another installation running'
      },
      {
        inputData: {
          'content.status': 'OUT_OF_SYNC',
          'controller.requestInProgress': false,
          'parentView.repoVersions': [
            Em.Object.create({
              status: 'OUT_OF_SYNC'
            })
          ]
        },
        setup: function () {
          this.isAccessibleMock.withArgs('ADMIN').returns(true);
        },
        expected: {
          status: 'OUT_OF_SYNC',
          isButton: true,
          buttons: [
            {
              text: Em.I18n.t('admin.stackVersions.version.installNow'),
              action: 'installRepoVersionConfirmation'
            }
          ],
          isDisabled: false,
          hasMultipleButtons: false
        },
        title: 'version out of sync, admin access, no requests in progress, no installation'
      },
      {
        inputData: {
          'content.status': 'OUT_OF_SYNC',
          'controller.requestInProgress': true,
          'parentView.repoVersions': [
            Em.Object.create({
              status: 'OUT_OF_SYNC'
            })
          ]
        },
        setup: function () {
          this.isAccessibleMock.withArgs('ADMIN').returns(true);
        },
        expected: {
          status: 'OUT_OF_SYNC',
          isButton: true,
          buttons: [
            {
              text: Em.I18n.t('admin.stackVersions.version.installNow'),
              action: 'installRepoVersionConfirmation'
            }
          ],
          isDisabled: true,
          hasMultipleButtons: false
        },
        title: 'version out of sync, admin access, request in progress, no installation'
      },
      {
        inputData: {
          'content.status': 'INSTALLED',
          'controller.currentVersion': {
            repository_version: '2.2.1'
          },
          'content.repositoryVersion': '2.2.0',
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.0'
        },
        expected: {
          status: 'INSTALLED',
          isLink: true,
          iconClass: 'icon-ok',
          text: Em.I18n.t('common.installed'),
          action: null,
          hasMultipleButtons: false
        },
        title: 'installed version, earlier than current one'
      },
      {
        inputData: {
          'content.status': 'INSTALLED',
          'controller.requestInProgress': true,
          'parentView.repoVersions': [
            Em.Object.create({
              status: 'INSTALLED'
            }),
            Em.Object.create({
              status: 'INSTALLING'
            })
          ],
          'controller.currentVersion': {
            repository_version: '2.2.0'
          },
          'content.repositoryVersion': '2.2.1',
          'controller.upgradeVersion': 'HDP-2.2.0',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.isAccessibleMock.withArgs('ADMIN').returns(true);
        },
        expected: {
          status: 'INSTALLED',
          isButton: true,
          buttons: [
            {
              text: Em.I18n.t('admin.stackVersions.version.performUpgrade'),
              action: 'confirmUpgrade'
            },
            {
              text: Em.I18n.t('admin.stackVersions.version.reinstall'),
              action: 'installRepoVersionConfirmation'
            }
          ],
          isDisabled: true,
          hasMultipleButtons: true
        },
        title: 'installed version, later than current one, admin access, request in progress, another installation running'
      },
      {
        inputData: {
          'content.status': 'INSTALLED',
          'controller.requestInProgress': false,
          'parentView.repoVersions': [
            Em.Object.create({
              status: 'INSTALLED'
            }),
            Em.Object.create({
              status: 'INSTALLING'
            })
          ],
          'controller.currentVersion': {
            repository_version: '2.2.0'
          },
          'content.repositoryVersion': '2.2.1',
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.0'
        },
        setup: function () {
          this.isAccessibleMock.withArgs('ADMIN').returns(true);
        },
        expected: {
          status: 'INSTALLED',
          isButton: true,
          buttons: [
            {
              text: Em.I18n.t('admin.stackVersions.version.performUpgrade'),
              action: 'confirmUpgrade'
            },
            {
              text: Em.I18n.t('admin.stackVersions.version.reinstall'),
              action: 'installRepoVersionConfirmation'
            }
          ],
          isDisabled: true,
          hasMultipleButtons: true
        },
        title: 'installed version, later than current one, admin access, no requests in progress, another installation running'
      },
      {
        inputData: {
          'content.status': 'INSTALLED',
          'controller.isDowngrade': true,
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.getMock.withArgs('upgradeState').returns(null);
        },
        expected: {
          status: 'INSTALLED',
          isLink: true,
          action: 'openUpgradeDialog',
          iconClass: 'icon-cog',
          text: Em.I18n.t('admin.stackVersions.version.downgrade.running'),
          hasMultipleButtons: false
        },
        title: 'downgrading'
      },
      {
        inputData: {
          'content.status': 'INSTALLED',
          'isUpgrading': true,
          'controller.isDowngrade': false,
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.getMock.withArgs('upgradeState').returns('IN_PROGRESS');
        },
        expected: {
          status: 'INSTALLED',
          isLink: true,
          action: 'openUpgradeDialog',
          iconClass: 'icon-cog',
          text: Em.I18n.t('admin.stackVersions.version.upgrade.running'),
          hasMultipleButtons: false
        },
        title: 'upgrading'
      },
      {
        inputData: {
          'content.status': 'UPGRADING',
          'isUpgrading': true,
          'controller.isDowngrade': false,
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.getMock.withArgs('upgradeState').returns('HOLDING');
        },
        expected: {
          status: 'UPGRADING',
          isLink: true,
          action: 'openUpgradeDialog',
          iconClass: 'icon-pause',
          text: Em.I18n.t('admin.stackVersions.version.upgrade.pause'),
          hasMultipleButtons: false
        },
        title: 'upgrading, holding'
      },
      {
        inputData: {
          'content.status': 'UPGRADING',
          'isUpgrading': true,
          'controller.isDowngrade': false,
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.getMock.withArgs('upgradeState').returns('HOLDING_FAILED');
        },
        expected: {
          status: 'UPGRADING',
          isLink: true,
          action: 'openUpgradeDialog',
          iconClass: 'icon-pause',
          text: Em.I18n.t('admin.stackVersions.version.upgrade.pause'),
          hasMultipleButtons: false
        },
        title: 'upgrading, holding failed'
      },
      {
        inputData: {
          'content.status': 'UPGRADE_FAILED',
          'isUpgrading': true,
          'controller.isDowngrade': false,
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.getMock.withArgs('upgradeState').returns('HOLDING_TIMEDOUT');
        },
        expected: {
          status: 'UPGRADE_FAILED',
          isLink: true,
          action: 'openUpgradeDialog',
          iconClass: 'icon-pause',
          text: Em.I18n.t('admin.stackVersions.version.upgrade.pause'),
          hasMultipleButtons: false
        },
        title: 'upgrade failed, holding finished on timeout'
      },
      {
        inputData: {
          'content.status': 'UPGRADE_FAILED',
          'isUpgrading': true,
          'controller.isDowngrade': true,
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.getMock.withArgs('upgradeState').returns('HOLDING');
        },
        expected: {
          status: 'UPGRADE_FAILED',
          isLink: true,
          action: 'openUpgradeDialog',
          iconClass: 'icon-pause',
          text: Em.I18n.t('admin.stackVersions.version.downgrade.pause'),
          hasMultipleButtons: false
        },
        title: 'downgrading, holding'
      },
      {
        inputData: {
          'content.status': 'UPGRADED',
          'isUpgrading': true,
          'controller.isDowngrade': true,
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.getMock.withArgs('upgradeState').returns('HOLDING_FAILED');
        },
        expected: {
          status: 'UPGRADED',
          isLink: true,
          action: 'openUpgradeDialog',
          iconClass: 'icon-pause',
          text: Em.I18n.t('admin.stackVersions.version.downgrade.pause'),
          hasMultipleButtons: false
        },
        title: 'downgrading, holding failed'
      },
      {
        inputData: {
          'content.status': 'UPGRADED',
          'isUpgrading': true,
          'controller.isDowngrade': true,
          'controller.upgradeVersion': 'HDP-2.2.1',
          'content.displayName': 'HDP-2.2.1'
        },
        setup: function () {
          this.getMock.withArgs('upgradeState').returns('HOLDING_TIMEDOUT');
        },
        expected: {
          status: 'UPGRADED',
          isLink: true,
          action: 'openUpgradeDialog',
          iconClass: 'icon-pause',
          text: Em.I18n.t('admin.stackVersions.version.downgrade.pause'),
          hasMultipleButtons: false
        },
        title: 'downgrading, holding finished on timeout'
      }
    ];

    beforeEach(function () {
      this.getMock = sinon.stub(App, 'get');
      this.isAccessibleMock = sinon.stub(App, 'isAccessible');
    });
    afterEach(function () {
      this.getMock.restore();
      this.isAccessibleMock.restore();
    });

    cases.forEach(function (item) {
      it(item.title, function () {
        if (item.setup) {
          item.setup.call(this);
        }
        view.setProperties(item.inputData);
        var result = view.get('stateElement').getProperties(Em.keys(item.expected));
        if (result.buttons) {
          result.buttons = result.buttons.toArray();
        }
        expect(result).to.eql(item.expected);
      });
    }, this);

  });

});