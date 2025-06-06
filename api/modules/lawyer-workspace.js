/**
 * 律师端工作台API
 * 包含接单设置、通知设置、提现申请、个人中心、收入统计、工作台主页等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 获取律师接单设置
 * @returns {Promise} 接单设置信息
 */
export const getOrderSettings = () => {
  return get('/lawyer/workspace/order/settings')
}

/**
 * 更新律师接单设置
 * @param {Object} data 接单设置数据
 * @param {boolean} data.acceptConsultation 是否接受新咨询
 * @param {boolean} data.isOnline 是否在线
 * @returns {Promise} 更新结果
 */
export const updateOrderSettings = (data) => {
  return put('/lawyer/workspace/order/settings', data)
}

/**
 * 获取通知设置
 * @returns {Promise} 通知设置信息
 */
export const getNotificationSettings = () => {
  return get('/lawyer/workspace/notifications/settings')
}

/**
 * 更新通知设置
 * @param {Object} data 通知设置数据
 * @param {string} data.notificationType 通知类型 (consultation, review, income, system)
 * @param {boolean} data.enabled 是否启用
 * @returns {Promise} 更新结果
 */
export const updateNotificationSettings = (data) => {
  return put('/lawyer/workspace/notifications/settings', data)
}

/**
 * 申请提现
 * @param {Object} data 提现申请数据
 * @param {number} data.amount 提现金额
 * @param {string} data.withdrawalMethod 提现方式
 * @param {string} data.accountInfo 账户信息
 * @returns {Promise} 申请结果
 */
export const applyWithdrawal = (data) => {
  return post('/lawyer/workspace/withdrawal/apply', data)
}

/**
 * 获取律师个人中心
 * @returns {Promise} 个人中心数据，包括基本信息、服务状态和业务统计
 */
export const getProfileCenter = () => {
  return get('/lawyer/workspace/profile/center')
}

/**
 * 获取收入统计
 * @returns {Promise} 收入统计数据
 */
export const getIncomeStatistics = () => {
  return get('/lawyer/workspace/income/statistics')
}

/**
 * 获取收入明细列表
 * @param {Object} params 查询参数
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @param {string} [params.serviceType] 服务类型
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 收入明细列表
 */
export const getIncomeDetailList = (params) => {
  return get('/lawyer/workspace/income/details', params)
}

/**
 * 获取律师工作台主页
 * @returns {Promise} 工作台主页数据，包括咨询信息和文书审核列表
 */
export const getWorkspaceHome = () => {
  return get('/lawyer/workspace/home')
}

/**
 * 获取法律文书审核列表
 * @param {Object} params 查询参数
 * @param {string} [params.status='all'] 审核状态
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 文书审核列表
 */
export const getDocumentReviewList = (params) => {
  return get('/lawyer/workspace/documents/review', params)
}

/**
 * 获取咨询信息管理列表
 * @param {Object} params 查询参数
 * @param {string} [params.status] 状态筛选
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 咨询信息管理列表
 */
export const getConsultationManagementList = (params) => {
  return get('/lawyer/workspace/consultations/management', params)
}

// 导出所有律师工作台相关API
export default {
  getOrderSettings,
  updateOrderSettings,
  getNotificationSettings,
  updateNotificationSettings,
  applyWithdrawal,
  getProfileCenter,
  getIncomeStatistics,
  getIncomeDetailList,
  getWorkspaceHome,
  getDocumentReviewList,
  getConsultationManagementList
}