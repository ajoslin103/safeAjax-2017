'use strict';

(function () {

	/**
	 * @ngdoc function
	 * @name build1App.controller:LoginModalCtrl
	 * @description
	 * # LoginModalCtrl
	 * Controller of the build1App
	 */

  function controllerFn($scope, $element, $log, close, ENV, authentication) {

    $scope.record = {};
    $scope.record.login = {};
    $scope.record.registration = {};

    $scope.setFocus = function () {
      setTimeout(function () {
        switch ($scope.record.what2Show) { // set the focus
          case 'login': {
            $('[ng-model="record.login.usernameOrEmail"]').focus();
            break;
          }
          case 'forgot': {
            $('[ng-model="record.forgot.email"]').focus();
            break;
          }
          case 'register': {
            $('[ng-model="record.registration.username"]').focus();
            break;
          }
        }
      }, 500);
    };

    $scope.record.what2Show = '';

    $scope.showThis = function (_what) {
      $scope.record.what2Show = _what;
      $scope.setFocus();
    };

    $scope.isShowing = function (_what) {
      return ($scope.record.what2Show === _what);
    };

    $scope.showThis('login');
    $scope.setFocus();

    $scope.showResult = function (_msg) {
      $('.attempt-result').text(_msg);
      // set an event to clear this when they start typing again
    };

    $scope.attempt = function () {
      switch ($scope.record.what2Show) {
        case 'login': {
          // attempt login
          $.post(ENV.backend + '/auth/login', {
            username: $scope.record.login.usernameOrEmail,
            password: $scope.record.login.password
          }, function (response) {
            // $log.debug(response);
            delete $scope.record.login.password;
            $scope.record.success = false;
            if (authentication.jwtResponseRecorded(response, 'LoginModalCtrl-login')) {
              $scope.record.success = true;
              $log.debug('login was a success');
              authentication.myEmail = response.email;
              authentication.myName = response.username;
              close($scope.record, 500); // close, but give 500ms for bootstrap to animate
            } else {
              $log.debug('authentication error', response);
              $scope.showResult(response.error || response.message);
            }
          })
            .fail(function (jqXHR, textStatus, errorThrown) {
              // $log.error('jqXHR', jqXHR);
              $log.warn('login errorThrown', errorThrown);
              if (/Unauthorized/.test(errorThrown)) {
                $log.warn('unknown user', jqXHR.responseText || jqXHR.statusText);
                $scope.showResult(jqXHR.responseText || jqXHR.statusText);
              }
            });
          break;
        }
        case 'forgot': {
          // attempt password reset
          $.post(ENV.backend + '/auth/forgot', {
            email: $scope.record.forgot.email,
          }, function (response) {
            $log.debug(response);
            $scope.showResult(response.error || response.message);
          })
            .fail(function (jqXHR, textStatus, errorThrown) {
              // $log.error('jqXHR', jqXHR);
              $log.error('errorThrown', errorThrown);
            });
          break;
        }
        case 'register': {
          // attempt registration
          $.post(ENV.backend + '/auth/create', {
            username: $scope.record.registration.username,
            email: $scope.record.registration.email,
            password: $scope.record.registration.password,
            password_confirmation: $scope.record.registration.confirm
          }, function (response) {
            delete $scope.record.registration.password;
            $log.debug(response);
            if (!authentication.jwtResponseRecorded(response, 'LoginModalCtrl-register')) {
              $scope.showResult(response.error || response.message);
            }
          })
            .fail(function (jqXHR, textStatus, errorThrown) {
              // $log.error('jqXHR', jqXHR);
              $log.error('errorThrown', errorThrown);
            });
          break;
        }
      }
    };

    $scope.close = function (result) {
      close($scope.record, 500); // close, but give 500ms for bootstrap to animate
    };

  }

  angular.module('build1App')
    .controller('LoginModalCtrl', controllerFn);

})();
