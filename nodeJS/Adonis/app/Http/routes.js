'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route')

// Route.on('/').render('welcome') // don't lift our skirts

Route.get('run/available/:testCode', 'TestRunsController.validTestCode');
Route.get('run/:testCode', 'TestRunsController.getProctorToken');

Route.get('demo/available/:testCode', 'TestRunsController.validDemoCode');
Route.get('demo/:testCode', 'TestRunsController.getDemoToken');

Route.get('image/page/:pageId', 'ImagingController.image_page'); // from page editor

Route.get('users/confirm/:code', 'AuthenticationController.confirm');
// Route.get('confirm-success', function() { return View.make('confirm-success'); });
// Route.get('confirm-failure', function() { return View.make('confirm-failure'); });

Route.get('users/reset_password/:token', 'AuthenticationController.resetForm');
Route.post('users/reset_password', 'AuthenticationController.reset');
// Route.get('reset-success', function() { return View.make('reset-success'); });

Route.group('api', function() {

    Route.post('auth/login', 'AuthenticationController.login')
    Route.get('auth/logout', 'AuthenticationController.logout');
    Route.post('auth/create', 'AuthenticationController.store');
    Route.post('auth/forgot', 'AuthenticationController.forgot');

}).prefix('api')

Route.group('protected api', function() {

    Route.resource('booklet', 'BookletsController')

    Route.resource('stylebook', 'StyleBookController')
    Route.post('stylebook/styles', 'StyleBookController.putStyles')
    Route.get('stylebook/style/:id', 'StyleBookController.getStyles')

    Route.resource('bundle', 'BundlesController');
    Route.get('bundle/download/:id', 'BundlesController.download');

    Route.resource('section', 'SectionsController');

    Route.resource('choice', 'ChoicesController')
    Route.get('choice/:bookletId/:sectionId', 'ChoicesController.select')

    Route.resource('branch', 'BranchesController')

    Route.resource('theme', 'ThemesController')

    Route.resource('source', 'SourcesController')
    Route.get('source/external/:id', 'SourcesController.dataset')

    Route.resource('page', 'PagesController');
    Route.get('page/:id/copy/:newName', 'PagesController.copy');
    Route.get('page/:id/booklets', 'PagesController.findBooks');

    Route.resource('user', 'LoginController')

    Route.resource('test', 'TestRunsController');
    Route.post('test/page', 'TestRunsController.store_page');
    Route.put('test/:testId/page/:pageNdx', 'TestRunsController.update_page');
    Route.get('test/:testId/finished', 'TestRunsController.finished');
    Route.get('test/:testId/demo-ize', 'TestRunsController.demo_izeRun');

    Route.get('image/test/:testId', 'ImagingController.image_test'); // from proctoring pane
    Route.get('image/script/:scriptId', 'ImagingController.image_script'); // from debug pane

    Route.resource('dataset', 'TestDatasetController');
    Route.get('dataset/script/:scriptId', 'TestDatasetController.show_by_script');
    // Route.post('dataset/datums/:testId', 'TestDatasetController.update_datums');

}).prefix('api').middleware('auth:jwt')