const express = require("express")

const cateRouter = express.Router()

// 导入验证规则
const { addCate_schema, delCate_schema, getCateById_schema, updateCateById_schema } = require("../schemas/cate")

// 导入自动校验模块
const expressJoi = require("@escook/express-joi")

// 导入处理函数
const cateHandler = require("../router_handler/cate")

// 获取动态分类列表
cateRouter.post("/list", cateHandler.getCate)

// 新增动态分类
cateRouter.post("/add_cate", expressJoi(addCate_schema), cateHandler.addCate)

// 删除动态分类
cateRouter.post("/delete_cate", expressJoi(delCate_schema), cateHandler.delCate)

//根据 id 获取动态分类
cateRouter.get("/get_cate/:cate_id", express(getCateById_schema), cateHandler.getCate)

// 根据 id 更新动态分类
cateRouter.post("/update_cate", expressJoi(updateCateById_schema), cateHandler.updateCateById)

// 导出动态分类路由
module.exports = cateRouter