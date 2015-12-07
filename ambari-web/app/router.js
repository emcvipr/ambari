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

var misc = require('utils/misc');
var App = require('app');

App.WizardRoute = Em.Route.extend({

  gotoStep0: Em.Router.transitionTo('step0'),

  gotoStep1: Em.Router.transitionTo('step1'),

  gotoStep2: Em.Router.transitionTo('step2'),

  gotoStep3: Em.Router.transitionTo('step3'),

  gotoStep4: Em.Router.transitionTo('step4'),

  gotoStep5: Em.Router.transitionTo('step5'),

  gotoStep6: Em.Router.transitionTo('step6'),

  gotoStep7: Em.Router.transitionTo('step7'),

  gotoStep8: Em.Router.transitionTo('step8'),

  gotoStep9: Em.Router.transitionTo('step9'),

  gotoStep10: Em.Router.transitionTo('step10'),

  isRoutable: function() {
    return (typeof this.get('route') === 'string' && App.router.get('loggedIn'));
  }.property('App.router.loggedIn')

});

App.Router = Em.Router.extend({

  enableLogging: true,
  isFwdNavigation: true,
  backBtnForHigherStep: false,
  transitionInProgress: false,

  /**
   * Path for local login page. This page will be always accessible without
   * redirect to auth server different from ambari-server. Used in some types of
   * authorizations like knox sso.
   *
   * @type {string}
   */
  localUserAuthUrl: '/login/local',

  /**
   * LocalStorage property <code>redirectsCount</code> from <code>tmp</code> namespace
   * will be incremented by each redirect action performed by UI and reset on success login.
   * <code>redirectsLimitCount</code> determines maximum redirect tries. When redirects count overflow
   * then something goes wrong and we have to inform user about the problem.
   *
   * @type {number}
   */
  redirectsLimitCount: 0,

  /**
   * Is true, if cluster.provisioning_state is equal to 'INSTALLED'
   * @type {Boolean}
   */
  clusterInstallCompleted: false,
  /**
   * user prefered path to route
   */
  preferedPath: null,

  setNavigationFlow: function (step) {
    var matches = step.match(/\d+$/);
    var newStep;
    if (matches) {
      newStep = parseInt(matches[0]);
    }
    var previousStep = parseInt(this.getInstallerCurrentStep());
    this.set('isFwdNavigation', newStep >= previousStep);
  },


  clearAllSteps: function () {
    this.get('installerController').clear();
    this.get('addHostController').clear();
    this.get('addServiceController').clear();
    this.get('backgroundOperationsController').clear();
    for (var i = 1; i < 11; i++) {
      this.set('wizardStep' + i + 'Controller.hasSubmitted', false);
      this.set('wizardStep' + i + 'Controller.isDisabled', true);
    }
  },

  /**
   * Temporary fix for getting cluster name
   * @return {*}
   */

  getClusterName: function () {
    return App.router.get('clusterController').get('clusterName');
  },


  /**
   * Get current step of Installer wizard
   * @return {*}
   */
  getInstallerCurrentStep: function () {
    return this.getWizardCurrentStep('installer');
  },

  /**
   * Get current step for <code>wizardType</code> wizard
   * @param wizardType one of <code>installer</code>, <code>addHost</code>, <code>addServices</code>
   */
  getWizardCurrentStep: function (wizardType) {
    var currentStep = App.db.getWizardCurrentStep(wizardType);
    if (!currentStep) {
      currentStep = wizardType === 'installer' ? '0' : '1';
    }
    return currentStep;
  },

  /**
   * @type {boolean}
   */
  loggedIn: App.db.getAuthenticated(),

  loginName: function() {
    return this.getLoginName();
  }.property('loggedIn'),

  getAuthenticated: function () {
    var dfd = $.Deferred();
    var self = this;
    var auth = App.db.getAuthenticated();
    App.ajax.send({
      name: 'router.login.clusters',
      sender: this,
      success: 'onAuthenticationSuccess',
      error: 'onAuthenticationError'
    }).complete(function (xhr) {
      if (xhr.isResolved()) {
        // if server knows the user and user authenticated by UI
        if (auth) {
          dfd.resolve(self.get('loggedIn'));
          // if server knows the user but UI don't, check the response header
          // and try to authorize
        } else if (xhr.getResponseHeader('User')) {
          var user = xhr.getResponseHeader('User');
          App.ajax.send({
            name: 'router.login',
            sender: self,
            data: {
              usr: user,
              loginName: encodeURIComponent(user)
            },
            success: 'loginSuccessCallback',
            error: 'loginErrorCallback'
          });
        } else {
          self.setAuthenticated(false);
          dfd.resolve(false);
        }
      } else {
        //if provisioning state unreachable then consider user as unauthenticated
        self.setAuthenticated(false);
        dfd.resolve(false);
      }
    });
    return dfd.promise();
  },

  /**
   * Response for <code>/clusters?fields=Clusters/provisioning_state</code>
   * @type {null|object}
   */
  clusterData: null,

  onAuthenticationSuccess: function (data) {
    if (App.db.getAuthenticated() === true) {
      this.set('clusterData', data);
      this.setAuthenticated(true);
      if (data.items.length) {
        this.setClusterInstalled(data);
      }
    }
  },

  /**

   * If authentication failed, need to check for jwt auth url
   * and redirect user if current location is not <code>localUserAuthUrl</code>
   *
   * @param {?object} data
   */
  onAuthenticationError: function (data) {
    if (data.status === 403) {
      try {
        var responseJson = JSON.parse(data.responseText);
        if (responseJson.jwtProviderUrl && this.get('location.lastSetURL') !== this.get('localUserAuthUrl')) {
          this.redirectByURL(responseJson.jwtProviderUrl + encodeURIComponent(this.getCurrentLocationUrl()));
        }
      } catch (e) {
      } finally {
        this.setAuthenticated(false);
      }
    } else if (data.status >= 500) {
      this.setAuthenticated(false);
      this.loginErrorCallback(data);
    }
  },

  setAuthenticated: function (authenticated) {
    App.db.setAuthenticated(authenticated);
    this.set('loggedIn', authenticated);
  },

  getLoginName: function () {
    return App.db.getLoginName();
  },

  setLoginName: function (loginName) {
    App.db.setLoginName(loginName);
  },

  /**
   * Set user model to local storage
   * @param user
   */
  setUser: function (user) {
    App.db.setUser(user);
  },

  /**
   * Get user model from local storage
   * @return {*}
   */
  getUser: function () {
    return App.db.getUser();
  },

  setUserLoggedIn: function(userName) {
    this.setAuthenticated(true);
    this.setLoginName(userName);
    this.setUser(App.User.find().findProperty('id', userName));
    App.db.set('tmp', 'redirectsCount', 0);
  },

  /**
   * Set `clusterInstallCompleted` property based on cluster info response.
   *
   * @param {Object} clusterObject
   **/
  setClusterInstalled: function(clusterObject) {
    this.set('clusterInstallCompleted', clusterObject.items[0].Clusters.provisioning_state === 'INSTALLED')
  },

  login: function () {
    var controller = this.get('loginController');
    var loginName = controller.get('loginName');
    controller.set('loginName', loginName);
    var hash = misc.utf8ToB64(loginName + ":" + controller.get('password'));
    var usr = '';

    if (App.get('testMode')) {
      if (loginName === "admin" && controller.get('password') === 'admin') {
        usr = 'admin';
      } else if (loginName === 'user' && controller.get('password') === 'user') {
        usr = 'user';
      }
    }

    App.ajax.send({
      name: 'router.login',
      sender: this,
      data: {
        auth: "Basic " + hash,
        usr: usr,
        loginName: encodeURIComponent(loginName)
      },
      beforeSend: 'authBeforeSend',
      success: 'loginSuccessCallback',
      error: 'loginErrorCallback'
    });

  },

  authBeforeSend: function(opt, xhr, data) {
    xhr.setRequestHeader("Authorization", data.auth);
  },

  loginSuccessCallback: function(data, opt, params) {
    var self = this;
    App.router.set('loginController.isSubmitDisabled', false);
    App.usersMapper.map({"items": [data]});
    this.setUserLoggedIn(decodeURIComponent(params.loginName));
    var requestData = {
      loginName: params.loginName,
      loginData: data
    };
    App.router.get('clusterController').loadAuthorizations().complete(function() {
      // no need to load cluster data if it's already loaded
      if (self.get('clusterData')) {
        self.loginGetClustersSuccessCallback(self.get('clusterData'), {}, requestData);
      }
      else {
        App.ajax.send({
          name: 'router.login.clusters',
          sender: self,
          data: requestData,
          success: 'loginGetClustersSuccessCallback'
        });
      }
    });
  },

  loginErrorCallback: function(request) {
    var controller = this.get('loginController');
    this.setAuthenticated(false);
    if (request.status > 400) {
      var responseMessage = request.responseText;
      try{
        responseMessage = JSON.parse(request.responseText).message;
      }catch(e){}
    }
    if (request.status == 403) {
      controller.postLogin(true, false, responseMessage);
    } else if (request.status == 500) {
      controller.postLogin(false, false, responseMessage);
    } else {
      controller.postLogin(false, false, null);
    }

  },

  /**
   * success callback of login request
   * @param {object} clustersData
   * @param {object} opt
   * @param {object} params
   */
  loginGetClustersSuccessCallback: function (clustersData, opt, params) {
    var privileges = params.loginData.privileges || [];
    var router = this;
    var isAdmin = privileges.mapProperty('PrivilegeInfo.permission_name').contains('AMBARI.ADMINISTRATOR');

    App.set('isAdmin', isAdmin);

    if (clustersData.items.length) {
      var clusterPermissions = privileges.
        filterProperty('PrivilegeInfo.cluster_name', clustersData.items[0].Clusters.cluster_name).
        mapProperty('PrivilegeInfo.permission_name');

      //cluster installed
      router.setClusterInstalled(clustersData);
      if (clusterPermissions.contains('CLUSTER.ADMINISTRATOR')) {
        App.setProperties({
          isAdmin: true,
          isOperator: true
        });
      }
      if (isAdmin || clusterPermissions.contains('CLUSTER.USER') || clusterPermissions.contains('CLUSTER.ADMINISTRATOR')) {
        router.transitionToApp();
      } else {
        router.transitionToViews();
      }
    } else {
      if (isAdmin) {
        router.transitionToAdminView();
      } else {
        router.transitionToViews();
      }
    }
    App.set('isPermissionDataLoaded', true);
    App.router.get('userSettingsController').dataLoading();
  },

  /**
   * redirect user to Admin View
   * @returns {$.ajax}
   */
  transitionToAdminView: function() {
    return App.ajax.send({
      name: 'ambari.service.load_server_version',
      sender: this,
      success: 'adminViewInfoSuccessCallback',
      error: 'adminViewInfoErrorCallback'
    });
  },

  /**
   * redirect user to application Dashboard
   */
  transitionToApp: function () {
    var router = this;
    if (!router.restorePreferedPath()) {
      router.getSection(function (route) {
        router.transitionTo(route);
      });
    }
  },

  /**
   * redirect user to application Views
   */
  transitionToViews: function() {
    App.router.get('mainViewsController').loadAmbariViews();
    this.transitionTo('main.views.index');
  },

  adminViewInfoSuccessCallback: function(data) {
    var components = Em.get(data,'components');
    if (Em.isArray(components)) {
      var mappedVersions = components.map(function(component) {
          if (Em.get(component, 'RootServiceComponents.component_version')) {
            return Em.get(component, 'RootServiceComponents.component_version');
          }
        }),
        sortedMappedVersions = mappedVersions.sort(),
        latestVersion = sortedMappedVersions[sortedMappedVersions.length-1];
      window.location.replace('/views/ADMIN_VIEW/' + latestVersion + '/INSTANCE/#/');
    }
  },

  adminViewInfoErrorCallback: function() {
    this.transitionToViews();
  },

  getSection: function (callback) {
    if (App.get('testMode')) {
      if (App.alwaysGoToInstaller) {
        callback('installer');
      } else {
        callback('main.dashboard.index');
      }
    } else {
      if (this.get('clusterInstallCompleted')) {
        App.router.get('wizardWatcherController').getUser().complete(function() {
          App.clusterStatus.updateFromServer(false).complete(function () {
            var route = 'main.dashboard.index';
            var clusterStatusOnServer = App.clusterStatus.get('value');
            if (clusterStatusOnServer) {
              var wizardControllerRoutes = require('data/controller_route');
              var wizardControllerRoute =  wizardControllerRoutes.findProperty('wizardControllerName', clusterStatusOnServer.wizardControllerName);
              if (wizardControllerRoute && !App.router.get('wizardWatcherController').get('isNonWizardUser')) {
                route = wizardControllerRoute.route;
              }
            }
            if (wizardControllerRoute && wizardControllerRoute.wizardControllerName === 'mainAdminStackAndUpgradeController')  {
              var clusterController =   App.router.get('clusterController');
              clusterController.loadClusterName().done(function(){
                clusterController.restoreUpgradeState().done(function(){
                  callback(route);
                });
              });
            } else {
              callback(route);
            }
          });
        });
      } else {
        callback('installer');
      }
    }
  },

  logOff: function (context) {
    var self = this;

    $('title').text(Em.I18n.t('app.name'));
    App.router.get('mainController').stopPolling();
    // App.db.cleanUp() must be called before router.clearAllSteps().
    // otherwise, this.set('installerController.currentStep, 0) would have no effect
    // since it's a computed property but we are not setting it as a dependent of App.db.
    App.db.cleanUp();
    App.setProperties({
      isAdmin: false,
      auth: null,
      isOperator: false,
      isPermissionDataLoaded: false
    });
    this.set('loggedIn', false);
    this.clearAllSteps();
    this.set('loginController.loginName', '');
    this.set('loginController.password', '');
    // When logOff is called by Sign Out button, context contains event object. As it is only case we should send logoff request, we are checking context below.
    if (!App.get('testMode') && context) {
      App.ajax.send({
        name: 'router.logoff',
        sender: this,
        success: 'logOffSuccessCallback',
        error: 'logOffErrorCallback'
      }).complete(function() {
        self.logoffRedirect(context);
      });
    } else {
      this.logoffRedirect();
    }
  },

  logOffSuccessCallback: function () {
    var applicationController = App.router.get('applicationController');
    applicationController.set('isPollerRunning', false);
  },

  logOffErrorCallback: function () {

  },

  /**
   * Redirect function on sign off request.
   *
   * @param {$.Event} [context=undefined] - triggered event context
   */
  logoffRedirect: function(context) {
    if (App.router.get('clusterController.isLoaded')) {
      window.location.reload();
    } else {
      this.transitionTo('login', context);
    }
  },

  /**
   * save prefered path
   * @param {string} path
   * @param {string} key
   */
  savePreferedPath: function(path, key) {
    if (key) {
      if (path.contains(key)) {
        this.set('preferedPath', path.slice(path.indexOf(key) + key.length));
      }
    } else {
      this.set('preferedPath', path);
    }
  },

  /**
   * If path exist route to it, otherwise return false
   * @returns {boolean}
   */
  restorePreferedPath: function() {
    var preferredPath = this.get('preferedPath');
    var isRestored = false;

    if (preferredPath) {
      // If the preferred path is relative, allow a redirect to it.
      // If the path is not relative, silently ignore it - if the path is an absolute URL, the user
      // may be routed to a different server where the possibility exists for a phishing attack.
      if ((preferredPath.startsWith('/') || preferredPath.startsWith('#')) && !preferredPath.contains('#/login')) {
        window.location = preferredPath;
        isRestored = true;
      }
      // Unset preferedPath
      this.set('preferedPath', null);
    }

    return isRestored;
  },

  /**
   * initialize isAdmin if user is administrator
   */
  initAdmin: function(){
    if (App.db) {
      var user = App.db.getUser();
      if (user) {
        if (user.admin) {
          App.set('isAdmin', true);
        }
        if (user.operator) {
          App.set('isOperator', true);
        }
        App.set('isPermissionDataLoaded', true);
      }
    }
  },

  /**
   * initialize Auth for user
   */
  initAuth: function(){
    if (App.db) {
      var auth = App.db.getAuth();
      if(auth)
        App.set('auth', auth);
    }
  },

  /**
   * Increment redirect count if <code>redirected</code> parameter passed.
   */
  handleUIRedirect: function() {
    if (/(\?|&)redirected=/.test(location.hash)) {
      var redirectsCount = App.db.get('tmp', 'redirectsCount') || 0;
      App.db.set('tmp', 'redirectsCount', ++redirectsCount);
    }
  },

  /**
   * <code>window.location</code> setter. Will add query param which determines that we redirect user
   * @param {string} url - url to navigate
   */
  redirectByURL: function(url) {
    var suffix = "?redirected=true";
    var redirectsCount = App.db.get('tmp', 'redirectsCount') || 0;
    if (redirectsCount > this.get('redirectsLimitCount')) {
      this.showRedirectIssue();
      return;
    }
    // skip adding redirected parameter if added
    if (/(\?|&)redirected=/.test(location.hash)) {
      this.setLocationUrl(url);
      return;
    }
    // detect if query params were assigned and replace "?" with "&" for suffix param
    if (/\?\w+=/.test(location.hash)) {
      suffix = suffix.replace('?', '&');
    }
    this.setLocationUrl(url + suffix);
  },

  /**
   * Convenient method to set <code>window.location</code>.
   * Useful for faking url manipulation in tests.
   *
   * @param {string} url
   */
  setLocationUrl: function(url) {
    window.location = url;
  },

  /**
   * Convenient method to get current <code>window.location</code>.
   * Useful for faking url manipulation in tests.
   */
  getCurrentLocationUrl: function() {
    return window.location.href;
  },

  /**
   * Inform user about redirect issue in modal popup.
   *
   * @returns {App.ModalPopup}
   */
  showRedirectIssue: function() {
    var bodyMessage = Em.I18n.t('app.redirectIssuePopup.body').format(location.origin + '/#' + this.get('localUserAuthUrl'));
    var popupHeader = Em.I18n.t('app.redirectIssuePopup.header');
    var popup = App.showAlertPopup(popupHeader, bodyMessage);
    popup.set('encodeBody', false);
    return popup;
  },

  root: Em.Route.extend({
    index: Em.Route.extend({
      route: '/',
      redirectsTo: 'login'
    }),

    enter: function(router){
      router.initAdmin();
      router.initAuth();
      router.handleUIRedirect();
    },

    login: Em.Route.extend({
      route: '/login:suffix',

      /**
       *  If the user is already logged in, redirect to where the user was previously
       */
      enter: function (router, context) {
        var location = router.location.location.hash;
        router.getAuthenticated().done(function (loggedIn) {
          if (loggedIn) {
            Ember.run.next(function () {
              router.getSection(function (route) {
                router.transitionTo(route, context);
              });
            });
          } else {
            //key to parse URI for prefered path to route
            router.savePreferedPath(location, '?targetURI=');
          }
        });
      },

      connectOutlets: function (router, context) {
        $('title').text(Em.I18n.t('app.name'));
        router.get('applicationController').connectOutlet('login');
      },

      serialize: function(router, context) {
        // check for login/local hash
        var location = router.get('location.location.hash');
        return {
          suffix: location === '#' + router.get('localUserAuthUrl') ? '/local' : ''
        };
      }
    }),

    installer: require('routes/installer'),

    main: require('routes/main'),

    adminView: Em.Route.extend({
      route: '/adminView',
      enter: function (router) {
        if (!router.get('loggedIn') || !App.isAuthorized('CLUSTER.UPGRADE_DOWNGRADE_STACK')) {
          Em.run.next(function () {
            router.transitionTo('login');
          });
        } else {
          App.ajax.send({
            name: 'ambari.service.load_server_version',
            sender: router,
            success: 'adminViewInfoSuccessCallback'
          });
        }
      }
    }),

    experimental: Em.Route.extend({
      route: '/experimental',
      enter: function (router, context) {
        if (App.isAuthorized('CLUSTER.UPGRADE_DOWNGRADE_STACK')) {
          Em.run.next(function () {
            if (router.get('clusterInstallCompleted')) {
              router.transitionTo("main.dashboard.widgets");
            } else {
              router.route("installer");
            }
          });
        } else if (!App.isAuthorized('CLUSTER.UPGRADE_DOWNGRADE_STACK')) {
          Em.run.next(function () {
            router.transitionTo("main.views.index");
          });
        }
      },
      connectOutlets: function (router, context) {
        if (App.isAuthorized('CLUSTER.UPGRADE_DOWNGRADE_STACK')) {
          App.router.get('experimentalController').loadSupports().complete(function () {
            $('title').text(Em.I18n.t('app.name.subtitle.experimental'));
            router.get('applicationController').connectOutlet('experimental');
          });
        }
      }
    }),

    logoff: function (router, context) {
      router.logOff(context);
    }

  })
});
