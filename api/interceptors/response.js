/**
 * 响应拦截器
 * 处理响应数据的统一逻辑
 */

import { errorCodes } from '../config.js'

/**
 * 通用响应拦截器
 * @param {Object} response 响应对象
 * @returns {any} 处理后的数据
 */
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  console.log('响应拦截器 - 响应数据：', response)
  
  // HTTP状态码检查
  if (statusCode === 200) {
    // 检查业务状态码
    if (data.code === errorCodes.SUCCESS) {
      return data.data
    } else {
      // 业务错误处理
      handleBusinessError(data)
      return Promise.reject({
        code: data.code,
        message: data.message || '请求失败',
        data: data.data
      })
    }
  } else {
    // HTTP错误处理
    handleHttpError(statusCode)
    return Promise.reject({
      code: statusCode,
      message: getHttpErrorMessage(statusCode),
      statusCode
    })
  }
}

/**
 * 文件上传响应拦截器
 * @param {Object} response 上传响应对象
 * @returns {any} 处理后的数据
 */
const uploadResponseInterceptor = (response) => {
  const { statusCode, data } = response
  console.log('上传响应拦截器 - 响应数据：', response)
  
  if (statusCode === 200) {
    try {
      const result = typeof data === 'string' ? JSON.parse(data) : data
      if (result.code === errorCodes.SUCCESS) {
        return result.data
      } else {
        handleBusinessError(result)
        return Promise.reject({
          code: result.code,
          message: result.message || '上传失败'
        })
      }
    } catch (error) {
      console.error('解析上传响应数据失败：', error)
      uni.showToast({
        title: '解析响应数据失败',
        icon: 'none'
      })
      return Promise.reject({
        code: errorCodes.SERVER_ERROR,
        message: '解析响应数据失败'
      })
    }
  } else {
    handleHttpError(statusCode)
    return Promise.reject({
      code: statusCode,
      message: getHttpErrorMessage(statusCode),
      statusCode
    })
  }
}

/**
 * 错误处理拦截器
 * @param {Object} error 错误对象
 * @returns {Object} 标准化的错误对象
 */
const errorInterceptor = (error) => {
  console.error('请求错误：', error)
  
  // 网络错误
  if (!error.statusCode) {
    uni.showToast({
      title: '网络连接失败，请检查网络',
      icon: 'none'
    })
    return {
      code: errorCodes.NETWORK_ERROR,
      message: '网络连接失败',
      error
    }
  }
  
  // 超时错误
  if (error.errMsg && error.errMsg.includes('timeout')) {
    uni.showToast({
      title: '请求超时，请稍后重试',
      icon: 'none'
    })
    return {
      code: errorCodes.TIMEOUT,
      message: '请求超时',
      error
    }
  }
  
  return error
}

/**
 * 处理业务错误
 * @param {Object} data 响应数据
 */
const handleBusinessError = (data) => {
  const { code, message } = data
  
  switch (code) {
    case errorCodes.UNAUTHORIZED:
      // 未授权，清除token并跳转登录
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.showToast({
        title: message || '登录已过期，请重新登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }, 1500)
      break
      
    case errorCodes.FORBIDDEN:
      uni.showToast({
        title: message || '权限不足',
        icon: 'none'
      })
      break
      
    case errorCodes.NOT_FOUND:
      uni.showToast({
        title: message || '请求的资源不存在',
        icon: 'none'
      })
      break
      
    default:
      if (message) {
        uni.showToast({
          title: message,
          icon: 'none'
        })
      }
      break
  }
}

/**
 * 处理HTTP错误
 * @param {number} statusCode HTTP状态码
 */
const handleHttpError = (statusCode) => {
  const message = getHttpErrorMessage(statusCode)
  uni.showToast({
    title: message,
    icon: 'none'
  })
}

/**
 * 获取HTTP错误信息
 * @param {number} statusCode HTTP状态码
 * @returns {string} 错误信息
 */
const getHttpErrorMessage = (statusCode) => {
  switch (statusCode) {
    case 400:
      return '请求参数错误'
    case 401:
      return '未授权访问'
    case 403:
      return '禁止访问'
    case 404:
      return '请求地址不存在'
    case 405:
      return '请求方法不允许'
    case 408:
      return '请求超时'
    case 500:
      return '服务器内部错误'
    case 502:
      return '网关错误'
    case 503:
      return '服务不可用'
    case 504:
      return '网关超时'
    default:
      return '网络错误，请稍后重试'
  }
}

export default {
  response: responseInterceptor,
  upload: uploadResponseInterceptor,
  error: errorInterceptor
}