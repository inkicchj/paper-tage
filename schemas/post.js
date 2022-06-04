const Joi = require("joi")

const post_id = Joi.number().integer().min(1).required() //动态id
const post_title = Joi.string().required() // 动态标题
const post_text = Joi.string().required() // 动态内容
const post_state = Joi.string().valid("发布", "草稿").required()  // 动态状态
const fk_cate_id = Joi.number().integer().min(1).required()  // 动态分类id
const pageNum = Joi.number().integer().min(1).required() // 页码
const pageSize = Joi.number().integer().min(8).max(15).required() // 单页内容数量

// 获取所有动态
exports.getPostByPage_schema = {
    body: {
        pageSize,
        pageNum,
        searchKey:Joi.string().trim(),
        cate_id:Joi.string()
    }
}

// 新增动态
exports.addPost_schema = {
    body: {
        post_title,
        post_text,
        post_state,
        cate_id: fk_cate_id
    }
}

// 根据id删除动态
exports.deletePostById_schema = {
    body: {
        post_id
    }
}

// 根据id获取动态详情
exports.getPostById_schema = {
    body: {
        post_id
    }
}

// 更新状态为草稿的动态
exports.updatePost_schema = {
    body: {
        post_id,
        post_title,
        post_text,
        cate_id: fk_cate_id,
        post_state
    }
}