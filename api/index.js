/**
 * API统一管理入口
 * 集中管理所有API接口
 */

// 导入配置和请求工具
import config from './config.js'
import request from './request.js'

// 导入拦截器
import requestInterceptors from './interceptors/request.js'
import responseInterceptors from './interceptors/response.js'

// 导入各业务模块API
import authApi from './modules/auth.js'
import userApi from './modules/user.js'
import lawyerApi from './modules/lawyer.js'
import psychologistApi from './modules/psychologist.js'
import chatApi from './modules/chat.js'
import enterpriseApi from './modules/enterprise.js'
import commonApi from './modules/common.js'

// 统一导出所有API
export {
  config,
  request,
  requestInterceptors,
  responseInterceptors,
  authApi,
  userApi,
  lawyerApi,
  psychologistApi,
  chatApi,
  enterpriseApi,
  commonApi
}

// 默认导出
export default {
  config,
  request,
  interceptors: {
    request: requestInterceptors,
    response: responseInterceptors
  },
  auth: authApi,
  user: userApi,
  lawyer: lawyerApi,
  psychologist: psychologistApi,
  chat: chatApi,
  enterprise: enterpriseApi,
  common: commonApi
}