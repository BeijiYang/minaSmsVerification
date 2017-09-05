# 基于阿里云的 微信小程序 短信验证 功能模块
Mina + Node.js

## 功能

### 小程序端：
* 请求获取短信验证码
* 两次请求之间间隔至少一分钟
* 填写必填内容后，才能提交表单
* 手机号合法性检验

### 后台：
* 接前台请求后，通过阿里云发送短信
* 生成随机数字验证码（默认6位）
* 收到提交的表单后，对验证码字段进行判断
  * 验证码是否过期
  * 验证码是否正确
* 通过验证后，方能进行下一步操作
  * 如保存表单信息至数据库等
* 结果反馈


## 说明
* 使用阿里云[短信服务](https://www.aliyun.com/product/sms)，需注册阿里云，创建AccessKeyId 与 AccessKeySecret，申请[短信签名](https://help.aliyun.com/document_detail/55327.html?spm=5176.8195934.507901.5.2uziZ5)和[短信模板](https://help.aliyun.com/document_detail/55330.html?spm=5176.8195934.507901.6.2uziZ5) ，即可使用
* 将这些信息填入config.default.js中，并改名为config.js
* 手机号合法性验证部分，为了让代码长期可用，没有针对现行号段进行详细检测，而是只进行了粗略的检测
* **如有帮助，请Star**
