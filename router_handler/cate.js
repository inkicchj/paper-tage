const db = require("../db_handler/index")

// 获取动态分类列表
exports.getCate = (req, res) => {
    // 查询多有动态分类
    const get_artcate = 'select cate_id, cate_name, cate_alias from ev_cates where cate_is_delete = 0 order by cate_id asc'
    db.query(get_artcate, (err, result) => {
        if (err) return res.cc(err)
        if (result.length === 0) return res.cc("未获取到动态分类列表")
        res.send({
            status: 1,
            message: '获取动态列表成功',
            data: result
        })
    })
}

// 新增动态分类
exports.addCate = (req, res) => {
    const artcate = req.body
    // 查询动态分类是否被占用
    const aricate_sql = 'select * from ev_cates where cate_name = ? or cate_alias = ?'
    db.query(aricate_sql, [artcate.cate_name, artcate.cate_alias], (err, result) => {
        if (err) return res.cc(err)
        // 分类名称 和 分类别名 被占用
        if (result.length === 2) return res.cc("分类名称与分类别名已被占用")
        if (result.length === 1 && result[0].cate_name === req.body.cate_name && result[0].cate_alias === req.body.cate_alias) return res.cc("分类名称和分类别名已被占用")
        if (result.length === 1 && result[0].cate_name === req.body.cate_name) return res.cc("分类名称已被占用")
        if (result.length === 1 && result[0].cate_alias === req.body.cate_alias) return res.cc("分类别名已被占用")
        // 添加动态分类
        const addartcate_sql = 'insert into ev_cates set ?'
        db.query(addartcate_sql, req.body, (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows !== 1) return res.cc("新增动态分类失败")
            res.send({
                status: 1,
                message: "添加动态分类成功",
                data: req.body
            })  
        })
    })
}

// 根据 id 删除动态分类
exports.delCate = (req, res) => {
    // 查询动态分类是否存在
    const check_cate = 'select * from ev_cates where cate_id = ?'
    db.query(check_cate, req.body.cate_id, (err, result) => {
        if (err) return res.cc(err)
        if (result.length !== 1) return ("该动态分类不存在")
        // 删除动态分类
        const delcate_sql = 'update ev_cates set cate_is_delete = 1 where cate_id = ?'
        db.query(delcate_sql, req.body.cate_id, (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows !== 1) return res.cc(`删除动态分类 ${ req.body.cate_id } 失败`)
            res.cc(`删除动态分类 ${ req.body.cate_id } 成功`, 1)
        })
    })
}

// 根据 id 获取动态分类
exports.getCateById = (req, res) => {
    // 获取动态分类详情
    const getcate_sql = 'select * from ev_cates where cate_id = ?'
    db.query(getcate_sql, req.params.cate_id, (err, result) => {
        if (err) return res.send(err)
        if (result.length !== 1) return res.cc(`获取动态分类 ${ req.params.cate_id } 失败`)
        if (result[0].cate_is_delete === 1) return res.cc("该动态分类不存在")
        res.send({
            status: 1,
            message: `获取动态分类 ${ req.params.cate_id } 成功`,
            data: result[0]
        })
    })
}

// 根据 id 更新动态分类
exports.updateCateById = (req, res) => {
    // 定义查重sql语句，查找id不为更改id的数据，看是否有重复的
    const aricate_sql = 'select * from ev_cates where cate_id != ? and (cate_name = ? or cate_alias = ?)'
    db.query(aricate_sql, [req.body.cate_id, req.body.cate_name, req.body.cate_alias], (err, result) => {
        if (err) return res.cc(err)
        // 分类名称 和 分类别名 被占用
        if (result.length === 2) return res.cc("分类名称与分类别名已被占用")
        if (result.length === 1 && result[0].cate_name === req.body.cate_name && result[0].cate_alias === req.body.cate_alias) return res.cc("分类名称和分类别名已被占用")
        if (result.length === 1 && result[0].cate_name === req.body.cate_name) return res.cc("分类名称已被占用")
        if (result.length === 1 && result[0].cate_alias === req.body.cate_alias) return res.cc("分类别名已被占用")
        // 更新文章分类
        const updateArtcate_sql = 'update ev_cates set ? where cate_id = ?'
        db.query(updateArtcate_sql, [req.body, req.body.cate_id], (err, result) => {
            if (err) return res.cc(err)
            if (result.affectedRows !== 1) return res.cc("更新动态分类失败")
            res.send({
                status: 1,
                message: "更新动态分类成功",
                data: req.body
            })
        })
    })
}