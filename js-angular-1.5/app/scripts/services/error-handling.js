'use strict';

(function () {

	function serviceFn ($log, $q, $state, ENV, ModalService, singleObjectCache, authentication) {

		var inProgress = false;
		function handleUnauthorized (_err,promise){
			if (inProgress) {
				if (promise) {
					promise.notify('authentication already in progress.');
				}
				return;
			}

			inProgress = true;
			ModalService.showModal({
				templateUrl: ENV.views+'unauthorized.html',
				controller: 'LoginModalCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function(result) {
					inProgress = false;
					if (ENV.forceReloadAfterLogin) {
						if (result.success) {
							setTimeout(function(){
								// $log.debug('authentication succeeded: reloading the window via $state.forceReload()');
								$state.forceReload(); // reload the window
								$('.modal-backdrop').remove();
							},500);
						}
					}
				});
			});

		}

		function getMessage (_from) {
			var msg = [];

			if (typeof _from == 'string') {
				msg.push(_from);
			}

			if (_from.statusText) {
				msg.push(_from.statusText);
			}

			if (typeof _from.data == 'string') {
				msg.push(_from.data);
			}

			if (_from.data && _from.data.message) {
				msg.push(_from.data.message);
			}

			if (ENV.fullErrMsgs) {
				if (_from.data && _from.data.error && _from.data.error.message) {
					msg.push(_from.data.error.message);
				}
			}

			if (! msg.length) {
				msg.push('unknown error');
			}

			return msg.join(': ');
		}

		function handleServerError (_err,promise){
			if (/Unauthorized/.test(getMessage(_err)) || /elevated/.test(getMessage(_err))) {
				// promise them a chance to login
				var loginPromise = $q.defer();
				setTimeout(function() {
					handleUnauthorized(_err,loginPromise);
				},1);
				if (promise) { promise.reject('[serverError] '+getMessage(_err)); }
				return ;
			}
			// we used to put up a dialog but the clientError shows all rejections now
			if (promise) { promise.reject('[serverError] '+getMessage(_err)); }
		}

		function handleClientError (promise){
			// if we are not displaying errors
			if (ENV.errors2Console) {
				$log.info( 'stack', $log.buffer() );
				return;
			}
			// ok, throw up a dialog
			singleObjectCache.setData({ errorTitle: 'Error', errorMessage: $log.buffer().join('<br>') });
			ModalService.showModal({
				templateUrl: ENV.views+'error-report.html',
				controller: 'SimpleModalCtrl'
			}).then(function(modal) {
				modal.element.modal();
				modal.close.then(function() {
					if (promise) { promise.resolve(); }
					$log.reset();
				});
			});
		}

		return {
			handleClientError: handleClientError,
			handleServerError: handleServerError,
			extractMessage: getMessage,
		};

	}

	/**
	* @ngdoc service
	* @name build1App.errorHandling
	* @description
	* # errorHandling
	* Factory in the build1App.
	*/
	angular.module('build1App')
	.service('errorHandling', serviceFn);

})();
