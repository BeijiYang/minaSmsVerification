const config = require('../config/config')
const errorMessage = require('./locale/errorMessageZhCn')
const commonMessage = require('./locale/commonMessageZhCn')
const MILLISECONDSPERMINUTE = 60000 // 每分钟毫秒数
const MILLISECONDSPERHOUR = 3600000 // 每小时毫秒数

// TIME
/**
 * from 1999-09-09T09:31:30.417Z to 19990909
 */
const getFormatedDate = () => {
  const date = new Date()
  const formatedDate = date.toLocaleDateString().split('-').map(item => (item < 10 ? '0' + item : item)).join('')
  return formatedDate
}

/**
 * 
 * @param {number} parsedOutlandTime the number of milliseconds between January 1, 1970 and the outland time; Date.parse()
 * @param {number} outlandTimeZone time zone
 */
const getDiffTimeBetweenTimeZones = (parsedOutlandTime, outlandTimeZone) => {
  const localNow = Date.parse(new Date())
  const date = new Date()
  const localTimeZone = date.getTimezoneOffset() / 60
  const hoursBetweenTimeZones = localTimeZone + outlandTimeZone
  const millisecondsBetweenTimeZones = hoursBetweenTimeZones * MILLISECONDSPERHOUR
  const diffTimeInMinutes = (localNow + millisecondsBetweenTimeZones - parsedOutlandTime) / MILLISECONDSPERMINUTE
  return diffTimeInMinutes
}


// SMS CODE
const codeExpired = receiveDate => {
  const receiveTimeInUTC8 = Date.parse(receiveDate)
  const diffTimeInMinutes = getDiffTimeBetweenTimeZones(receiveTimeInUTC8, 8)
  return (diffTimeInMinutes > config.timeLimit)
}

const invalidCodeFormat = content => {
  const pattern = config.pattern
  return !pattern.exec(content)
}

const invalidCode = (content, code) => {
  const pattern = config.pattern
  let realCode = pattern.exec(content)[0]
  return realCode !== code
}

const checkDetail = (response, code, otherInfo, res) => {
  const { Code, SmsSendDetailDTOs } = response
  if (Code !== 'OK') return onInvalidCode(res, errorMessage["invalidCode.serverError"])

  const detail = SmsSendDetailDTOs.SmsSendDetailDTO[0]
  if (!detail) return onInvalidCode(res, `${sendDate + errorMessage["invalidCode.noRecord"]}`)

  const content = detail.Content
  if (invalidCodeFormat(content)) return onInvalidCode(res, errorMessage["invalidCode.serverError"])

  if (invalidCode(content, code)) return onInvalidCode(res, errorMessage["invalidCode.invalidCode"])

  const receiveDate = detail.ReceiveDate
  return codeExpired(receiveDate)
    ? onInvalidCode(res, errorMessage["invalidCode.codeExpired"])
    : onValidCode(res, otherInfo)
}


// AJAX
const onInvalidCode = (res, msg) => {
  console.log(msg)
  res.status(401).json({ message: msg })
}

const onValidCode = (res, info) => {
  console.log(info)
  // 通过验证，可以对表单中的其他信息进行操作。如保存到数据库等等。
  // do something to the info
  return res.status(200).json({ message: 'pass' })
}

const onSendSuccess = (res, smsRes) => {
  let { Code } = smsRes
  if (Code === 'OK') {
    console.log(commonMessage.messageSendSuccess)
    return res.status(200).json({
      message: commonMessage.messageSendSuccess
    })
  }
}

const onSendFail = (res, err) => {
  console.log(err)
  return res.status(401).json({
    message: errorMessage.messageSendFailed
  })
}

module.exports = {
  getFormatedDate,
  checkDetail,
  onInvalidCode,
  onSendSuccess,
  onSendFail,
}
