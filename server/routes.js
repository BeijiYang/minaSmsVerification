const express = require('express')
const hello = require('./api/hello')
const msg = require('./api/msg')


const router = express.Router()

//测试
router.get('/', hello.world)

//发短信
router.post('/msg', msg.send)
//短信验证
router.post('/addinfo', msg.check)


module.exports = router
