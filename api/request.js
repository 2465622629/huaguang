/**
 * 增强版请求工具
 * 基于原有request.js进行功能扩展
 */

import { apiConfig, errorCodes } from './config.js'
import requestInterceptors from './interceptors/request.js'
import responseInterceptors from './interceptors/response.js'

// 请求缓存
const requestCache = new Map()

// 正在进行的请求
const pendingRequests = new Map()

/**
 * 生成请求唯一标识
 * @param {Object} config 请求配置
 * @returns {string} 请求标识
 */
const generateRequestKey = (config) => {
  const { url, method, data } = config
  return `${method}:${url}:${JSON.stringify(data || {})}`
}

/**
 * 取消重复请求
 * @param {string} key 请求标识
 */
const cancelDuplicateRequest = (key) => {
  if (pendingRequests.has(key)) {
    const { abort } = pendingRequests.get(key)
    abort()
    pendingRequests.delete(key)
  }
}

/**
 * 核心请求方法
 * @param {Object} options 请求选项
 * @returns {Promise} 请求Promise
 */
const request = (options) => {
  // 生成请求配置
  const config = {
    url: options.url.startsWith('http') ? options.url : `${apiConfig.BASE_URL}${options.url}`,
    method: options.method || 'GET',
    data: options.data,
    header: {
      ...apiConfig.HEADERS,
      ...options.header
    },
    timeout: options.timeout || apiConfig.TIMEOUT,
    enableCache: options.enableCache || false,
    enableCancel: options.enableCancel !== false // 默认启用取消重复请求
  }

  // 应用请求拦截器
  const interceptedConfig = requestInterceptors.request(config)
  
  // 生成请求标识
  const requestKey = generateRequestKey(interceptedConfig)
  
  // 检查缓存
  if (config.enableCache && requestCache.has(requestKey)) {
    const cached = requestCache.get(requestKey)
    if (Date.now() - cached.timestamp < apiConfig.CACHE_TIME) {
      return Promise.resolve(cached.data)
    } else {
      requestCache.delete(requestKey)
    }
  }
  
  // 取消重复请求
  if (config.enableCancel) {
    cancelDuplicateRequest(requestKey)
  }
  
  // 创建请求Promise
  return new Promise((resolve, reject) => {
    const requestTask = uni.request({
      ...interceptedConfig,
      success: (res) => {
        try {
          // 移除pending请求
          pendingRequests.delete(requestKey)
          
          // 应用响应拦截器
          const data = responseInterceptors.response(res)
          
          // 缓存响应数据
          if (config.enableCache) {
            requestCache.set(requestKey, {
              data,
              timestamp: Date.now()
            })
          }
          
          resolve(data)
        } catch (error) {
          pendingRequests.delete(requestKey)
          reject(responseInterceptors.error(error))
        }
      },
      fail: (error) => {
        pendingRequests.delete(requestKey)
        reject(responseInterceptors.error(error))
      }
    })
    
    // 记录pending请求
    if (config.enableCancel) {
      pendingRequests.set(requestKey, {
        abort: () => requestTask.abort()
      })
    }
  })
}

// 导出请求方法
export default request

// 导出常用HTTP方法
export const get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

export const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

export const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

export const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

export const patch = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PATCH',
    data,
    ...options
  })
}

// 文件上传方法
export const upload = (url, filePath, options = {}) => {
  const config = {
    url: url.startsWith('http') ? url : `${apiConfig.BASE_URL}${url}`,
    filePath,
    name: options.name || 'file',
    formData: options.formData || {},
    header: {
      ...options.header
    }
  }
  
  // 应用请求拦截器
  const interceptedConfig = requestInterceptors.upload(config)
  
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      ...interceptedConfig,
      success: (res) => {
        try {
          const data = responseInterceptors.upload(res)
          resolve(data)
        } catch (error) {
          reject(responseInterceptors.error(error))
        }
      },
      fail: (error) => {
        reject(responseInterceptors.error(error))
      }
    })
  })
}

// 清除缓存
export const clearCache = (pattern) => {
  if (pattern) {
    // 清除匹配模式的缓存
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key)
      }
    }
  } else {
    // 清除所有缓存
    requestCache.clear()
  }
}

// 取消所有pending请求
export const cancelAllRequests = () => {
  for (const [key, { abort }] of pendingRequests) {
    abort()
  }
  pendingRequests.clear()
}