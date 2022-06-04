const express = require("express")
// 导入session储存验证码信息
const session = require("express-session")
// 创建路由模块
const userRouter = express.Router()

const config = require("../config")

userRouter.use(session({
    secret: config.SESSION_SECRET_KEY,
    resave: false,
    name:"session",
    saveUninitialized: true,
    cookie:{
        maxAge:300000
    }
}))

// 导入用户路由处理函数对应的模块
const userHandler = require("../router_handler/user")

// 导入自动验证中间件
const expressJoi = require("@escook/express-joi")

// 导入验证规则
const { testify_user_schema, email_scheam, reset_schema } = require("../schemas/user")

// 注册
// 使用注册处理函数
// 使用验证中间件
userRouter.post("/register", expressJoi(testify_user_schema), userHandler.register)

// 登录
// 使用登录注册函数
userRouter.post("/login", expressJoi(testify_user_schema), userHandler.login)

// 退出登录
userRouter.post("/logout", userHandler.logout)

// 忘记密码
userRouter.post("/forget", expressJoi(reset_schema), userHandler.forget)

// 图片验证码
userRouter.post("/code", userHandler.getCaptcha)

// 邮箱验证码
userRouter.post("/code1", expressJoi(email_scheam), userHandler.sendCode)


// 导出路由模块
module.exports = userRouter