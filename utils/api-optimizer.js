/**
 * 华光APP - API性能优化工具类
 * 统一管理API缓存、重试、错误处理等性能优化功能
 */

class ApiOptimizer {
  constructor(options = {}) {
    // 配置参数
    this.config = {
      // 重试配置
      maxRetries: options.maxRetries || 3,
      baseDelay: options.baseDelay || 1000,
      maxDelay: options.maxDelay || 8000,
      backoffFactor: options.backoffFactor || 2,
      
      // 缓存配置
      cacheExpiry: options.cacheExpiry || 5 * 60 * 1000, // 5分钟
      enableCache: options.enableCache !== false,
      maxCacheSize: options.maxCacheSize || 100,
      
      // 并发控制
      maxConcurrent: options.maxConcurrent || 5,
      
      // 超时配置
      defaultTimeout: options.defaultTimeout || 10000,
      
      // 日志配置
      enableLogging: options.enableLogging !== false,
      logPrefix: options.logPrefix || '[API优化器]'
    }
    
    // 缓存存储
    this.cache = new Map()
    this.cacheTimestamps = new Map()
    
    // 并发控制
    this.pendingRequests = new Map()
    this.requestQueue = []
    this.activeRequests = 0
    
    // 统计信息
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      retryCount: 0,
      errorCount: 0,
      avgResponseTime: 0
    }
  }
  
  /**
   * 智能API调用 - 集成所有优化策略
   * @param {Function} apiCall - API调用函数
   * @param {Object} options - 调用选项
   * @returns {Promise} API响应
   */
  async call(apiCall, options = {}) {
    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(apiCall, options)
    const config = { ...this.config, ...options }
    
    try {
      this.stats.totalRequests++
      this.log('开始API调用', { cacheKey, config })
      
      // 1. 缓存检查
      if (config.enableCache) {
        const cachedResult = this.getFromCache(cacheKey)
        if (cachedResult) {
          this.stats.cacheHits++
          this.log('使用缓存数据', { cacheKey })
          return cachedResult
        }
      }
      
      // 2. 并发控制
      await this.waitForSlot()
      
      // 3. 重复请求去重
      if (this.pendingRequests.has(cacheKey)) {
        this.log('等待重复请求完成', { cacheKey })
        return await this.pendingRequests.get(cacheKey)
      }
      
      // 4. 执行API调用（带重试机制）
      const requestPromise = this.executeWithRetry(apiCall, config)
      this.pendingRequests.set(cacheKey, requestPromise)
      this.activeRequests++
      
      try {
        const result = await requestPromise
        
        // 5. 缓存结果
        if (config.enableCache && result) {
          this.setToCache(cacheKey, result, config.cacheExpiry)
        }
        
        // 6. 更新统计
        const responseTime = Date.now() - startTime
        this.updateStats(responseTime, true)
        
        this.log('API调用成功', { cacheKey, responseTime })
        return result
        
      } finally {
        this.pendingRequests.delete(cacheKey)
        this.activeRequests--
        this.processQueue()
      }
      
    } catch (error) {
      this.stats.errorCount++
      this.updateStats(Date.now() - startTime, false)
      this.log('API调用失败', { cacheKey, error: error.message })
      throw error
    }
  }
  
  /**
   * 智能指数退避重试机制
   * @param {Function} apiCall - API调用函数
   * @param {Object} config - 配置参数
   * @param {number} retryCount - 当前重试次数
   * @returns {Promise} API响应
   */
  async executeWithRetry(apiCall, config, retryCount = 0) {
    try {
      // 超时控制
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API请求超时')), config.defaultTimeout)
      })
      
      const result = await Promise.race([apiCall(), timeoutPromise])
      return result
      
    } catch (error) {
      if (retryCount < config.maxRetries && this.shouldRetry(error)) {
        this.stats.retryCount++
        
        // 计算延迟时间：指数退避 + 随机抖动
        const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, retryCount)
        const randomJitter = Math.random() * 1000 // 0-1秒随机抖动
        const delay = Math.min(exponentialDelay + randomJitter, config.maxDelay)
        
        this.log(`API调用失败，${Math.round(delay)}ms后进行第${retryCount + 1}次重试`, {
          error: error.message,
          retryCount: retryCount + 1,
          maxRetries: config.maxRetries
        })
        
        await this.sleep(delay)
        return this.executeWithRetry(apiCall, config, retryCount + 1)
      }
      
      throw this.enhanceError(error, retryCount)
    }
  }
  
  /**
   * 智能缓存管理
   */
  getFromCache(key) {
    if (!this.cache.has(key)) return null
    
    const timestamp = this.cacheTimestamps.get(key)
    if (!timestamp || Date.now() - timestamp > this.config.cacheExpiry) {
      this.cache.delete(key)
      this.cacheTimestamps.delete(key)
      return null
    }
    
    return this.cache.get(key)
  }
  
  setToCache(key, value, expiry = this.config.cacheExpiry) {
    // LRU缓存清理
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
      this.cacheTimestamps.delete(oldestKey)
    }
    
    this.cache.set(key, value)
    this.cacheTimestamps.set(key, Date.now())
  }
  
  /**
   * 并发控制
   */
  async waitForSlot() {
    if (this.activeRequests >= this.config.maxConcurrent) {
      return new Promise(resolve => {
        this.requestQueue.push(resolve)
      })
    }
  }
  
  processQueue() {
    if (this.requestQueue.length > 0 && this.activeRequests < this.config.maxConcurrent) {
      const resolve = this.requestQueue.shift()
      resolve()
    }
  }
  
  /**
   * 错误分类和增强
   */
  shouldRetry(error) {
    // 网络错误、超时错误、5xx服务器错误可以重试
    if (error.message.includes('网络') || 
        error.message.includes('timeout') ||
        error.message.includes('超时') ||
        error.code >= 500) {
      return true
    }
    
    // 401、403、404等客户端错误不重试
    if (error.code >= 400 && error.code < 500) {
      return false
    }
    
    return true
  }
  
  enhanceError(error, retryCount) {
    const enhancedError = new Error(error.message)
    enhancedError.originalError = error
    enhancedError.retryCount = retryCount
    enhancedError.timestamp = Date.now()
    enhancedError.errorType = this.classifyError(error)
    enhancedError.canRetry = this.shouldRetry(error)
    
    return enhancedError
  }
  
  classifyError(error) {
    if (error.message.includes('网络') || error.message.includes('Network')) {
      return 'NETWORK_ERROR'
    }
    if (error.message.includes('timeout') || error.message.includes('超时')) {
      return 'TIMEOUT_ERROR'
    }
    if (error.code === 401) {
      return 'AUTH_ERROR'
    }
    if (error.code === 403) {
      return 'PERMISSION_ERROR'
    }
    if (error.code === 404) {
      return 'NOT_FOUND_ERROR'
    }
    if (error.code >= 500) {
      return 'SERVER_ERROR'
    }
    return 'UNKNOWN_ERROR'
  }
  
  /**
   * 批量API调用优化
   * @param {Array} apiCalls - API调用数组
   * @param {Object} options - 选项
   * @returns {Promise} 批量结果
   */
  async batchCall(apiCalls, options = {}) {
    const { 
      concurrent = 3, 
      failFast = false,
      timeout = 30000 
    } = options
    
    const results = []
    const errors = []
    
    // 分批并发执行
    for (let i = 0; i < apiCalls.length; i += concurrent) {
      const batch = apiCalls.slice(i, i + concurrent)
      const batchPromises = batch.map(async (apiCall, index) => {
        try {
          const result = await this.call(apiCall, options)
          return { index: i + index, success: true, data: result }
        } catch (error) {
          const errorResult = { index: i + index, success: false, error }
          if (failFast) throw error
          return errorResult
        }
      })
      
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            results[result.value.index] = result.value.data
          } else {
            errors.push(result.value)
          }
        } else {
          errors.push({ error: result.reason })
        }
      })
    }
    
    return { results, errors, stats: this.getStats() }
  }
  
  /**
   * 预热缓存 - 预加载常用数据
   * @param {Array} preloadConfigs - 预加载配置
   */
  async warmupCache(preloadConfigs) {
    this.log('开始缓存预热', { count: preloadConfigs.length })
    
    const warmupPromises = preloadConfigs.map(async (config) => {
      try {
        await this.call(config.apiCall, { 
          ...config.options,
          enableCache: true,
          priority: 'low' 
        })
        this.log('缓存预热成功', { key: config.key })
      } catch (error) {
        this.log('缓存预热失败', { key: config.key, error: error.message })
      }
    })
    
    await Promise.allSettled(warmupPromises)
    this.log('缓存预热完成')
  }
  
  /**
   * 工具方法
   */
  generateCacheKey(apiCall, options) {
    const funcStr = apiCall.toString()
    const optionsStr = JSON.stringify(options.params || {})
    return `api_${this.hashCode(funcStr + optionsStr)}`
  }
  
  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转为32位整数
    }
    return Math.abs(hash)
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  log(message, data = {}) {
    if (this.config.enableLogging) {
      console.log(`${this.config.logPrefix} ${message}`, data)
    }
  }
  
  /**
   * 统计和监控
   */
  updateStats(responseTime, success) {
    if (success) {
      this.stats.avgResponseTime = (
        (this.stats.avgResponseTime * (this.stats.totalRequests - 1) + responseTime) / 
        this.stats.totalRequests
      )
    }
  }
  
  getStats() {
    return {
      ...this.stats,
      cacheHitRate: this.stats.totalRequests ? 
        (this.stats.cacheHits / this.stats.totalRequests * 100).toFixed(2) + '%' : '0%',
      errorRate: this.stats.totalRequests ? 
        (this.stats.errorCount / this.stats.totalRequests * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length
    }
  }
  
  /**
   * 清理和重置
   */
  clearCache() {
    this.cache.clear()
    this.cacheTimestamps.clear()
    this.log('缓存已清理')
  }
  
  resetStats() {
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      retryCount: 0,
      errorCount: 0,
      avgResponseTime: 0
    }
    this.log('统计已重置')
  }
  
  destroy() {
    this.clearCache()
    this.pendingRequests.clear()
    this.requestQueue.length = 0
    this.log('API优化器已销毁')
  }
}

/**
 * 华光APP专用配置的API优化器实例
 */
export const huaguangApiOptimizer = new ApiOptimizer({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  backoffFactor: 2,
  cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
  maxConcurrent: 5,
  enableLogging: true,
  logPrefix: '[华光API优化器]'
})

/**
 * 便捷方法 - 优化后的API调用
 * @param {Function} apiCall - API调用函数
 * @param {Object} options - 选项
 * @returns {Promise} API响应
 */
export const optimizedApiCall = (apiCall, options = {}) => {
  return huaguangApiOptimizer.call(apiCall, options)
}

/**
 * 批量API调用
 * @param {Array} apiCalls - API调用数组
 * @param {Object} options - 选项
 * @returns {Promise} 批量结果
 */
export const batchApiCall = (apiCalls, options = {}) => {
  return huaguangApiOptimizer.batchCall(apiCalls, options)
}

/**
 * 错误处理增强器
 * @param {Error} error - 原始错误
 * @returns {Object} 增强后的错误信息
 */
export const enhanceApiError = (error) => {
  return {
    type: huaguangApiOptimizer.classifyError(error),
    message: error.message,
    canRetry: huaguangApiOptimizer.shouldRetry(error),
    timestamp: Date.now(),
    userFriendlyMessage: getUserFriendlyErrorMessage(error)
  }
}

/**
 * 获取用户友好的错误信息
 * @param {Error} error - 错误对象
 * @returns {string} 用户友好的错误信息
 */
function getUserFriendlyErrorMessage(error) {
  const errorType = huaguangApiOptimizer.classifyError(error)
  
  switch (errorType) {
    case 'NETWORK_ERROR':
      return '网络连接异常，请检查网络设置后重试'
    case 'TIMEOUT_ERROR':
      return '请求超时，请稍后重试'
    case 'AUTH_ERROR':
      return '登录已过期，请重新登录'
    case 'PERMISSION_ERROR':
      return '权限不足，无法访问此功能'
    case 'NOT_FOUND_ERROR':
      return '请求的资源不存在'
    case 'SERVER_ERROR':
      return '服务器繁忙，请稍后重试'
    default:
      return '操作失败，请稍后重试'
  }
}

// 导出默认实例和工具类
export default ApiOptimizer
export { ApiOptimizer } 