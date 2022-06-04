const postRouter = require("./post")
const cateRouter = require("./cate")
const userRouter = require("./user")
const userinfoRouter = require("./userinfo")
const commentRouter = require("./comment")

exports.create = (app) => {
    app.use("/api", userRouter) // 登录注册
    app.use("/api/user", userinfoRouter) // 个人中心
    app.use("/api/cate", cateRouter) // 动态分类
    app.use("/api/post", postRouter) //动态
    app.use("/api/comment", commentRouter) // 评论
}