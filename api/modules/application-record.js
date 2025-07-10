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

/**
 * ===============================
 * 个人中心扩展模块接口
 * ===============================
 */

/**
 * 获取个人中心页面数据
 * @returns {Promise} 个人中心页面完整数据
 */
export const getUserCenterPage = () => {
  return get('/user/personal-center/page')
}

/**
 * 获取我的收藏视频
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @returns {Promise} 收藏视频列表
 */
export const getMyFavoriteVideos = (params = {}) => {
  return get('/user/personal-center/my-favorite-videos', { params })
}

/**
 * 获取我的求职记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.status - 状态筛选
 * @returns {Promise} 求职记录列表
 */
export const getMyJobApplicationRecords = (params = {}) => {
  return get('/user/personal-center/my-job-application-records', { params })
}

/**
 * 获取我的帮扶记录（个人中心版本）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.status - 状态筛选
 * @returns {Promise} 帮扶记录列表
 */
export const getPersonalCenterAssistanceRecords = (params = {}) => {
  return get('/user/personal-center/my-assistance-records', { params })
}

/**
 * ===============================
 * 缓存管理相关接口
 * ===============================
 */

/**
 * 获取缓存信息
 * @returns {Promise} 缓存信息详情
 */
export const getCacheInfo = () => {
  return get('/user/personal-center/cache-info')
}

/**
 * 清除缓存
 * @param {Object} params - 清除参数
 * @param {Array} params.cacheTypes - 要清除的缓存类型列表
 * @returns {Promise} 清除结果
 */
export const clearCache = (params = {}) => {
  return post('/user/personal-center/clear-cache', params)
}

/**
 * ===============================
 * 邀请推广相关接口
 * ===============================
 */

/**
 * 获取邀请链接
 * @returns {Promise} 邀请链接信息
 */
export const getInviteLink = () => {
  return get('/user/personal-center/invite-link')
}

/**
 * 复制邀请码
 * @returns {Promise} 邀请码信息
 */
export const copyInviteCode = () => {
  return get('/user/personal-center/copy-invite-code')
}

/**
 * 生成邀请海报
 * @param {Object} data - 海报参数
 * @param {string} data.type - 海报类型
 * @param {Object} data.customData - 自定义数据
 * @returns {Promise} 海报生成结果
 */
export const generateInvitePoster = (data) => {
  return post('/user/personal-center/generate-invite-poster', data)
}

/**
 * 获取我的团队信息
 * @returns {Promise} 团队信息概览
 */
export const getMyTeam = () => {
  return get('/user/personal-center/my-team')
}

/**
 * 获取团队成员列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.level - 层级筛选
 * @returns {Promise} 团队成员列表
 */
export const getTeamMembers = (params = {}) => {
  return get('/user/personal-center/team-members', { params })
}

/**
 * ===============================
 * 提现相关接口
 * ===============================
 */

/**
 * 获取可提现金额
 * @returns {Promise} 可提现金额信息
 */
export const getAvailableWithdrawalAmount = () => {
  return get('/user/personal-center/available-withdrawal-amount')
}

/**
 * 申请提现
 * @param {Object} data - 提现申请数据
 * @param {number} data.amount - 提现金额
 * @param {string} data.accountType - 账户类型
 * @param {string} data.accountInfo - 账户信息
 * @param {string} data.remark - 备注
 * @returns {Promise} 提现申请结果
 */
export const applyWithdrawal = (data) => {
  return post('/user/personal-center/apply-withdrawal', data)
}

/**
 * 获取提现记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.status - 状态筛选
 * @returns {Promise} 提现记录列表
 */
export const getWithdrawalRecords = (params = {}) => {
  return get('/user/personal-center/withdrawal-records', { params })
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
  getApplicationProgress,
  // 个人中心扩展模块
  getUserCenterPage,
  getMyFavoriteVideos,
  getMyJobApplicationRecords,
  getPersonalCenterAssistanceRecords,
  // 缓存管理
  getCacheInfo,
  clearCache,
  // 邀请推广
  getInviteLink,
  copyInviteCode,
  generateInvitePoster,
  getMyTeam,
  getTeamMembers,
  // 提现相关
  getAvailableWithdrawalAmount,
  applyWithdrawal,
  getWithdrawalRecords
}