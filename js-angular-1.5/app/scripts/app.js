'use strict';

(function() {

    function routing($stateProvider, $urlRouterProvider, $logProvider, ENV) {

        $logProvider.debugEnabled(ENV.showDebug);

        $urlRouterProvider.otherwise('about');

        $stateProvider

            .state('about', {
            url: '/about',
            templateUrl: ENV.views + 'overview.html',
            controller: 'OverviewCtrl',
            controllerAs: 'vm'
        })

        .state('help', {
            url: '/help',
            templateUrl: ENV.views + 'help.html',
            controller: 'HelpCtrl',
            controllerAs: 'vm'
        })

        .state('ehr', {
            url: '/ehr',
            templateUrl: ENV.views + 'ehr-practice.html',
            controller: 'EHRCtrl',
            controllerAs: 'vm'
        })

        .state('import', {
            url: '/import',
            templateUrl: ENV.views + 'import-export.html',
            controller: 'ImportExportCtrl',
            controllerAs: 'vm'
        })

        .state('booklet', {
            url: '/booklet',
            templateUrl: ENV.views + 'booklets.html',
            controller: 'BookletListCtrl',
            controllerAs: 'vm'
        })

        .state('section', {
            url: '/section',
            templateUrl: ENV.views + 'sections.html',
            controller: 'SectionListCtrl',
            controllerAs: 'vm'
        })

        .state('page', {
            url: '/page',
            templateUrl: ENV.views + 'page-editor.html',
            controller: 'PageEditorCtrl',
            controllerAs: 'controller'
        })

        .state('debug', {
            url: '/debug',
            templateUrl: ENV.views + 'booklet-debug.html',
            controller: 'BookletDebugCtrl',
            controllerAs: 'controller'
        })

        .state('proctor', {
            url: '/proctor?book&test&token',
            templateUrl: ENV.views + 'proctor.html',
            controller: 'ProctorCtrl',
            controllerAs: 'controller',
        })

        .state('run', {
            url: '/run',
            templateUrl: ENV.views + 'run.html',
            controller: 'RunCtrl',
            controllerAs: 'vm',
            resolve: {
                test: ['$stateParams', function($stateParams) { return $stateParams.test; }]
            }
        })

        .state('demo', {
            url: '/demo',
            templateUrl: ENV.views + 'demo.html',
            controller: 'DemoCtrl',
            controllerAs: 'vm',
            resolve: {
                test: ['$stateParams', function($stateParams) { return $stateParams.test; }]
            }
        })

        .state('source', {
            url: '/source',
            templateUrl: ENV.views + 'sources.html',
            controller: 'SourceListCtrl',
            controllerAs: 'vm',
        })

        .state('branch', {
            url: '/branch',
            templateUrl: ENV.views + 'branches.html',
            controller: 'BranchListCtrl',
            controllerAs: 'vm'
        })

        .state('user', {
            url: '/user',
            templateUrl: ENV.views + 'users.html',
            controller: 'UserListCtrl',
            controllerAs: 'vm'
        });
    }

    function angularJwt($httpProvider, jwtInterceptorProvider, $provide, ENV) {

        if (ENV.sendJWTviaUrl) {
            // "if you are behind an uncooperative apache then you can send the jwt as an url param -- angular-jwt"
            jwtInterceptorProvider.urlParam = ENV.sendJWTviaName; // (some configs of apache will strip a jwt header)
        }

        // get the jwt we have stored, we need to give this to only one requestor at a time, as we could be getting a new one with each request
        jwtInterceptorProvider.tokenGetter = ['config', 'authentication', 'ENV', function(config, authentication, ENV) {
            // only if requesting a protected resource from the backend
            if (new RegExp(ENV.backend).test(config.url)) {
                var jwtToken = authentication.jwtTokenGetter(config.url);
                return jwtToken; // then return a token promise
            }
        }];

        $httpProvider.interceptors.push('jwtInterceptor');

        $provide.factory('responseInterceptor', ['authentication', function(authentication) {
            return {
                response: function(resp) {
                    var wasRecorded = authentication.jwtResponseRecorded(resp, 'app responseInterceptor');
                    return resp;
                }
            };
        }]);

        $httpProvider.interceptors.push('responseInterceptor');
    }

    function setupLogout($rootScope, $state, authentication) {
        $rootScope.doLogout = function() {
            authentication.doLogout();
            $state.go('about');
        };
    }

    function appStartup(actionIcons, $log, $rootScope, $state) {

        function appLog(tag, msg) {
            switch (tag) {
                case 'warn':
                    {
                        $log.warn(msg);
                        break;
                    }
                case 'error':
                    {
                        $log.error(msg);
                        break;
                    }
                case 'debug':
                    {
                        $log.debug(msg);
                        break;
                    }
                default:
                    {
                        $log.info(msg);
                        break;
                    }
            }
        }

        actionIcons.registerLogResultFn(appLog);
    }

    /**
     * @ngdoc overview
     * @name build1App
     * @description
     * # build1App
     *
     * Main module of the application.
     */
    angular
        .module('build1App', [
            'ngCookies',
            'ngMessages',
            'ngResource',
            'ngSanitize',
            'ngTouch',
            'cgBusy',
            'config',
            'datatables',
            'datatables.scroller',
            'datatables.bootstrap',
            'angularActionIcons',
            'angularModalService',
            'base64',
            'angular-locker',
            'angular-jwt',
            'EditingFrameService',
            'D3ChartingService',
            'ui.router',
            'osk-support',
            'angular.css.injector',
            'StyleBookSupport',
            'ngDropzone',
            'akoenig.deckgrid'
        ])
        .config(routing)
        .config(angularJwt)
        .run(appStartup)
        .run(setupLogout)

    // .directive('stopEvent', function () {
    // 	return {
    // 		restrict: 'A',
    // 		link: function (scope, element, attr) {
    // 			element.on(attr.stopEvent, function (e) {
    // 				e.stopPropagation();
    // 			});
    // 		}
    // 	};
    // })
    ;

    // note: the module fp is defined in the file functional_programming.js

})();