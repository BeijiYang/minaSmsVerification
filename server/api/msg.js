const SMSClient = require('@alicloud/sms-sdk')
const config = require('../config/config')
const errorMessage = require('./locale/errorMessageZhCn')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = config.accessKeyId
const secretAccessKey = config.secretAccessKey
// 在云通信页面开通相应业务消息后，就能在页面上获得对应的queueName,不用填最后面一段
// const queueName = config.queueName
const utils = require('./utils')

const {
  getFormatedDate,
  checkDetail,
  onInvalidCode,
  onSendSuccess,
  onSendFail,
} = utils;

// 初始化sms_client
const smsClient = new SMSClient({ accessKeyId, secretAccessKey })

// 发送短信
exports.send = (req, res) => {
  let phoneNum = req.body.phoneNum
  // 生成六位随机验证码
  let smsCode = Math.random().toString().slice(-6)
  let jsonifiedSmsCode = JSON.stringify(smsCode)

  smsClient.sendSMS({ // 有篇文章/笔记里说了个相关的，object.assign 还是啥？
    PhoneNumbers: phoneNum,
    SignName: config.SignName,
    TemplateCode: config.TemplateCode,
    TemplateParam: `{"number":${jsonifiedSmsCode}}`
  }).then(
    (smsRes) => { onSendSuccess(res, smsRes) },
    (err) => { onSendFail(res, err) }
  )
}

exports.check = (req, res) => {
  const { phoneNum, code, otherInfo } = req.body
  const sendDate = getFormatedDate()

  // 查询短信发送详情
  smsClient.queryDetail({
    PhoneNumber: phoneNum,
    SendDate: sendDate,
    PageSize: '1',
    CurrentPage: '1'
  })
    .then(response => { checkDetail(response, code, otherInfo, res) })
    .catch(err => { onInvalidCode(res, errorMessage["invalidCode.serverError"]) })
}
