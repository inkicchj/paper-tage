const db = require("../db_handler/index")
const config = require("../config")
const dateformat = require("./dateFormat")
const { expressjwt:expressJwt } = require("express-jwt")
const Joi = require("joi")
const cors = require("cors")
const express = require("express")
const multer = require("multer")

// 封装响应方法中间件 
const send_data = (req, res, next) => {
    res.cc = (err, status = 0) => {
        res.send({
            status: status,
            message: err instanceof Error ? err.message : err
        })
    }
    res.data = (status, data, msg) => {
        res.send({
            status:status,
            message: msg,
            data:data
        })
    }
    next()
}

 // 解析token并拦截路由
const parse_token = expressJwt({secret:config.JWT_SECRET_KEY, algorithms: ['HS256']}).unless({path: config.UNLESS_PATH})

// 打印请求信息中间件 
const print_request = (req, res, next) => {
    const date = new Date() 
    const info = dateformat.dateFormat(date) + " [" + req.method + "] " + req.url
    console.log(info)
    next()
}

// 用于解决用户重置密码、异地登录、忘记密码后token不主动失效的问题
// 防止token泄露后在未过期时间内依旧可以登录的问题
const varify_token = (req, res, next) => {
    console.log("-----------------------------")
    const exclude_path = config.UNLESS_PATH
    if (!exclude_path.includes(req.url)) {
        if (req.headers.authorization) {
            const user_id = req.auth.user_id
            const sql = 'select user_token from ev_users where user_id = ? and user_is_active = 1'
            db.query(sql, user_id, (err, result) => {
                if (err) return res.cc(err)
                if (result.length !== 1) return res.cc("用户未注册")
                const user_token = 'Bearer ' + result[0].user_token
                if (req.headers.authorization === user_token) {
                    next()
                } else {
                    return res.cc("身份认证失败,请登录")
                }
            })
        }
    } else {
        next()
    }
}

exports.create = (app) => {
    app.use(cors()) // 跨域
    app.use(express.urlencoded({extended:false})) // 表单解析
    app.use('/uploads/cover', express.static('./uploads/cover')) // 挂载上传的文章封面静态资源
    app.use(send_data) // 封装 res.cc 函数来处理简化 res.send() 的内容
    app.use(print_request) // 打印请求信息中间件
    app.use(parse_token) // 解析token
    app.use(varify_token) // 用于解决用户重置密码、异地登录、忘记密码后token不主动失效的问题
}

// 捕获错误信息中间件
exports.catch_err = (err, req, res, next) => {
    if (err instanceof Joi.ValidationError) return res.cc(err)
    if (err instanceof multer.MulterError) return res.cc(err)
    if (err.name === 'UnauthorizedError') return res.cc("身份认证失败,请登录")
    // 未知错误
    return res.cc(err)
}