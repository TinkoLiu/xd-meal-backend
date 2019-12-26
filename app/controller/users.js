'use strict';
const HttpError = require('../helper/error');
const Controller = require('egg').Controller;
const filterParams = require('../helper/filter');

const createRule = {
  username: 'string',
  password: { type: 'string', required: false },
  psw_salt: { type: 'string', required: false },
  email: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  role: { type: 'enum', values: [ 0, 1, 2 ], required: true },
  department: { type: 'string', required: true },
};

const loginRule = {
  email: 'string',
  password: 'string',
};

const weworkRule = {
  corp: 'string',
  code: 'string',
};

class UsersController extends Controller {
  async login() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    if (userService.isLoggedIn()) {
      throw new HttpError({
        code: 403,
        msg: '已登录',
      });
    }
    const params = filterParams(ctx.request.body, createRule);
    ctx.validate(loginRule, params);
    const user = await userService.passwordLogin(params);
    if (!user) {
      throw new HttpError({
        code: 403,
        msg: '用户名或密码无效',
      });
    }
    ctx.session.user = user;
    ctx.body = { code: 0, msg: '登录成功' };
  }

  async logout() {
    const ctx = this.ctx;
    if (ctx.session.user) {
      ctx.session.user = undefined;
      ctx.body = { code: 0, msg: '登出成功' };
    } else {
      throw new HttpError({
        code: 403,
        msg: '尚未登录',
      });
    }
  }

  async wework() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    const weworkService = ctx.service.wework;
    const config = ctx.app.config;
    let user = null;
    if (userService.isLoggedIn()) {
      throw new HttpError({
        code: 403,
        msg: '已登录',
      });
    }
    const params = filterParams(ctx.request.body, weworkRule);
    if (!config.wework || !config.wework.secret || !config.wework.secret[params.corp]) {
      throw new HttpError({
        code: 403,
        msg: '未配置企业微信或请求无效',
      });
    }
    const userid = weworkService.getUserID(params.code, params.corp);
    user = await userService.weworkLogin(userid, params.corp);
    if (!user) {
      const weworkUserInfo = await weworkService.getUserInfo(userid, params.corp);
      user = await userService.weworkCreate(weworkUserInfo, params.corp);
    }
    ctx.session.user = user;
    ctx.body = {
      code: 200,
      msg: '登录成功',
    };
  }
}

module.exports = UsersController;
