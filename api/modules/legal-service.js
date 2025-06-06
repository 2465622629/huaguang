import { get, post, put, del } from '../request'

/**
 * 法律服务模块 API
 * 提供法律咨询、律师服务、法律文书等相关功能
 */

/**
 * 支付并提交咨询订单
 * @param {Object} params - 支付订单参数
 * @param {number} params.orderId - 订单ID
 * @param {string} params.paymentMethod - 支付方式
 * @param {string} params.questionDescription - 问题描述
 * @returns {Promise} 支付结果
 */
export const payAndSubmitOrder = (params = {}) => {
  return post('/legal/orders/pay', params)
}

/**
 * 审核法律文书
 * @param {Object} params - 审核参数
 * @param {number} params.documentId - 文书ID
 * @param {string} params.reviewResult - 审核结果 (approved/rejected)
 * @param {string} [params.reviewComment] - 审核意见
 * @returns {Promise} 审核结果
 */
export const reviewLegalDocument = (params = {}) => {
  return post('/legal/documents/review', params)
}

/**
 * 创建法律咨询订单
 * @param {Object} params - 订单创建参数
 * @param {number} params.lawyerId - 律师ID
 * @param {string} params.serviceType - 服务类型 (text/voice/video)
 * @param {string} params.question - 咨询问题
 * @param {string} [params.paymentMethod] - 支付方式
 * @returns {Promise} 创建的订单信息
 */
export const createConsultationOrder = (params = {}) => {
  return post('/legal/consultation/orders', params)
}

/**
 * 结束法务助理对话
 * @param {number} serviceId - 服务ID
 * @returns {Promise} 结束对话结果
 */
export const endLegalAssistantConversation = (serviceId) => {
  return post(`/legal/assistant/services/${serviceId}/end`)
}

/**
 * 下载法律模板
 * @param {number} templateId - 模板ID
 * @returns {Promise} 下载链接或文件内容
 */
export const downloadLegalTemplate = (templateId) => {
  return get(`/legal/templates/${templateId}/download`)
}

/**
 * 获取专属导师列表
 * @param {Object} params - 查询参数
 * @param {string} [params.sortBy='default'] - 排序方式
 * @param {string} [params.specialty] - 擅长领域
 * @param {string} [params.gender] - 性别
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页大小
 * @returns {Promise} 专属导师列表
 */
export const getPsychologistList = (params = {}) => {
  const { page = 1, size = 10, sortBy = 'default', ...otherParams } = params
  return get('/legal/psychologists', {
    page,
    size,
    sortBy,
    ...otherParams
  })
}

/**
 * 获取订单详情页面
 * @param {number} orderId - 订单ID
 * @returns {Promise} 订单详情页面数据
 */
export const getOrderDetailPage = (orderId) => {
  return get(`/legal/orders/${orderId}/detail`)
}

/**
 * 获取律师列表
 * @param {Object} params - 查询参数
 * @param {string} [params.filterType='all'] - 筛选类型
 * @param {string} [params.specialty] - 专业领域
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页大小
 * @returns {Promise} 律师列表
 */
export const getLawyerList = (params = {}) => {
  const { page = 1, size = 10, filterType = 'all', ...otherParams } = params
  return get('/legal/lawyers', {
    page,
    size,
    filterType,
    ...otherParams
  })
}

/**
 * 获取律师详情
 * @param {number} lawyerId - 律师ID
 * @returns {Promise} 律师详细信息
 */
export const getLawyerDetail = (lawyerId) => {
  return get(`/legal/lawyers/${lawyerId}`)
}

/**
 * 获取律师详情扩展版
 * @param {number} lawyerId - 律师ID
 * @returns {Promise} 律师详细信息扩展版
 */
export const getLawyerDetailExtended = (lawyerId) => {
  return get(`/legal/lawyers/${lawyerId}/extended`)
}

/**
 * 获取法律帮助主页数据
 * @returns {Promise} 主页所有模块数据
 */
export const getLegalHelpHome = () => {
  return get('/legal/help/home')
}

/**
 * 获取法律文书详情
 * @param {number} documentId - 文书ID
 * @returns {Promise} 法律文书详细信息
 */
export const getLegalDocumentDetail = (documentId) => {
  return get(`/legal/documents/${documentId}`)
}

/**
 * 下载法律文书
 * @param {number} documentId - 文书ID
 * @returns {Promise} 下载链接或文件内容
 */
export const downloadLegalDocument = (documentId) => {
  return get(`/legal/documents/${documentId}/download`)
}

/**
 * 获取可提供法律咨询的律师列表
 * @param {Object} params - 查询参数
 * @param {string} [params.serviceCategory] - 服务分类
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页大小
 * @returns {Promise} 可咨询律师列表
 */
export const getConsultationLawyerList = (params = {}) => {
  const { page = 1, size = 10, ...otherParams } = params
  return get('/legal/consultation/lawyers', {
    page,
    size,
    ...otherParams
  })
}

/**
 * 获取律师咨询订单页面数据
 * @param {number} lawyerId - 律师ID
 * @returns {Promise} 律师咨询订单页面数据
 */
export const getLawyerConsultationOrderPage = (lawyerId) => {
  return get(`/legal/lawyers/${lawyerId}/consultation/order`)
}

/**
 * 获取用户的法务助理服务列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页大小
 * @param {string} [params.status] - 服务状态
 * @returns {Promise} 法务助理服务列表
 */
export const getUserLegalAssistantServices = (params = {}) => {
  const { page = 1, size = 10, ...otherParams } = params
  return get('/legal/assistant/services', {
    page,
    size,
    ...otherParams
  })
}

// 默认导出所有法律服务 API
export default {
  payAndSubmitOrder,
  reviewLegalDocument,
  createConsultationOrder,
  endLegalAssistantConversation,
  downloadLegalTemplate,
  getPsychologistList,
  getOrderDetailPage,
  getLawyerList,
  getLawyerDetail,
  getLawyerDetailExtended,
  getLegalHelpHome,
  getLegalDocumentDetail,
  downloadLegalDocument,
  getConsultationLawyerList,
  getLawyerConsultationOrderPage,
  getUserLegalAssistantServices
}