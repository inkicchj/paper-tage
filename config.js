module.exports = {
    SERVER_HOST: '127.0.0.1',
    SERVER_PORT: '9900',
    JWT_SECRET_KEY: 'ajaxcigvwooc^_^*^_^',
    JWT_EXPIRES: '10h',
    DATA_HOST: '127.0.0.1',
    DATA_PORT: '3306',
    DATA_NAME: 'ev_app_db',
    DATA_USERNAME: 'root',
    DATA_PASSWORD: 'huangjie0114',
    SESSION_SECRET_KEY:'huangjie0114',
    EMAIL_USERNAME: 'iccoup@163.com',
    EMAIL_STMP_HOST: 'smtp.163.com',
    EMAIL_PASSWORD: 'WPYPEFCALOOTHKNY',
    EMAIL_PORT: 465,
    UNLESS_PATH: [
                    '/api/login', 
                    '/api/forget', 
                    '/api/register', 
                    '/api/code', 
                    '/api/code1', 
                    '/uploads/cover', 
                    '/api/post/list', 
                    '/api/post/list/fliter', 
                    '/api/post/get_post', 
                    '/api/comment/get_comment',
                    '/api/cate/list'
                ]
}