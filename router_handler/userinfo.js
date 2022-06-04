const db = require('../db_handler/index')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const config = require("../config")

// 获取个人信息函数
exports.getUserInfo = (req, res) => {
    const get_user_sql = 'select user_id, user_email, user_nickname, user_avatar from ev_users where user_id = ?'
    db.query(get_user_sql, req.auth.user_id, (err, result)=>{
        if (err) return res.cc(err)
        if (result.length !== 1) return res.cc('获取信息失败')
        res.send({
            status: 1,
            message: '获取信息成功',
            data: result[0]
        })
    })
}

// 更新个人信息
exports.updateUserInfo = (req, res) => {
    const update_userinfo = req.body
    console.log(update_userinfo)
    const update_sql = 'update ev_users set ? where user_id = ?'

    db.query(update_sql, [update_userinfo, req.auth.user_id], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows !== 1) return res.cc("信息更新失败")
        res.send({
            status: 1,
            message: "信息更新成功",
            data: update_userinfo
        })
    })
}

// 重置密码
exports.udateUserPassword = (req, res) => {
    const check_user = 'select * from ev_users where user_id = ?'
    db.query(check_user, req.auth.user_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length !== 1) return res.cc("用户不存在")
        const varify_password = bcrypt.compareSync(req.body.oldPwd, result[0].user_password)
        if (!varify_password) return res.cc("原密码错误")
        // 加密新密码
        const newPwd = bcrypt.hashSync(req.body.newPwd, 15)
        // 重置密码
        const reset_password = 'update ev_users set user_password = ? where user_id = ?'
        db.query(reset_password, [newPwd, req.auth.user_id], (err, result1) => {
            if (err) return res.cc(err)
            if (result1.affectedRows !== 1) return res.cc("密码重置失败，请稍后再试")
            const user = { ...result[0], user_password: '', user_avatar: '', user_token: ''}
            // 生成 token 字符串
            const tokenStr = jwt.sign(user, config.JWT_SECRET_KEY, {expiresIn: config.JWT_EXPIRES})
            // 更新用户登录token
            const refresh_sql = `update ev_users set user_token = ? where user_id = ${result[0].user_id}`
            db.query(refresh_sql, tokenStr, (err, result2) => {
                if (err) return res.cc(err)
                if (result2.affectedRows !== 1) return res.cc("登录失败")
                res.send({status:1, message:'重置密码成功', token: 'Bearer '+ tokenStr})
            })
        })
    })
}

// 设置用户头像
exports.setUserAvatar = (req, res) => {
    const set_avatar = 'update ev_users set user_avatar = ? where user_id = ?'
    db.query(set_avatar, [req.body.user_avatar, req.auth.user_id], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows !== 1) return res.cc("头像更新失败")
        res.send({
            status: 1,
            message: '头像更新成功',
            data: req.body.user_avatar
        })
    })
}