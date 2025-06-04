import { post } from './request.js'
import { toast } from '@/uni_modules/uv-ui-tools/libs/function/index.js'

/**
 * 发送短信验证码
 * @param {Object} options 选项
 * @param {string} options.phone 手机号
 * @param {number} options.type 短信类型：1-注册，2-登录，3-重置密码
 * @param {Object} options.codeRef 验证码组件引用
 * @returns {Promise<boolean>} 是否发送成功
 */
export const sendSmsCode = async (options) => {
  const { phone, type, codeRef } = options

  // 验证手机号
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    toast('请输入正确的手机号码')
    return false
  }

  // 检查是否可以获取验证码
  if (!codeRef.canGetCode) {
    toast('倒计时结束后再发送')
    return false
  }

  try {
    uni.showLoading({
      title: '正在获取验证码'
    })

    // 调用发送验证码接口
    const data = await post('/sms/send-code', {
      phone,
      type
    })

    uni.hideLoading()
    console.log('发送验证码结果：', data)
    if (data) {
      toast('验证码已发送')
      codeRef.start()
      return true
    } else {
      toast('发送失败')
      return false
    }
  } catch (error) {
    // 错误已经在请求拦截器中处理
    return false
  }
}

/**
 * 短信验证码工具
 * 
 * 注意：推荐使用新的API管理系统 @/api
 * 新功能请使用 @/api/modules/auth.js 中的 sendSmsCode 方法
 */
export default {
  sendSmsCode
}