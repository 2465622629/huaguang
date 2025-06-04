/**
 * 请求拦截器
 * 处理请求前的统一逻辑
 */

/**
 * 通用请求拦截器
 * @param {Object} config 请求配置
 * @returns {Object} 处理后的配置
 */
const requestInterceptor = (config) => {
  // 获取token
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 获取用户信息
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo && userInfo.id) {
    config.header = {
      ...config.header,
      'X-User-Id': userInfo.id,
      'X-User-Type': userInfo.userType || 'user'
    }
  }
  
  // 添加设备信息
  const systemInfo = uni.getSystemInfoSync()
  config.header = {
    ...config.header,
    'X-Platform': systemInfo.platform,
    'X-Version': systemInfo.version,
    'X-App-Version': uni.getStorageSync('appVersion') || '1.0.0'
  }
  
  // 添加请求时间戳
  config.header = {
    ...config.header,
    'X-Timestamp': Date.now().toString()
  }
  
  // 处理GET请求参数
  if (config.method === 'GET' && config.data) {
    const params = new URLSearchParams()
    Object.keys(config.data).forEach(key => {
      if (config.data[key] !== undefined && config.data[key] !== null) {
        params.append(key, config.data[key])
      }
    })
    const queryString = params.toString()
    if (queryString) {
      config.url += (config.url.includes('?') ? '&' : '?') + queryString
    }
    delete config.data
  }
  
  console.log('请求拦截器 - 请求配置：', config)
  return config
}

/**
 * 文件上传请求拦截器
 * @param {Object} config 上传配置
 * @returns {Object} 处理后的配置
 */
const uploadInterceptor = (config) => {
  // 获取token
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 获取用户信息
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo && userInfo.id) {
    config.header = {
      ...config.header,
      'X-User-Id': userInfo.id,
      'X-User-Type': userInfo.userType || 'user'
    }
  }
  
  // 文件上传不需要设置Content-Type，让浏览器自动设置
  delete config.header['Content-Type']
  
  console.log('上传拦截器 - 上传配置：', config)
  return config
}

export default {
  request: requestInterceptor,
  upload: uploadInterceptor
}