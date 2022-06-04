const express = require("express")
const middleware = require("./middleware/index")
const router = require("./router/index")
const config = require("./config")

const app = express()  // 创建服务器实例

middleware.create(app) // 前置中间件
router.create(app) // 路由
app.use(middleware.catch_err) // 捕获错误中间件

// 初始化服务器
app.listen(config.SERVER_PORT, config.SERVER_HOST, () => {
    console.log(`服务已启动-> ${config.SERVER_HOST}:${config.SERVER_PORT}`)
})