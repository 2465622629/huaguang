/**
 * 申请与记录模块 API
 * 包含青年帮扶基金申请、信用记录恢复申请、申请管理等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 提交青年帮扶基金申请
 * @param {Object} applicationData - 申请数据
 * @param {string} applicationData.applicationType - 申请类型 (unemployment, debt_relief, psychological_support, legal_aid)
 * @param {Object} applicationData.userInfo - 用户信息
 * @param {Array} applicationData.debtInfoList - 资产负债信息
 * @param {Array} applicationData.basicDocuments - 基本材料
 * @param {Array} applicationData.specialDocuments - 专项证明材料
 * @param {string} applicationData.applicationDescription - 申请说明
 * @returns {Promise} 提交结果
 */
export const submitYouthAssistanceApplication = (applicationData) => {
  return post('/user/application-record/youth-assistance/submit', applicationData)
}

/**
 * 提交信用记录恢复申请
 * @param {Object} applicationData - 申请数据
 * @param {Object} applicationData.overdueInfo - 信贷逾期信息
 * @param {Object} applicationData.repaymentInfo - 逾期记录补交
 * @returns {Promise} 提交结果
 */
export const submitCreditRecoveryApplication = (applicationData) => {
  return post('/user/application-record/credit-recovery/submit', applicationData)
}

/**
 * 重新提交申请
 * @param {number} applicationId - 申请ID
 * @param {Object} applicationData - 申请数据
 * @returns {Promise} 重新提交结果
 */
export const resubmitApplication = (applicationId, applicationData) => {
  return post(`/user/application-record/application/${applicationId}/resubmit`, applicationData)
}

/**
 * 取消申请
 * @param {number} applicationId - 申请ID
 * @returns {Promise} 取消结果
 */
export const cancelApplication = (applicationId) => {
  return post(`/user/application-record/application/${applicationId}/cancel`)
}

/**
 * 获取帮扶记录统计信息
 * @returns {Promise} 帮扶记录统计数据
 */
export const getAssistanceRecordStatistics = () => {
  return get('/user/application-record/statistics/assistance-records')
}

/**
 * 获取申请统计信息
 * @returns {Promise} 申请统计数据
 */
export const getApplicationStatistics = () => {
  return get('/user/application-record/statistics/applications')
}

/**
 * 获取我的帮扶记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.status - 状态筛选
 * @param {string} params.type - 类型筛选
 * @returns {Promise} 帮扶记录列表
 */
export const getMyAssistanceRecords = (params = {}) => {
  return get('/user/application-record/my-assistance-records', { params })
}

/**
 * 获取法律文书列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.status - 状态筛选
 * @param {string} params.type - 类型筛选
 * @param {string} params.keyword - 关键词搜索
 * @returns {Promise} 法律文书列表
 */
export const getLegalDocumentList = (params = {}) => {
  return get('/user/application-record/legal-documents', { params })
}

/**
 * 获取空状态页面数据
 * @param {string} type - 空状态类型
 * @returns {Promise} 空状态页面数据
 */
export const getEmptyState = (type) => {
  return get(`/user/application-record/empty-state/${type}`)
}

/**
 * 获取信用记录恢复申请详情
 * @param {number} applicationId - 申请ID
 * @returns {Promise} 申请详情
 */
export const getCreditRecoveryApplicationDetail = (applicationId) => {
  return get(`/user/application-record/credit-recovery/${applicationId}`)
}

/**
 * 获取信用记录恢复申请列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.status - 状态筛选
 * @param {string} params.keyword - 关键词搜索
 * @returns {Promise} 申请列表
 */
export const getCreditRecoveryApplicationList = (params = {}) => {
  return get('/user/application-record/credit-recovery/list', { params })
}

/**
 * 检查用户是否可以申请指定类型的帮扶
 * @param {string} applicationType - 申请类型
 * @returns {Promise} 检查结果
 */
export const checkAssistanceEligibility = (applicationType) => {
  return get(`/user/application-record/can-apply/${applicationType}`)
}

/**
 * 获取用户的所有申请记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.status - 状态筛选
 * @param {string} params.type - 类型筛选
 * @param {string} params.keyword - 关键词搜索
 * @returns {Promise} 申请记录列表
 */
export const getAllApplicationRecords = (params = {}) => {
  return get('/user/application-record/applications', { params })
}

/**
 * 获取指定申请的详细信息
 * @param {number} applicationId - 申请ID
 * @returns {Promise} 申请详情
 */
export const getApplicationDetail = (applicationId) => {
  return get(`/user/application-record/application/${applicationId}`)
}

/**
 * 删除指定的申请记录
 * @param {number} applicationId - 申请ID
 * @returns {Promise} 删除结果
 */
export const deleteApplication = (applicationId) => {
  return del(`/user/application-record/application/${applicationId}`)
}

/**
 * 获取指定申请的进度信息
 * @param {number} applicationId - 申请ID
 * @returns {Promise} 申请进度信息
 */
export const getApplicationProgress = (applicationId) => {
  return get(`/user/application-record/application/${applicationId}/progress`)
}

// 默认导出所有接口
export default {
  submitYouthAssistanceApplication,
  submitCreditRecoveryApplication,
  resubmitApplication,
  cancelApplication,
  getAssistanceRecordStatistics,
  getApplicationStatistics,
  getMyAssistanceRecords,
  getLegalDocumentList,
  getEmptyState,
  getCreditRecoveryApplicationDetail,
  getCreditRecoveryApplicationList,
  checkAssistanceEligibility,
  getAllApplicationRecords,
  getApplicationDetail,
  deleteApplication,
  getApplicationProgress
}