'use strict';
const Service = require('egg').Service;
const HttpError = require('../helper/error');

class WeWorkService extends Service {
  async getAccessToken(corp) {
    const redis = this.ctx.app.redis;
    let token = await redis.get('wework_access_token_' + corp);
    if (!token) {
      token = await this.fetchToken(corp);
    }
    return token;
  }
  async fetchToken(corp) {
    if (!this.config.wework || !this.config.wework.secret || !this.config.wework.secret[corp]) {
      throw new HttpError({
        code: 403,
        msg: '未配置企业微信或请求无效',
      });
    }
    const redis = this.ctx.app.redis;
    const wework = this.config.wework;
    const result = await this.ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + wework.corpID[corp] + '&corpsecret=' + wework.secret[corp]);
    if (result.data.errcode) {
      throw new HttpError({
        code: 403,
        msg: '获取企业微信 Token 失败',
        data: result.data,
      });
    }
    redis.set('wework_access_token_' + corp, result.data.access_token, 'EX', parseInt(result.data.expires_in / 1.2));
    return result.data.access_token;
  }
  async getUserID(code, corp) {
    const accessToken = await this.getAccessToken(corp);
    const result = await this.ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' + accessToken + '&code=' + code);
    if (result.data.errcode) {
      throw new HttpError({
        code: 403,
        msg: '获取企业微信 UserID 失败',
        data: result.data,
      });
    }
    return result.data.UserID;
  }
  async getUserInfo(userid, corp) {
    const accessToken = await this.getAccessToken(corp);
    const result = await this.ctx.curl('https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=' + accessToken + '&userid=' + userid);
    if (result.data.errcode) {
      throw new HttpError({
        code: 403,
        msg: '获取企业微信 UserID 失败',
        data: result.data,
      });
    }
    return result.data;
  }
}

module.exports = WeWorkService;
