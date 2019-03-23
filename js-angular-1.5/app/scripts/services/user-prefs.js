'use strict';

(function () {

	function userPrefsFn () {

		return {
		};
	}

	/**
	 * @ngdoc service
	 * @name build1App.userPrefs
	 * @description
	 * # userPrefs
	 * Service in the build1App.
	 */

	angular.module('build1App')
	.factory('UserPrefs', userPrefsFn);

})();
