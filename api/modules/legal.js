/**
 * 法律服务相关API
 * 包含法律咨询、律师信息、法律文书、案例等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 获取法律咨询律师列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.size] 每页数量
 * @param {string} [params.category] 服务分类
 * @returns {Promise} 法律咨询律师列表
 */
export const getLegalConsultationLawyers = (params) => {
  return get('/legal/consultation', params)
}

/**
 * 获取法律帮助主页数据
 * @param {Object} params 查询参数
 * @param {string} [params.userType] 用户类型
 * @returns {Promise} 法律帮助主页数据
 */
export const getLegalHomeData = (params = {}) => {
  return get('/legal/home', params)
}

/**
 * 获取律师详情信息
 * @param {string} lawyerId 律师ID
 * @returns {Promise} 律师详情
 */
export const getLawyerDetail = (lawyerId) => {
  return get(`/legal/lawyers/${lawyerId}`)
}

/**
 * 创建法律咨询订单
 * @param {Object} data 订单数据
 * @param {string} data.lawyerId 律师ID
 * @param {string} data.serviceType 服务类型
 * @param {string} data.consultationType 咨询类型
 * @param {string} data.description 问题描述
 * @param {number} data.amount 金额
 * @param {string} [data.contactPhone] 联系电话
 * @returns {Promise} 订单结果
 */
export const createLegalConsultationOrder = (data) => {
  return post('/legal/consultation/orders', data)
}

/**
 * 获取法律咨询订单详情
 * @param {string} orderNo 订单号
 * @returns {Promise} 订单详情
 */
export const getLegalOrderDetail = (orderNo) => {
  return get(`/legal/orders/${orderNo}/detail`)
}

/**
 * 获取法律文书列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.size] 每页数量
 * @param {string} [params.status] 状态筛选
 * @param {string} [params.type] 类型筛选
 * @param {string} [params.keyword] 关键词搜索
 * @returns {Promise} 法律文书列表
 */
export const getLegalDocuments = (params) => {
  return get('/user/application-record/legal-documents', params)
}

/**
 * 获取法律文书详情
 * @param {string} documentId 文书ID
 * @returns {Promise} 文书详情
 */
export const getLegalDocumentDetail = (documentId) => {
  return get(`/legal/documents/${documentId}`)
}

/**
 * 下载法律文书
 * @param {string} documentId 文书ID
 * @returns {Promise} 下载结果
 */
export const downloadLegalDocument = (documentId) => {
  return get(`/legal/documents/${documentId}/download`)
}

/**
 * 下载法律模板
 * @param {string} templateId 模板ID
 * @returns {Promise} 下载结果
 */
export const downloadLegalTemplate = (templateId) => {
  return get(`/legal/templates/${templateId}/download`)
}

/**
 * 获取法律文书审核列表
 * @param {Object} params 查询参数
 * @param {string} [params.status] 状态筛选
 * @param {number} [params.page] 页码
 * @param {number} [params.size] 每页数量
 * @returns {Promise} 审核列表
 */
export const getLegalDocumentReviews = (params) => {
  return get('/lawyer/workspace/documents/review', params)
}

/**
 * 审核法律文书
 * @param {Object} data 审核数据
 * @param {string} data.documentId 文书ID
 * @param {string} data.status 审核状态
 * @param {string} [data.comment] 审核意见
 * @returns {Promise} 审核结果
 */
export const reviewLegalDocument = (data) => {
  return post('/legal/documents/review', data)
}

/**
 * 获取帮扶案例列表
 * @param {Object} params 查询参数
 * @param {number} [params.limit] 限制数量
 * @returns {Promise} 案例列表
 */
export const getAssistanceCases = (params) => {
  return get('/user/statistics/assistance-cases', params)
}

/**
 * 获取咨询订单页面
 * @param {string} lawyerId 律师ID
 * @returns {Promise} 咨询订单页面数据
 */
export const getLegalConsultationOrderPage = (lawyerId) => {
  return get(`/legal/consultation/order/${lawyerId}`)
}

/**
 * 支付并提交咨询订单
 * @param {Object} data 支付数据
 * @returns {Promise} 支付结果
 */
export const payLegalOrder = (data) => {
  return post('/legal/orders/pay', data)
}

// 导出所有法律服务相关API
export default {
  getLegalConsultationLawyers,
  getLegalHomeData,
  getLawyerDetail,
  createLegalConsultationOrder,
  getLegalOrderDetail,
  getLegalDocuments,
  getLegalDocumentDetail,
  downloadLegalDocument,
  downloadLegalTemplate,
  getLegalDocumentReviews,
  reviewLegalDocument,
  getAssistanceCases,
  getLegalConsultationOrderPage,
  payLegalOrder
}