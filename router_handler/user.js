// 导入数据库操作模块
const db = require("../db_handler/index")

// 导入文本加密模块，用于加密用户的铭文密码
const bcrypt = require("bcryptjs")

// 导入全局配置文件
const config = require('../config')

// 导入token生成模块
const jwt = require('jsonwebtoken')

// 导入svg验证码生成模块
const captch = require('svg-captcha')

// 导入邮箱发送模块
const mailer = require('nodemailer')

// 生成随机字符串作为户次注册用户的昵称
const string_random = require("string-random")

// 注册函数
exports.register = (req, res) => {
    let userinfo = req.body
    if (!req.session.captcha) {
        return res.cc("请获取验证码!")
    }
    if (req.session.captcha.toLowerCase() !== userinfo.captcha_code.toLowerCase()) {
        req.session.destroy()
        return res.cc("验证码填写错误！")
    }
    if (!userinfo.user_email || !userinfo.user_password) {
        req.session.destroy()
        return res.cc('邮箱或密码不合法')
    }
    const check_user = 'select * from ev_users where user_email = ?'
    db.query(check_user, userinfo.user_email, (err, result) => {
        if (err) {
            req.session.destroy()
            return res.cc(err)
        }
        if (result.length > 0) {
            req.session.destroy()
            return res.cc("该邮箱已被注册")
        }
        // bcrypt.hashSync(参数1, 参数2) 对密码进行加密
        // 参数1为被加密的值，参数2为随机盐的长度
        userinfo.user_password = bcrypt.hashSync(userinfo.user_password, 15)
        // 用户信息
        const user = {
            user_email: userinfo.user_email,
            user_password: userinfo.user_password,
            user_nickname: string_random(8, {numbers:false}),
            user_register_date: new Date(),
            role_id: 2
        }
        // 添加用户
        const add_user = 'insert into ev_users set ?'
        db.query(add_user, user, (err, result) => {
            if (err) {
                req.session.destroy()
                return res.cc(err)
            }     
            // 判断影响行数是否等于1
            if (result.affectedRows !== 1) {
                req.session.destroy()
                return res.cc("注册失败，请稍后再试")
            }
            res.cc("注册成功!", 1)
        })
    })
}

// 登录函数
exports.login = (req, res) => {
    let userinfo = req.body

    if (!req.session.captcha) {
        return res.cc("请获取验证码!")
    }
    if (req.session.captcha.toLowerCase() !== userinfo.captcha_code.toLowerCase()) {
        req.session.destroy()
        return res.cc("验证码填写错误！")
    }
    if (!userinfo.user_email || !userinfo.user_password) {
        req.session.destroy()
        return res.cc("邮箱或密码不合法")
    }
    const check_user = 'select * from ev_users where user_email = ?'
    db.query(check_user, userinfo.user_email, (err, result) => {
        if (err){
            req.session.destroy() 
            return res.cc(err)
        }
        if (result.length !== 1) {
            req.session.destroy()
            return res.cc('用户还未注册')
        }
        // 验证密码是否正确
        // 提交的密码，储存的密码
        const varify_password = bcrypt.compareSync(userinfo.user_password, result[0].user_password)
        if (!varify_password){ 
            req.session.destroy()   
            return res.cc('密码错误') 
        }
        const user = { ...result[0], user_password: '', user_token: ''}
        // 生成 token 字符串
        const tokenStr = jwt.sign(user, config.JWT_SECRET_KEY, {expiresIn: config.JWT_EXPIRES})
        // 更新用户登录token
        const login_sql = `update ev_users set user_token = ? where user_id = ${result[0].user_id}`
        db.query(login_sql, tokenStr, (err, result1) => {

            if (err){
                req.session.destroy() 
                return res.cc(err) 
            }
            if (result1.affectedRows !== 1){ 
                req.session.destroy()
                return res.cc("登录失败")
            }
            res.send({status:1, message:'登录成功', token: 'Bearer '+ tokenStr})
        })
    })
}

// 退出登录
exports.logout = (req, res) => {
    console.log(req.auth.user_id)
    const sql = "update ev_users set user_token = '' where user_id = ?"
    db.query(sql, req.auth.user_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows !== 1) return res.cc("操作失败")
        res.cc("成功退出登录", 1)
    })
}


// 忘记密码时重置密码使用
exports.forget = (req, res) => {
    if (req.body.email_code !== req.session.emailcode){ 
        req.session.destroy()
        return res.cc("验证码错误") 
    }
    const sql = 'select * from ev_users where user_email = ? and user_is_active = 1'
    db.query(sql, req.body.user_email, (err, result) => {
        if (err){ 
            req.session.destroy()
            return res.cc(err)
        }
        if (result.length !== 1){ 
            req.session.destroy()
            return res.cc("用户不存在")}
        if (req.body.newPwd) {
            const hash_password = bcrypt.hashSync(req.body.newPwd, 15)
            const sql_pwd = `update ev_users set user_password = ? where user_id = ${result[0].user_id}`
            db.query(sql_pwd, hash_password, (err, result1) => {
                if (err){ 
                    req.session.destroy()
                    return res.cc(err) 
                }
                if (result1.affectedRows !== 1){ 
                    req.session.destroy()    
                    return res.cc("重置密码失败")
                }
                // 重置密码后重新刷新用户token
                const user = { ...result[0], user_password: '', user_token: ''}
                // 生成 token 字符串
                const tokenStr = jwt.sign(user, config.JWT_SECRET_KEY, {expiresIn: config.JWT_EXPIRES})
                // 更新用户token
                const login_sql = `update ev_users set user_token = ? where user_id = ${result[0].user_id}`
                db.query(login_sql, tokenStr, (err, result2) => {
                    if (err){
                        req.session.destroy() 
                        return res.cc(err) 
                    }
                    if (result2.affectedRows !== 1){ 
                        req.session.destroy()
                        return res.cc("重置密码失败")
                    }
                    res.cc("密码重置成功", 1)
                })
            })
        }
    })
}

// 图片验证码生成函数
exports.getCaptcha = (req, res) => {
    const captcha = captch.create({
        ignoreChars:"0o1iIl",
        noise:4,
        color:true,
        background:"#fff",
        fontSize:60
    }) // 创建svg验证码
    req.session.captcha = captcha.text
    res.type("svg")
    res.status(200).send(captcha.data)
}

// 邮箱验证码生成函数
exports.sendCode = async (req, res) => {
    var transpoter = mailer.createTransport({
        host: config.EMAIL_STMP_HOST,
        port: config.EMAIL_PORT,
        secure: true,
        auth: {
            user: config.EMAIL_USERNAME,
            pass: config.EMAIL_PASSWORD
        }
    })
    var code = string_random(6, {numbers:false})
    req.session.emailcode = code
    var mailinfo = {
        from: config.EMAIL_USERNAME,
        to: req.body.email,
        subject: '小纸条验证码（重置密码）',
        html: `<p>验证码：</p><h1>${code}</h1><p>5分钟内有效</p>`,
    }
    await transpoter.sendMail(mailinfo, (err, ret) => {
        if (err) return res.cc(err)
        res.cc("发送验证码成功", 1)
    })
}