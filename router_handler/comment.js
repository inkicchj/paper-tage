// 导入数据库对象
const db = require("../db_handler/index")

// 根据文章 id 获取评论列表
exports.getCommentList = (req, res) => {
    const pageSize = req.body.pageSize
    const pageNum = req.body.pageNum - 1

    const sql_post = 'select * from ev_posts where post_id = ? and post_is_delete = 0'

    db.query(sql_post, req.body.post_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length === 0) return res.cc("文章不存在")
        
        const sql = `SELECT co.comment_id, co.comment_text, co.comment_pub_date, u.user_id, u.user_nickname, u.user_avatar 
        FROM ev_comments co 
        INNER JOIN ev_posts p 
        ON co.post_id = p.post_id
        INNER JOIN ev_users u
        ON co.user_id = u.user_id
        WHERE co.comment_is_delete = 0
        AND p.post_id = ? 
        AND u.user_is_active = 1 
        AND p.post_is_delete = 0
        ORDER BY co.comment_id ASC
        LIMIT ${pageSize*pageNum}, ${pageSize}`

        db.query(sql, req.body.post_id, (err, result1) => {
            if (err) return res.cc(err)
            if (result1.length === 0) return res.cc("未获取到留言数据")
            res.send({
                status: 1,
                message: "获取留言列表成功",
                data: result1
            })
        })
    })


}

// 根据用户 id 获取留言列表
exports.getCommentListByUser = (req, res) => {
    const pageSize = req.body.pageSize
    const pageNum = req.body.pageNum - 1
    const sql = `SELECT co.comment_id, co.comment_text, co.comment_pub_date, u.user_id, u.user_nickname, u.user_avatar, p.post_id, p.post_title, p.post_text 
                FROM ev_comments co 
                INNER JOIN ev_posts p 
                ON co.post_id = p.post_id 
                INNER JOIN ev_users u
                WHERE co.comment_is_delete = 0
                AND u.user_id = ? 
                AND u.user_is_active = 1 
                AND p.post_is_delete = 0
                ORDER BY co.comment_id ASC
                LIMIT ${pageSize*pageNum}, ${pageSize}`
    db.query(sql, req.auth.user_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length === 0) return res.cc("未获取留言数据")
        res.send({
            status: 1,
            message: "获取留言列表成功",
            data: result
        })
    })
}

// 新增评论数据
exports.addComment = (req, res) => {

    const commentInfo = {
        ...req.body,
        comment_pub_date: new Date(),
        user_id: req.auth.user_id,
    }

    const sql_post = 'select * from ev_posts where post_id = ? and post_is_delete = 0'

    db.query(sql_post, req.body.post_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length === 0) return res.cc("文章不存在")
        const sql = 'insert into ev_comments set ?' // 新增文章
        db.query(sql, commentInfo, (err, result1) => {
            if (err) return res.cc(err)
            if (result1.affectedRows !== 1) return res.cc("发布留言失败")

            commentInfo.user_nickname = req.auth.user_nickname
            commentInfo.user_avatar = req.auth.user_avatar
            res.send({
                status: 1,
                message: "发布留言成功",
                data: commentInfo
            })
        })
    }) 
}

// 根据 id 删除评论
exports.deleteCommentById = (req, res) => {

    const sql = 'select * from ev_comments where comment_id = ?'
    db.query(sql, req.body.comment_id, (err, result) => {

        if (err) return res.cc(err)
        if (result.length === 0) return res.cc("未查找到该留言")

        const update_sql = 'update ev_comments set comment_is_delete = 1 where comment_id = ?'
        db.query(update_sql, req.body.comment_id, (err, result) => {

            if (err) return res.cc(err)
            if (result.affectedRows !== 1) return res.cc("删除留言失败")

            res.cc("删除留言成功", 1)
        })
    })
}