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
require('controllers/main/admin/stack_versions/stack_version_details_controller');
var controller;

describe('App.MainStackVersionsDetailsController', function () {

  beforeEach(function () {
    controller = App.MainStackVersionsDetailsController.create({});
  });

  describe('#showProgressPopup', function () {
    beforeEach(function() {
      sinon.stub(App.router.get('highAvailabilityProgressPopupController'), 'initPopup', Em.K);
      App.set('testMode', true);
    });
    afterEach(function() {
      App.router.get('highAvailabilityProgressPopupController').initPopup.restore();
      App.set('testMode', false);
    });
    it("runs initPopup", function() {
      controller.reopen({'content': { 'displayName': "v1"}});
      var popupTitle = Em.I18n.t('admin.stackVersions.details.install.hosts.popup.title').format("v1");
      var requestIds =[1];
      controller.showProgressPopup();
      expect(App.router.get('highAvailabilityProgressPopupController').initPopup.calledWith(popupTitle, requestIds, controller)).to.be.true;
    });
  });

  describe("#doPolling()", function () {
    beforeEach(function () {
      sinon.stub(controller, 'updateProgress', Em.K);
      sinon.spy(controller, 'doPolling');
      this.clock = sinon.useFakeTimers();
    });
    afterEach(function () {
      controller.updateProgress.restore();
      controller.doPolling.restore();
      this.clock.restore();
    });
    it("installInProgress false", function () {
      controller.set('installInProgress', false);
      controller.doPolling();
      expect(controller.updateProgress.calledOnce).to.be.true;
      expect(controller.doPolling.calledOnce).to.be.true;
    });
    it("installInProgress true", function () {
      controller.set('installInProgress', true);
      controller.doPolling();
      this.clock.tick(App.componentsUpdateInterval);
      expect(controller.doPolling.called).to.be.true;
      expect(controller.updateProgress.called).to.be.true;
    });
  });

  describe('#updateProgress', function () {
    beforeEach(function () {
      sinon.stub(App.ajax, 'send', Em.K);
      sinon.stub(App.db, 'get').withArgs('repoVersion','id').returns(1)
    });
    afterEach(function () {
      App.ajax.send.restore();
      App.db.get.restore();
    });
    it("runs get request to get install progress", function () {
      controller.updateProgress();
      expect(App.ajax.send.getCall(0).args[0].data).to.deep.eql({
        requestId: 1
      });
    });
  });

  describe('#updateProgressSuccess', function () {
    it("saves progress state t othe controller", function () {
      controller.updateProgressSuccess({Requests: {progress_percent: 10} , tasks: [{task: 1}]});
      expect(controller.get('progress')).to.equal(10);
      expect(controller.get('logs')).to.eql([{task: 1}])
    });
  });

  describe('#installRepoVersion', function () {
    beforeEach(function () {
      sinon.stub(App.ajax, 'send', Em.K);
    });
    afterEach(function () {
      App.ajax.send.restore();
    });
    it("runs post request to create stack version", function () {
      var repoVersion = Em.Object.create({
        stackVersionType: "HDP",
        stackVersionNumber: "2.2",
        repositoryVersion: "2.2.0.1"
      });
      controller.installRepoVersion({context: repoVersion});
      expect(App.ajax.send.getCall(0).args[0].data.ClusterStackVersions).to.deep.eql({
        "stack": "HDP",
        "version": "2.2",
        "repository_version": "2.2.0.1"
      });
    });
  });

  describe('#installRepoVersionSuccess()', function () {
    var repoId = "1";
    var requestId = "2";
    var repoVersion = {id: repoId};
    var route;
    beforeEach(function() {
      sinon.stub(App.db, 'set', Em.K);
      sinon.stub(App.router, 'transitionTo', Em.K);
      sinon.stub(App.RepositoryVersion, 'find', function() {
        return repoVersion;
      });
      sinon.stub(App.get('router.repoVersionsManagementController'), 'loadStackVersionsToModel', function() {
        return $.Deferred().resolve()});
      route = App.get('router.currentState.name');
    });

    afterEach(function() {
      App.db.set.restore();
      App.router.transitionTo.restore();
      App.RepositoryVersion.find.restore();
      App.get('router.repoVersionsManagementController').loadStackVersionsToModel.restore();
      App.set('router.currentState.name', route);
    });
    it('success callback for install stack version without redirect', function () {
      controller.installRepoVersionSuccess({Requests: {id: requestId}}, null, {id: repoId});
      expect(App.db.set.calledWith('repoVersion', 'id', [requestId])).to.be.true;
      expect(App.get('router.repoVersionsManagementController').loadStackVersionsToModel.calledWith(true)).to.be.true;
      expect(App.RepositoryVersion.find.calledOnce).to.be.true;
      expect(controller.get('content')).to.be.eql(repoVersion);
    });

    it('success callback for install stack version', function () {
      App.set('router.currentState.name', "update");
      controller.installRepoVersionSuccess({Requests: {id: requestId}}, null, {id: repoId});
      expect(App.db.set.calledWith('repoVersion', 'id', [requestId])).to.be.true;
      expect(App.get('router.repoVersionsManagementController').loadStackVersionsToModel.calledOnce).to.be.true;
      expect(App.RepositoryVersion.find.called).to.be.true;
      expect(App.router.transitionTo.calledWith('main.admin.adminStackVersions.version', repoVersion)).to.be.true;
    });
  });

});
