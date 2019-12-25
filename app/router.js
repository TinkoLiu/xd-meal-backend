'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.post('/api/user/login', controller.users.login);
  router.post('/api/user/wework', controller.wework.login);
};
