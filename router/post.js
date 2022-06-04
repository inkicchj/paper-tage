const express = require('express')
const multer = require("multer") // formdata 解析模块


// 创建动态路由实例
const postRouter = express.Router()

// 导入处理路径的函数
const path = require("path")

// 创建 multer 实例对象, 通过 dest 指定动态背景图片存放路径
const upload = multer({
    dest: path.join(__dirname, '../uploads/cover'),
    limits: {
        files: 1,
        fileSize: 2079152
    },
    fileFilter: (req, file, cb) => {
        var ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return cb(new Error('图片类型应为jpg、png、jpeg'))
        }
        cb(null, true)
    }
})

// 导入路由处理函数
const postHandler = require("../router_handler/post")

// 导入表单自动验证模块与验证规则模块
const expressJoi = require("@escook/express-joi")
const { addPost_schema, deletePostById_schema, getPostById_schema, updatePost_schema, getPostByPage_schema } = require("../schemas/post")

// 新增动态, 通过 multer 读取 formdata 数据，并将 cover_img 的图像文件挂载到 req.file
postRouter.post('/add_post', upload.single("post_cover") ,expressJoi(addPost_schema), postHandler.addPost)

// 获取全部动态列表，无需校验
postRouter.post('/list', expressJoi(getPostByPage_schema), postHandler.listPost)

// 根据关键字和所属分类搜索动态
postRouter.post('/list/fliter', expressJoi(getPostByPage_schema), postHandler.listPostByKey)

// 根据 id 删除动态
postRouter.post('/delete_post', expressJoi(deletePostById_schema), postHandler.deletePostById)

// 根据 id 获取某篇动态详情，无需校验
postRouter.post('/get_post', expressJoi(getPostById_schema), postHandler.getPostById)

// 根据 id 更新动态
postRouter.post('/update_post', upload.single("post_cover"), expressJoi(updatePost_schema), postHandler.updatePostById)

// 根据用户 id 获取用户动态列表
postRouter.post('/user_posts', expressJoi(getPostByPage_schema), postHandler.getArticleByUser)

// 导出路由
module.exports = postRouter