/**
 * 个人中心扩展模块 API
 * 提供用户个人中心相关的所有功能接口
 * @author AI Assistant
 * @date 2024
 */

import { get, post } from '../request.js'

/**
 * 生成邀请海报
 * 为用户生成个性化的邀请海报
 * @returns {Promise} 返回海报URL
 */
export const generateInvitePoster = () => {
  return post('/user/personal-center/generate-invite-poster')
}

/**
 * 生成推广海报
 * 生成包含邀请码的推广海报
 * @returns {Promise} 返回海报URL
 */
export const generateInvitePosterGeneral = () => {
  return post('/user/invite/poster')
}

/**
 * 获取邀请信息
 * 获取当前用户的邀请码和邀请链接等信息
 * @returns {Promise} 返回邀请信息
 */
export const getInviteInfo = () => {
  return get('/user/invite/info')
}

/**
 * 获取邀请统计
 * 获取当前用户的邀请统计信息，包括邀请人数、佣金等
 * @returns {Promise} 返回邀请统计信息
 */
export const getInviteStats = () => {
  return get('/user/invite/stats')
}

/**
 * 清除缓存
 * 清除用户的应用缓存
 * @returns {Promise} 返回清除结果
 */
export const clearCache = () => {
  return post('/user/personal-center/clear-cache')
}

/**
 * 申请提现
 * 用户申请提现佣金
 * @param {Object} withdrawalData - 提现申请数据
 * @param {number} withdrawalData.amount - 提现金额
 * @param {string} withdrawalData.withdrawalMethod - 提现方式 (alipay/wechat/bank)
 * @param {string} withdrawalData.accountInfo - 账户信息
 * @param {string} [withdrawalData.remark] - 备注
 * @returns {Promise} 返回申请结果
 */
export const applyWithdrawal = (withdrawalData) => {
  return post('/user/personal-center/apply-withdrawal', withdrawalData)
}

/**
 * 获取提现记录
 * 分页获取用户的提现记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（必需）
 * @param {number} params.size - 每页大小（必需）
 * @param {string} [params.status] - 状态筛选
 * @returns {Promise} 返回提现记录列表
 */
export const getWithdrawalRecords = (params) => {
  return get('/user/personal-center/withdrawal-records', params)
}

/**
 * 获取团队成员列表
 * 分页获取用户的团队成员列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（必需）
 * @param {number} params.size - 每页大小（必需）
 * @param {string} [params.status] - 状态筛选
 * @returns {Promise} 返回团队成员列表
 */
export const getTeamMembers = (params) => {
  return get('/user/personal-center/team-members', params)
}

/**
 * 获取个人中心页面数据
 * 获取用户个人中心主页面的所有数据
 * @returns {Promise} 返回个人中心页面数据
 */
export const getUserCenterPage = () => {
  return get('/user/personal-center/page')
}

/**
 * 获取我的团队信息
 * 获取用户的团队信息，包括邀请码、团队成员、统计数据等
 * @returns {Promise} 返回团队信息
 */
export const getMyTeam = () => {
  return get('/user/personal-center/my-team')
}

/**
 * 获取我的求职记录
 * 分页获取用户的求职申请记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（必需）
 * @param {number} params.size - 每页大小（必需）
 * @param {string} [params.status] - 状态筛选
 * @returns {Promise} 返回求职记录列表
 */
export const getMyJobApplicationRecords = (params) => {
  return get('/user/personal-center/my-job-application-records', params)
}

/**
 * 获取我的收藏视频
 * 分页获取用户收藏的视频课程
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（必需）
 * @param {number} params.size - 每页大小（必需）
 * @returns {Promise} 返回收藏视频列表
 */
export const getMyFavoriteVideos = (params) => {
  return get('/user/personal-center/my-favorite-videos', params)
}

/**
 * 获取我的佣金信息
 * 获取用户的佣金总览和记录
 * @returns {Promise} 返回佣金信息
 */
export const getMyCommission = () => {
  return get('/user/personal-center/my-commission')
}

/**
 * 获取我的帮扶记录
 * 分页获取用户的帮扶记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（必需）
 * @param {number} params.size - 每页大小（必需）
 * @param {string} [params.status] - 状态筛选
 * @returns {Promise} 返回帮扶记录列表
 */
export const getMyAssistanceRecords = (params) => {
  return get('/user/personal-center/my-assistance-records', params)
}

/**
 * 获取完整邀请链接
 * 获取用户的完整邀请链接
 * @returns {Promise} 返回邀请链接
 */
export const getInviteLink = () => {
  return get('/user/personal-center/invite-link')
}

/**
 * 获取空状态页面数据
 * 获取指定类型的空状态页面展示数据
 * @param {string} type - 空状态页面类型
 * @returns {Promise} 返回空状态页面数据
 */
export const getEmptyStateData = (type) => {
  return get(`/user/personal-center/empty-state/${type}`)
}

/**
 * 复制邀请码
 * 获取用户的邀请码用于复制
 * @returns {Promise} 返回邀请码
 */
export const copyInviteCode = () => {
  return get('/user/personal-center/copy-invite-code')
}

/**
 * 获取佣金记录
 * 分页获取用户的佣金记录
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（必需）
 * @param {number} params.size - 每页大小（必需）
 * @param {string} [params.status] - 状态筛选
 * @returns {Promise} 返回佣金记录列表
 */
export const getCommissionRecords = (params) => {
  return get('/user/personal-center/commission-records', params)
}

/**
 * 获取缓存信息
 * 获取用户的缓存大小和相关信息
 * @returns {Promise} 返回缓存信息
 */
export const getCacheInfo = () => {
  return get('/user/personal-center/cache-info')
}

/**
 * 获取可提现金额
 * 获取用户当前可提现的金额
 * @returns {Promise} 返回可提现金额信息
 */
export const getAvailableWithdrawalAmount = () => {
  return get('/user/personal-center/available-withdrawal-amount')
}

// 导出所有个人中心相关API
export default {
  generateInvitePoster,
  generateInvitePosterGeneral,
  getInviteInfo,
  getInviteStats,
  clearCache,
  applyWithdrawal,
  getWithdrawalRecords,
  getTeamMembers,
  getUserCenterPage,
  getMyTeam,
  getMyJobApplicationRecords,
  getMyFavoriteVideos,
  getMyCommission,
  getMyAssistanceRecords,
  getInviteLink,
  getEmptyStateData,
  copyInviteCode,
  getCommissionRecords,
  getCacheInfo,
  getAvailableWithdrawalAmount
}