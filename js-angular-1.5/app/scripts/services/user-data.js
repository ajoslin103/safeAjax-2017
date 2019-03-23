'use strict';

(function () {

  // access: 1
  // confirmation_code: "ea554b1281a82256fcc8d5a95fece2e5"
  // confirmed: 1
  // created_at: "2015-06-06 21:47:17"
  // creatorId: "New.Registrant"
  // email: "allen.joslin@gmail.com"
  // id: 50
  // password: "$2y$10$bmccS5odWL6dIXZyulNf8.bEQ3ckePTnLuUQ1gTF2bch8RMEu2GHC"
  // remember_token: null
  // updated_at: "2015-06-07 20:34:20"
  // userId: "55736a65524f46.18410239"
  // username: "ajoslin"  

  function factoryFn ($resource, $q, ENV, $log, $http, $rootScope, authentication, singleObjectCache, ModalService, errorHandling ) {

    var UserData = $resource(ENV.backend+'/user/:id', { id: '@id' }, authentication.responseInterceptors);

    // username: define get&set on an editable property of the data object
    Object.defineProperty(UserData.prototype , 'username', { 
      get: function() { return this.data.username; }, // only when unlocked do we allow writes and set dirty 
      set: function(_v) { if (this.isUnlocked) { this.data.username = _v; this.dirty(); } }
    });

    // access: define get&set on an editable property of the data object
    Object.defineProperty(UserData.prototype , 'access', { 
      get: function() { return this.data.access; }, // only when unlocked do we allow writes and set dirty 
      set: function(_v) { if (this.isUnlocked) { this.data.access = _v; this.dirty(); } }
    });

    // email: define get&set on an editable property of the data object
    Object.defineProperty(UserData.prototype , 'email', { 
      get: function() { return this.data.email; }, // only when unlocked do we allow writes and set dirty 
      set: function(_v) { if (this.isUnlocked) { this.data.email = _v; this.dirty(); } }
    });

    // get my id
    UserData.prototype.id = function () {
      return this.data.id;
    };

    // something about this user changed
    UserData.prototype.dirty = function () {
      this.data.lastModified = new Date().toString('yyyy-MM-dd HH:mm:ss');
      this.isDirty = true;
      return this;
    };

    // changes for this user have been saved/discarded
    UserData.prototype.clean = function () {
      this.isDirty = false;
      return this;
    };

    // this user can now be changed
    UserData.prototype.unlock = function () {
      this.isUnlocked = true;
      return this;
    };

    // this user can no longer be changed
    UserData.prototype.lock = function () {
      this.isUnlocked = false;
      return this;
    };

    // save this user
    UserData.prototype.save = function () {
      var _this = this;
      var writer = $q.defer();
      setTimeout(function() {
        writer.id = _this.id();
        writer.notify('locking user:'+_this.id());
        if (! _this.isDirty) {
          _this.lock();
          writer.resolve('user locked');
        } else {
          singleObjectCache.setData({ objectType: 'user', objectName: _this.data.username });
          ModalService.showModal({
            templateUrl: ENV.views+'dirty-object.html',
            controller: 'SimpleModalCtrl'
          }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
              switch(result) {
                case 1: {
                  // update, we will have to use the underlying $http to avoid a conflict between $resource & [laravel] Dingo
                  writer.notify('attempting to update the user: '+_this.id());
                  $http.put(ENV.backend+'/user/'+_this.id(),_this.data)
                    .then(
                      function(response){ 
                        $rootScope.$emit('users.reload'); // will be caught in users-users-list
                        writer.resolve('user: '+_this.id()+' updated');
                      },
                      function(err){
                        errorHandling.handleServerError(err,writer);
                      }
                    );
                  break;
                }
                case 0: {
                  // discard
                  writer.resolve('user: '+_this.id()+' changes discarded'); // it's not an error to discard on purpose
                  break;
                }
                case -1: {
                  // cancel 
                  writer.resolve('user: '+_this.id()+' update operation was cancelled'); // it's not an error to cancel a save
                  break;
                }
              }
            });
          });
        }
      },1);
      return writer.promise;
    };

    // give it up
    return UserData;
  }

  /**
   * @ngdoc service
   * @name build1App.UserData
   * @description
   * # UserData
   * Factory in the build1App.
   */
  angular.module('build1App')
    .factory('UserData', factoryFn);

})();
