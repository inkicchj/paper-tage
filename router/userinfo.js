const express = require('express')

// 个人信息路由模块
const userInfoRouter = express.Router()


// 导入获取个人信息处理函数
const getuser = require("../router_handler/userinfo")

// 查看个人信息
userInfoRouter.post('/info', getuser.getUserInfo)

// 验证用户更新的信息
const { user_update_schema, user_reset_password_schemia, user_set_avatar_schema } = require("../schemas/user")
const expressJoi = require("@escook/express-joi")

// 更新个人信息
userInfoRouter.post('/info_update', expressJoi(user_update_schema), getuser.updateUserInfo)

// 重置密码
userInfoRouter.post('/info_reset_password', expressJoi(user_reset_password_schemia), getuser.udateUserPassword)

// 设置头像
userInfoRouter.post('/info_set_avatar', expressJoi(user_set_avatar_schema), getuser.setUserAvatar)

module.exports = userInfoRouter