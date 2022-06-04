const Joi = require("joi")


const comment_id = Joi.number().integer().min(1).required()
const comment_text = Joi.string().max(50).required()
const post_id = Joi.number().integer().min(1).required()
const pageSize = Joi.number().integer().min(8).max(15).required()
const pageNum = Joi.number().integer().min(1).required()

// 添加评论校验
exports.addComment_schema = {
    body: {
        comment_text,
        post_id
    }
}

// 根据 id 删除评论校验
exports.deleteCommentById_schema = {
    body: {
        comment_id
    }
}

// 单页容量和页码校验
exports.page_schema = {
    body: {
        post_id:comment_id,
        pageSize,
        pageNum
    }
}

exports.userPage_schema = {
    body: {
        pageSize,
        pageNum
    }
}