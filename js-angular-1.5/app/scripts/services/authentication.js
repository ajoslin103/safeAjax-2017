'use strict';

(function () {

  function serviceFn($log, $q, ENV, locker, jwtHelper) {

    function responseInterceptor(action) {
      return function interceptor(response) {
        jwtResponseRecorded(response, 'resourceInterceptor for:' + action);
        return response.resource;
      };
    }


    // function getJWTHeader (action) {
    // 	return function getJWT () {
    // 		// $log.debug('-- $resource adding JWT token for('+action+')');
    // 		return locker.get('jwt','no-token');
    // 	};
    // }

    var interceptors = {
      'get': {
        method: 'GET',
        isArray: false,
        // params: {
        // 	token: getJWTHeader('get')
        // },
        interceptor: {
          response: responseInterceptor('get'),
        }
      },
      'save': {
        method: 'POST',
        isArray: false,
        // params: {
        // 	token: getJWTHeader('save')
        // },
        interceptor: {
          response: responseInterceptor('save'),
        }
      },
      'query': {
        method: 'GET',
        isArray: true,
        // params: {
        // 	token: getJWTHeader('query')
        // },
        interceptor: {
          response: responseInterceptor('query'),
        }
      },
      'remove': {
        method: 'DELETE',
        isArray: false,
        // params: {
        // 	token: getJWTHeader('remove')
        // },
        interceptor: {
          response: responseInterceptor('remove'),
        }
      },
      'delete': {
        method: 'DELETE',
        isArray: false,
        // params: {
        // 	token: getJWTHeader('delete')
        // },
        interceptor: {
          response: responseInterceptor('delete'),
        }
      },
    };

    var tokenPromises = [];

    function processTokenPromises() {
      if (tokenPromises.length > 0) {
        var pending = tokenPromises.shift();
        var gotToken = locker.get('jwt', 'no-token');
        pending.resolve(gotToken);
        $log.debug('resolved tokenPromise for:' + pending.forWho + ' with: ' + gotToken);
      }
    }

    function processQueueConditionally(_howMany) {
      return function processor() {
        if ((_howMany === 1) || (!ENV.JWT_SINGLE_USE)) {
          processTokenPromises();
        }
      };
    }

    function jwtResponseRecorded(response, callerName) {
      var recorded = false, newToken = '';
      if (response[ENV.jwtTokenNameFromLogin]) { // two places to look
        $log.debug('locker.put from resp for:' + callerName);
        newToken = response[ENV.jwtTokenNameFromLogin];
      }
      if (response.headers && response.headers(ENV.receiveJWTviaName)) { // two places to look
        $log.debug('locker.put from head for:' + callerName);
        newToken = response.headers(ENV.receiveJWTviaName);
      }
      if (newToken) {
        $log.debug('decoded:' + JSON.stringify(jwtHelper.decodeToken(newToken)));
        locker.put('jwt', newToken);
        processTokenPromises();
        recorded = true;
      }
      return recorded;
    }

    function jwtTokenGetter(forWho) {
      var tokenRequest = $q.defer();
      tokenRequest.forWho = forWho;
      $log.debug('promised token for: ' + forWho);
      tokenPromises.push(tokenRequest);
      var numPending = tokenPromises.length;
      setTimeout(processQueueConditionally(numPending), 1);
      return tokenRequest.promise;
    }


    // non-blocking

    // function jwtResponseRecorded ( response, tokenName) {
    // 	if (! response[tokenName]) { return false; }
    // 	// $log.debug(jwtHelper.decodeToken(response[tokenName]));
    // 	locker.put('jwt',response[tokenName]);
    // 	return true;
    // }

    // function jwtTokenPromise () {
    // 	return locker.get('jwt','no-token');
    // }

    function getMyName() {
      var decodedToken = jwtHelper.decodeToken(locker.get('jwt', 'no-token'));
      // we had to add this to support the new AdonisJS backend which encapsulates customClaims in .payload.data
      return decodedToken.payload ? decodedToken.payload.data.username : decodedToken.username;
    }

    function getMyEmail() {
      var decodedToken = jwtHelper.decodeToken(locker.get('jwt', 'no-token'));
      // we had to add this to support the new AdonisJS backend which encapsulates customClaims in .payload.data
      return decodedToken.payload ? decodedToken.payload.data.email : decodedToken.email;
    }

    function getMyAccess() {
      var decodedToken = jwtHelper.decodeToken(locker.get('jwt', 'no-token'));
      // we had to add this to support the new AdonisJS backend which encapsulates customClaims in .payload.data
      return decodedToken.payload ? decodedToken.payload.data.access : decodedToken.access;
    }

    function doLogout() {
      locker.put('jwt', 'no-token');
    }

    function hasAccess(needed, promise) {
      try {
        if (getMyAccess() >= needed) {
          return true;
        }
      } catch (err) {
        $log.debug('err testing token', err.toString())
      }
      if (promise) {
        promise.reject('You will need to login again with elevated privs to perform this action.');
      } else {
        $log.warn('You will need to login again with elevated privs to perform this action.');
      }
      return false;
    }

    return {
      // filterResponse: filterResponse,
      // responseFilter: responseFilter,
      // handleUnauthorized: handleUnauthorized,
      responseInterceptors: {},
      jwtResponseRecorded: jwtResponseRecorded,
      jwtTokenGetter: jwtTokenGetter,
      getMyAccess: getMyAccess,
      getMyEmail: getMyEmail,
      getMyName: getMyName,
      doLogout: doLogout,
      hasAccess: hasAccess
    };
  }

  /**
   * @ngdoc service
   * @name build1App.authentication
   * @description
   * # authentication
   * Factory in the build1App.
   */
  angular.module('build1App')
    .service('authentication', serviceFn);

})();
