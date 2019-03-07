const express = require('express')
const msg = require('./api/msg')

const router = express.Router()

// 发短信
router.post('/msg', msg.send)
// 短信验证
router.post('/addinfo', msg.check)

module.exports = router
