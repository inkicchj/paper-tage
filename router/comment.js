const express = require("express")

// 导入留言处理模块
const commentHandler = require("../router_handler/comment")

// 导入表单校验模块
const expressJoi = require("@escook/express-joi")
const { addComment_schema, deleteCommentById_schema, page_schema, userPage_schema } = require("../schemas/comment")

const commentRouter = express.Router()

// 根据文章 id 获取留言列表，无需校验
commentRouter.post('/get_comment', expressJoi(page_schema), commentHandler.getCommentList)

// 新增留言
commentRouter.post('/add_comment', expressJoi(addComment_schema), commentHandler.addComment)

// 根据 id 留言评论
commentRouter.post('/delete_comment', expressJoi(deleteCommentById_schema), commentHandler.deleteCommentById)

// 根据用户 id 获取留言列表
commentRouter.post('/user_comments', expressJoi(userPage_schema), commentHandler.getCommentListByUser)

// 导出路由
module.exports = commentRouter