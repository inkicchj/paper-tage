const db = require("./index")
const config = require("../config")

// 判断表是否存在, 并创建表
function create_table(sql, name) {

    const is_table = `select ? from information_schema.tables where table_schema = ${ config.DATA_NAME }`

    db.query(is_table, name, (err,result) => {
        if (err) return console.log(err.message)
        console.log(result)
        if (result.length === 1) return console.log(`${ name } 表已存在`)

        // 创建表
        db.query(sql, (err, result) => {
            if (err) return console.log(err.message)
            if (result) return console.log(`${ name } 表创建成功`)
        })
    })
}


// 创建角色表
const role_sql = `create table if not exists \`ev_roles\` (
    \`role_id\` INT NOT NULL AUTO_INCREMENT,
    \`role_name\` VARCHAR(255) NOT NULL,
    \`role_alias\` VARCHAR(255) NOT NULL,
    PRIMARY KEY (\`role_id\`),
    UNIQUE INDEX \`role_id_UNIQUE\` (\`role_id\` ASC) VISIBLE,
    UNIQUE INDEX \`role_name_UNIQUE\` (\`role_name\` ASC) VISIBLE,
    UNIQUE INDEX \`role_alias_UNIQUE\` (\`role_alias\` ASC) VISIBLE)`

create_table(role_sql, 'ev_roles')

// 创建用户表
const user_sql = `create table if not exists \`ev_users\` (
    \`user_id\` INT NOT NULL AUTO_INCREMENT, 
    \`user_email\` VARCHAR(255) NOT NULL,
    \`user_password\` VARCHAR(255) NOT NULL,
    \`user_avatar\` TEXT,
    \`user_nickname\` VARCHAR(255) NOT NULL,
    \`user_register_date\` DATETIME NOT NULL,
    \`user_token\` VARCHAR(5120) NOT NULL,
    \`user_is_active\` TINYINT(1) NOT NULL DEFAULT 1,
    \`role_id\` INT NOT NULL,
    PRIMARY KEY (\`user_id\`),
    UNIQUE INDEX \`user_id_UNIQUE\` (\`user_id\` ASC) VISIBLE,
    UNIQUE INDEX \`user_email_UNIQUE\` (\`user_email\` ASC) VISIBLE,
    INDEX \`role_idx\` (\`role_id\` ASC) VISIBLE,
    CONSTRAINT \`role\` FOREIGN KEY (\`role_id\`) 
    REFERENCES \`ev_app_db\`.\`ev_roles\` (\`role_id\`) 
    ON DELETE NO ACTION ON UPDATE NO ACTION)`

create_table(user_sql, 'ev_users')


// 创建分类表
const cate_sql = `create table if not exists \`ev_cates\` (
    \`cate_id\` INT NOT NULL AUTO_INCREMENT, 
    \`cate_name\` VARCHAR(255) NOT NULL,
    \`cate_alias\` VARCHAR(255) NOT NULL,
    \`cate_is_delete\` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (\`cate_id\`),
    UNIQUE INDEX \`cate_id_UNIQUE\` (\`cate_id\` ASC) VISIBLE,
    UNIQUE INDEX \`cate_name_UNIQUE\` (\`cate_name\` ASC) VISIBLE,
    UNIQUE INDEX \`cate_alias_UNIQUE\` (\`cate_alias\` ASC) VISIBLE)`

create_table(cate_sql, 'ev_cates')


// 创建文章表
const post_sql = `create table if not exists \`ev_posts\` (
    \`post_id\` INT NOT NULL AUTO_INCREMENT, 
    \`post_title\` VARCHAR(255) NOT NULL,
    \`post_text\` TEXT NOT NULL,
    \`post_state\` VARCHAR(255) NOT NULL,
    \`post_cover\` VARCHAR(255),
    \`post_pub_date\` DATETIME NOT NULL,
    \`post_is_delete\` TINYINT(1) NOT NULL DEFAULT 0,
    \`user_id\` INT NOT NULL,
    \`cate_id\` INT NOT NULL,
    PRIMARY KEY (\`post_id\`),
    UNIQUE INDEX \`post_id_UNIQUE\` (\`post_id\` ASC) VISIBLE,
    INDEX \`user_idx\` (\`user_id\` ASC) VISIBLE,
    CONSTRAINT \`user\` FOREIGN KEY (\`user_id\`) 
    REFERENCES \`ev_app_db\`.\`ev_users\` (\`user_id\`) 
    ON DELETE NO ACTION ON UPDATE NO ACTION,
    INDEX \`cate_idx\` (\`cate_id\` ASC) VISIBLE,
    CONSTRAINT \`cate\` FOREIGN KEY (\`cate_id\`) 
    REFERENCES \`ev_app_db\`.\`ev_cates\` (\`cate_id\`) 
    ON DELETE NO ACTION ON UPDATE NO ACTION)`

create_table(post_sql, 'ev_posts')



// 创建评论表
const commit_sql = `create table if not exists \`ev_comments\` (
    \`comment_id\` INT NOT NULL AUTO_INCREMENT, 
    \`comment_text\` TEXT NOT NULL,
    \`comment_pub_date\` DATETIME NOT NULL,
    \`comment_is_delete\` TINYINT(1) NOT NULL DEFAULT 0,
    \`user_id\` INT NOT NULL,
    \`post_id\` INT NOT NULL,
    PRIMARY KEY (\`comment_id\`),
    UNIQUE INDEX \`comment_id_UNIQUE\` (\`comment_id\` ASC) VISIBLE,
    INDEX \`user_com\` (\`user_id\` ASC) VISIBLE,
    CONSTRAINT \`user_com\` FOREIGN KEY (\`user_id\`) 
    REFERENCES \`ev_app_db\`.\`ev_users\` (\`user_id\`) 
    ON DELETE NO ACTION ON UPDATE NO ACTION,
    INDEX \`post\` (\`post_id\` ASC) VISIBLE,
    CONSTRAINT \`post\` FOREIGN KEY (\`post_id\`) 
    REFERENCES \`ev_app_db\`.\`ev_posts\` (\`post_id\`) 
    ON DELETE NO ACTION ON UPDATE NO ACTION)`

create_table(commit_sql, 'ev_comments')