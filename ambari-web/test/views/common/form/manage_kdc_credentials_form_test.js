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
var credentialUtils = require('utils/credentials');

var view;

describe('#App.ManageCredentialsFormView', function() {
  beforeEach(function() {
    view = App.ManageCredentialsFormView.create({
      parentView: Em.Object.create({})
    });
  });

  afterEach(function() {
    view.destroy();
  });

  describe('#prepareContent', function() {
    [
      {
        isStorePersistent: true,
        credentials: [
          {
            alias: 'kdc.admin.credential',
            type: 'persisted'
          }
        ],
        e: {
          isRemovable: true,
          isRemoveDisabled: false,
          storePersisted: true
        },
        m: 'persistent store is available, previous credentials were stored as persisted. Remove button should be visible and active.'
      },
      {
        isStorePersistent: true,
        credentials: [
          {
            alias: 'kdc.admin.credential',
            type: 'temporary'
          }
        ],
        e: {
          isRemovable: false,
          isRemoveDisabled: true,
          storePersisted: true
        },
        m: 'persistent store is available, previous credentials were stored as temporary. Remove button should be hidden and disabled.'
      }
    ].forEach(function(test) {
      it(test.m, function(done) {
        sinon.stub(credentialUtils, 'credentials', function(clusterName, callback) {
          callback(test.credentials);
        });
        sinon.stub(credentialUtils, 'isStorePersisted', function() {
          return $.Deferred().resolve(test.isStorePersistent).promise();
        });
        view.prepareContent();
        Em.run.next(function() {
          assert.equal(view.get('isRemovable'), test.e.isRemovable, '#isRemovable property validation');
          assert.equal(view.get('isRemoveDisabled'), test.e.isRemoveDisabled, '#isRemoveDisabled property validation');
          assert.equal(view.get('storePersisted'), test.e.storePersisted, '#storePersisted property validation');
          credentialUtils.credentials.restore();
          credentialUtils.isStorePersisted.restore();
          done();
        });
      });
    });
  });

  describe('#isSubmitDisabled', function() {
    it('save button disabled by default', function() {
      expect(view.get('isSubmitDisabled')).to.be.true;
    });
    it('save button disabled when password is empty', function() {
      view.set('principal', 'some_principal');
      expect(view.get('isSubmitDisabled')).to.be.true;
    });
    it('save button disabled when principal is empty', function() {
      view.set('password', 'some_password');
      expect(view.get('isSubmitDisabled')).to.be.true;
    });
    it('save button should be enabled when principal and password are filled', function() {
      view.set('password', 'some_password');
      view.set('principal', 'principal');
      expect(view.get('isSubmitDisabled')).to.be.false;
    });
  });

  describe('#removeKDCCredentials', function() {
    it('should show confirmation popup', function() {
      var popup = view.removeKDCCredentials();
      expect(popup).be.instanceof(App.ModalPopup);
      popup.destroy();
    });
    it('should call credentialUtils#removeCredentials', function() {
      this.clock = sinon.useFakeTimers();
      var popup = view.removeKDCCredentials();
      assert.isFalse(view.get('actionStatus'), '#actionStatus before remove');
      sinon.stub(credentialUtils, 'removeCredentials', function() {
        var dfd = $.Deferred();
        setTimeout(function() {
          dfd.resolve();
        }, 500);
        return dfd.promise();
      });
      popup.onPrimary();
      assert.isTrue(view.get('isActionInProgress'), 'action in progress');
      assert.isTrue(view.get('isRemoveDisabled'), 'remove button disabled');
      assert.isTrue(view.get('isSubmitDisabled'), 'submit button disabled');
      this.clock.tick(1000);
      assert.isFalse(view.get('isActionInProgress'), 'action finished');
      assert.equal(Em.I18n.t('common.success'), view.get('actionStatus'), '#actionStatus after remove');
      assert.isTrue(view.get('parentView.isCredentialsRemoved'), 'parentView#isCredentialsRemoved property should be triggered when remove complete');
      credentialUtils.removeCredentials.restore();
      this.clock.restore();
      popup.destroy();
    });
  });

});
