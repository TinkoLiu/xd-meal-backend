'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const UserSchema = new Schema({
    username: {
      type: String,
      trim: true,
    },
    psw_salt: {
      type: String,
    },
    password: {
      type: String,
    },
    wework_userid: {
      type: String,
    },
    wechat_corpid: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: Number,
    },
    department: {
      type: String,
    },
    createTime: {
      type: Date,
      default: Date.now,
    },
    updateTime: {
      type: Date,
      default: Date.now,
    },
  }, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' },
  });
  UserSchema.index({ wework_userid: 1, wechat_corpid: 1 }, { unique: true });
  return mongoose.model('User', UserSchema, 'user');
};
