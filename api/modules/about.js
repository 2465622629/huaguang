import { get, post } from '../request.js'

/**
 * 提交用户反馈
 * @param {Object} params - 反馈参数
 * @param {string} params.content - 反馈内容
 * @param {string} params.feedbackType - 反馈类型 (suggestion|bug|complaint|praise)
 * @param {string} params.contactInfo - 联系方式
 * @param {number} [params.userId] - 用户ID（可选）
 * @returns {Promise} 提交结果
 */
export const submitUserFeedback = (params) => {
  return post('/about/feedback', params)
}

/**
 * 获取版本信息
 * @returns {Promise} 版本信息
 */
export const getVersionInfo = () => {
  return get('/about/version')
}

/**
 * 获取版本更新日志
 * @returns {Promise} 更新日志内容
 */
export const getUpdateLog = () => {
  return get('/about/update-log')
}

/**
 * 获取系统统计信息
 * @returns {Promise} 系统统计数据
 */
export const getSystemStatistics = () => {
  return get('/about/statistics')
}

/**
 * 获取关于页面信息
 * @returns {Promise} 关于页面完整信息
 */
export const getAboutPageInfo = () => {
  return get('/about/info')
}

/**
 * 获取帮助中心分类
 * @returns {Promise} 帮助中心分类列表
 */
export const getHelpCategories = () => {
  return get('/about/help/categories')
}

/**
 * 获取平台特色功能
 * @returns {Promise} 平台特色功能列表
 */
export const getPlatformFeatures = () => {
  return get('/about/features')
}

/**
 * 获取常见问题列表
 * @param {Object} [params] - 查询参数
 * @param {string} [params.category] - 问题分类
 * @returns {Promise} 常见问题列表
 */
export const getFAQList = (params = {}) => {
  return get('/about/faq', params)
}

/**
 * 搜索常见问题
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise} 搜索结果
 */
export const searchFAQs = (params) => {
  return get('/about/faq/search', params)
}

/**
 * 获取热门问题
 * @param {Object} [params] - 查询参数
 * @param {number} [params.limit=5] - 限制数量
 * @returns {Promise} 热门问题列表
 */
export const getHotFAQs = (params = {}) => {
  return get('/about/faq/hot', params)
}

/**
 * 获取客服联系方式
 * @returns {Promise} 客服联系信息
 */
export const getContactInfo = () => {
  return get('/about/contact')
}

/**
 * 获取公司基本信息
 * @returns {Promise} 公司信息
 */
export const getCompanyInfo = () => {
  return get('/about/company')
}

/**
 * 获取用户协议内容
 * @returns {Promise} 用户协议内容
 */
export const getUserAgreement = () => {
  return get('/about/user-agreement')
}

/**
 * 获取隐私政策内容
 * @returns {Promise} 隐私政策内容
 */
export const getPrivacyPolicy = () => {
  return get('/about/privacy-policy')
}

// 默认导出所有关于页面API
export default {
  submitUserFeedback,
  getVersionInfo,
  getUpdateLog,
  getSystemStatistics,
  getAboutPageInfo,
  getHelpCategories,
  getPlatformFeatures,
  getFAQList,
  searchFAQs,
  getHotFAQs,
  getContactInfo,
  getCompanyInfo,
  getUserAgreement,
  getPrivacyPolicy
}