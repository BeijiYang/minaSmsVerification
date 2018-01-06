const SMSClient = require('@alicloud/sms-sdk')
const config = require('../config/config')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = config.accessKeyId
const secretAccessKey = config.secretAccessKey

// 在云通信页面开通相应业务消息后，就能在页面上获得对应的queueName,不用填最后面一段
// const queueName = config.queueName

// 初始化sms_client
let smsClient = new SMSClient({accessKeyId, secretAccessKey})

// 发送短信
exports.send = (req, res) => {
  let phoneNum = req.body.phoneNum
  // 六位随机验证码
  let smsCode = Math.random().toString().slice(-6)
  let jsonifySmsCode = JSON.stringify(smsCode)
  smsClient.sendSMS({
    PhoneNumbers: phoneNum,
    SignName: config.SignName,
    TemplateCode: config.TemplateCode,
    TemplateParam: `{"number":${jsonifySmsCode}}`
  }).then(function (smsRes) {
    let {Code} = smsRes
    if (Code === 'OK') {
      console.log('已成功发送短信')
      return res.status(200).json({
        message: '已成功发送短信'
      })
    }
  }, function (err) {
    console.log(err)
    res.status(401).json({
      message: err
    })
  })
}

exports.check = (req, res) => {
  let { phoneNum, code } = req.body
  let date = new Date()
  let sendDate = date.toLocaleDateString().split('-').map(
    (item) => {
      if (item < 10) {
        return item = '0' + item
      } else {
        return item
      }
    }
  ).join('')

  let promise = new Promise((resolve, reject) => {
    // 查询短信发送详情
    smsClient.queryDetail({
      PhoneNumber: phoneNum,
      SendDate: sendDate,
      PageSize: '1',
      CurrentPage: '1'
    }).then(function (res) {
      let {Code, SmsSendDetailDTOs} = res
      if (Code === 'OK') {
        // 处理发送详情内容
        let detail = SmsSendDetailDTOs.SmsSendDetailDTO[0]
        if (detail) {
          let content = detail.Content
          let pattern = /\d{6}/
          if(!pattern.exec(content)) {
            reject('出错 请重新获取验证码')
          }
          let realCode = pattern.exec(content)[0]
          if (realCode === code) {
            let receiveTime = Date.parse(detail.ReceiveDate)
            let now = Date.parse(new Date())
            // 一分钟60000ms
            let difftime = (now - receiveTime) / 60000
            if (difftime <= config.timeLimit) {
              resolve('pass')
            } else {
              reject('验证码过期')
            }
          } else {
            reject('验证码错误')
          }
        } else {
          reject(`${sendDate + '无验证码记录'}`)
        }
      }
    }, function (err) {
      // 处理错误
      console.log(err)
      reject(err)
    })
  })
  promise.then((msg) => {
    console.log(msg)
    // 通过验证，可以对表单中的其他信息进行操作。如保存到数据库等等。

    return res.status(200).json({
      message: msg
    })
  }).catch((msg) => {
    console.log(msg)
    res.status(401).json({
      message: msg
    })
  })
}
