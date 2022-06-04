// 导入 mysql 操作数据库
const mysql = require("mysql")
const config = require("../config")


// 创建数据库连接对象
const db = mysql.createPool({
    host: config.DATA_HOST,
    port: config.DATA_PORT,
    user: config.DATA_USERNAME, 
    password: config.DATA_PASSWORD,
    database: config.DATA_NAME
})

// 导出数据库对象
module.exports = db