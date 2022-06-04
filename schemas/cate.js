const Joi = require("joi")

// 验证动态分类
const cate_id = Joi.number().integer().min(1).required() // 分类id
const cate_name = Joi.string().required() // 动态名称
const cate_alias = Joi.string().alphanum().required()  // 动态别名

// 添加动态分类
exports.addCate_schema = {
    body: {
        cate_name,
        cate_alias
    }
}

// 根据动态id删除动态分类
exports.delCate_schema = {
    body: {
        cate_id
    }
}

// 根据 id 获取动态分类验证
exports.getCateById_schema = {
    params: {
        cate_id
    }
}

// 根据 id 更新动态分类验证
exports.updateCateById_schema = {
    body: {
        cate_id,
        cate_name,
        cate_alias
    }
}