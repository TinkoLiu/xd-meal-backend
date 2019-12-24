'use strict';

const Controller = require('egg').Controller;
const filterParams = require('../helper/filter');

const createRule = {
  username: 'string',
  password: 'string',
  email: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  role: { type: 'enum', values: [ 0, 1, 2 ], required: false },
  department: { type: 'string', required: false },
};

const editRule = createRule;

const loginRule = {
  email: 'string',
  password: 'string',
};

class UsersController extends Controller {
  async login() {
    const ctx = this.ctx;
    const app = ctx.app;
    const option = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    };
    const userService = ctx.service.users;
    const params = filterParams(ctx.request.body, createRule);
    ctx.validate(loginRule, params);
    await userService.checkLogin(params);

    const token = app.jwt.sign(option, app.config.jwt.secret);
    this.ctx.body = { token };
  }
  async index() {
    const ctx = this.ctx;
    ctx.body = await ctx.service.users.list();
  }
  //
  async create() {
    const ctx = this.ctx;
    const userService = ctx.service.users;
    const params = filterParams(ctx.request.body, createRule);
    ctx.validate(createRule, params);
    ctx.body = await userService.create(params);
  }
  //
  // async show(){
  //
  // }
  //
  async edit() {
    const ctx = this.ctx;
    // const userService = ctx.service.users;
    ctx.validate(editRule);
    const params = filterParams(ctx.request.body, createRule);
    ctx.body = await ctx.service.users.update(ctx.request.body);
  }
  //
  // async update() {
  //
  // }
  //
  // async destroy() {
  //
  // }
}

module.exports = UsersController;
