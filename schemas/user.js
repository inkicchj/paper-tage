// 导入表单验证模块
const Joi = require("joi")

// 用户注册验证规则
// const nickname = Joi.string().alphanum().min(3).max(12).required()

const user_id = Joi.number().integer().min(1).required()
const user_email = Joi.string().email().required()
const user_password = Joi.string().pattern(/^[\S]{6,18}/).required()
const user_nickname = Joi.string().min(2).max(15).trim().required()
const captcha_code = Joi.string().min(4).max(4).trim().required()
const email_code = Joi.string().min(6).max(6).trim().required()

// 注册、登录校验
exports.testify_user_schema = {
   body: {
       captcha_code,
       user_email,
       user_password
   } 
}

// 更新个人信息校验
exports.user_update_schema = {
    body: {
        user_nickname,
    }
}

// 重置个人密码校验
exports.user_reset_password_schemia = {
    body: {
        oldPwd: user_password,
        newPwd: Joi.not(Joi.ref('oldPwd')).concat(user_password)
    }
}

// 设置个人头像校验
exports.user_set_avatar_schema = {
    body: {
        user_avatar: Joi.string().dataUri().required()
    }
}

// 邮箱验证
exports.email_scheam = {
    body: {
        email: user_email
    }
}

// 重置密码验证
exports.reset_schema = {
    body: {
        user_email,
        newPwd: user_password,
        email_code
    }
}