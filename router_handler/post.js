// 导入数据库对象
const db = require("../db_handler/index")
const fs = require("fs")
const path = require("path")

// 新增动态函数
exports.addPost = (req, res) => {
    // 动态信息
    const articleInfo = {
        ...req.body,
        post_pub_date: new Date(),
        user_id: req.auth.user_id,
    }
    if (req.file && req.file.fieldname === 'post_cover') {
        // 重命名 multer 保存的图片，加上上传图片后缀，使其能够打开
        let oldName = req.file.path
        let newName = req.file.path + path.parse(req.file.originalname).ext
        fs.renameSync(oldName, newName)
        articleInfo.post_cover = path.join('/uploads/cover', req.file.filename + path.parse(req.file.originalname).ext)
    }
    // 新增动态
    const add_sql = 'insert into ev_posts set ?'
    db.query(add_sql, articleInfo, (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows !== 1) return res.cc("发布动态失败")
        res.send({
            status: 1,
            message: "发布动态成功",
            data: articleInfo
        })
    })
}

// 获取动态列表
exports.listPost = (req, res) => {
    const pageSize = req.body.pageSize
    const pageNum = req.body.pageNum - 1
    // 联表查询动态所属用户信息、分类信息
    const sql = `SELECT SQL_CALC_FOUND_ROWS p.post_id, p.post_title, p.post_text, p.post_cover, p.post_pub_date, u.user_id, u.user_avatar, u.user_nickname, c.cate_id, c.cate_name 
                FROM ev_posts p 
                INNER JOIN ev_users u 
                ON p.user_id = u.user_id 
                INNER JOIN ev_cates c 
                ON p.cate_id = c.cate_id 
                AND p.post_is_delete = 0 
                AND p.post_state = '发布' 
                AND u.user_is_active = 1 
                AND c.cate_is_delete = 0 
                ORDER BY p.post_id DESC 
                LIMIT ${pageNum*pageSize}, ${pageSize}` 
    db.query(sql, (err, result) => {
        if (err) return res.cc(err)
        if (result.length === 0) return res.cc("获取动态列表失败")
        res.send({
            status: 1,
            message: "获取动态列表成功",
            data: result
        })
    })
}

// 根据关键字和分类获取动态列表
exports.listPostByKey = (req, res) => {
    const pageSize = req.body.pageSize
    const pageNum = req.body.pageNum - 1
     // 联表查询动态所属用户信息、分类信息，模糊匹配关键字，匹配动态分类id
    const sql = `SELECT SQL_CALC_FOUND_ROWS p.post_id, p.post_title, p.post_text, p.post_cover, p.post_pub_date, u.user_id, u.user_avatar, u.user_nickname, c.cate_id, c.cate_name 
                FROM ev_posts p 
                INNER JOIN ev_users u 
                ON p.user_id = u.user_id 
                INNER JOIN ev_cates c 
                ON p.cate_id = c.cate_id 
                AND p.post_is_delete = 0 
                AND p.post_state = '发布' 
                AND u.user_is_active = 1 
                AND c.cate_is_delete = 0 
                AND CONCAT(p.post_title, p.post_text) LIKE '%${req.body.searchKey?req.body.searchKey:""}%' 
                ${req.body.cate_id ? 'AND c.cate_id IN (' + req.body.cate_id + ')' : ''} 
                ORDER BY p.post_id DESC 
                LIMIT ${pageNum*pageSize}, ${pageSize}`  
    db.query(sql, (err, result) => {
        console.log(result)
        if (err) return res.cc(err)
        if (result.length === 0) return res.cc("获取文章列表失败")
        res.send({
            status: 1,
            message: "获取文章列表成功",
            data: result
        })
    })
}

// 根据 id 删除动态
exports.deletePostById = (req, res) => {
    // 查询动态是否存在
    const sql = 'select * from ev_posts where post_id = ? and post_id_delete = 0'
    db.query(sql, req.body.post_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length !== 1) return res.cc("该动态不存在")
        // 删除动态
        const del_sql = 'update ev_posts set post_is_delete = 1 where post_id = ?'
        db.query(del_sql, req.body.post_id, (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows !== 1) return res.cc("删除动态失败")
            res.cc("删除动态成功", 1)
        })
    })
}



// 根据 id 获取文章详情
exports.getPostById = (req, res) => {
    // 联表查询动态所属用户信息、分类信息，模糊匹配关键字，匹配动态分类id
    const sql = `SELECT p.post_id, p.post_title, p.post_text, p.post_cover, p.post_pub_date, u.user_id, u.user_avatar, u.user_nickname, c.cate_id, c.cate_name
                FROM ev_posts p 
                INNER JOIN ev_users u 
                ON p.user_id = u.user_id
                INNER JOIN ev_cates c 
                ON p.cate_id = c.cate_id
                WHERE p.post_id = ?
                AND p.post_is_delete = 0
                AND p.post_state = '发布'
                AND u.user_is_active = 1 
                AND c.cate_is_delete = 0`
    db.query(sql, req.body.post_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length !== 1) return res.cc("该动态不存在")
        if (result[0].post_is_delete === 1) return res.cc("该动态已删除")
        res.send({
            status: 1,
            message: "获取动态详情成功",
            data: result[0]
        })
    })
}

// 根据 id 更新状态为草稿的动态信息 
exports.updatePostById = (req, res) => {
    // 查询文章是否存在且状态是否为草稿
    const sql = 'select * from ev_posts where post_id = ? and post_state = "草稿"'
    db.query(sql, req.body.post_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length !== 1) return res.cc("该动态不存在或已经发布")
        const articleInfo = req.body
        if (req.file && req.file.fieldname === 'post_cover') {
            // 删除文章原来的背景图片
            const cover_path = path.join(__dirname, '../', result[0].post_cover)
            console.log(cover_path)
            fs.unlinkSync(cover_path)
            // 重命名 multer 文件，加上上传文件后缀，使其能够打开
            let oldName = req.file.path
            let newName = req.file.path + path.parse(req.file.originalname).ext
            fs.renameSync(oldName, newName)
            articleInfo.post_cover = path.join('/uploads/cover', req.file.filename + path.parse(req.file.originalname).ext)
        }
        // 更新动态内容
        const update_sql = 'update ev_posts set ? where post_id = ? and post_state = "草稿"'
        db.query(update_sql, [articleInfo, req.body.post_id], (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows !== 1) return res.cc('更新动态失败')
            res.send({
                status: 1,
                message: "更新动态成功",
                data: result[0]
            })
        })
    })
}


// 根据用户 id 获取动态列表
exports.getArticleByUser = (req, res) => {
    const pageSize = req.body.pageSize
    const pageNum = req.body.pageNum - 1
    // 联表查询动态所属用户信息、分类信息，模糊匹配关键字，匹配动态分类id
    const sql = `SELECT SQL_CALC_FOUND_ROWS p.post_id, p.post_title, p.post_text, p.post_cover, p.post_pub_date, u.user_id, u.user_avatar, u.user_nickname, c.cate_id, c.cate_name 
                FROM ev_posts p 
                INNER JOIN ev_users u 
                ON p.user_id = u.user_id 
                INNER JOIN ev_cates c 
                ON p.cate_id = c.cate_id 
                AND p.post_is_delete = 0 
                AND p.post_state = '发布' 
                AND u.user_is_active = 1 
                AND c.cate_is_delete = 0
                AND u.user_id = ?  
                ORDER BY p.post_id DESC 
                LIMIT ${pageNum*pageSize}, ${pageSize}`
    db.query(sql, req.auth.user_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length === 0) return res.cc("获取动态列表失败")
        res.send({
            status: 1,
            message: "获取动态列表成功",
            data: result
        })
    })
}