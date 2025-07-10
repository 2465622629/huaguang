/**
 * 后台用户管理相关API
 * 包含用户列表、用户详情、状态管理、审核等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * ===============================
 * 用户管理
 * ===============================
 */

/**
 * 获取用户列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.status] 用户状态
 * @param {string} [params.userType] 用户类型
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @returns {Promise} 用户列表
 */
export const getUserList = (params = {}) => {
  return get('/admin/users', params)
}

/**
 * 获取用户详情
 * @param {number} userId 用户ID
 * @returns {Promise} 用户详情
 */
export const getUserDetail = (userId) => {
  return get(`/admin/users/${userId}`)
}

/**
 * 更新用户状态
 * @param {number} userId 用户ID
 * @param {Object} data 状态数据
 * @param {string} data.status 用户状态
 * @param {string} [data.reason] 状态变更原因
 * @returns {Promise} 更新结果
 */
export const updateUserStatus = (userId, data) => {
  return put(`/admin/users/${userId}/status`, data)
}

/**
 * 删除用户
 * @param {number} userId 用户ID
 * @returns {Promise} 删除结果
 */
export const deleteUser = (userId) => {
  return del(`/admin/users/${userId}`)
}

/**
 * 获取用户统计数据
 * @param {Object} params 查询参数
 * @param {string} [params.period] 统计周期
 * @param {string} [params.userType] 用户类型
 * @returns {Promise} 统计数据
 */
export const getUserStatistics = (params = {}) => {
  return get('/admin/users/statistics', params)
}

/**
 * ===============================
 * 律师管理
 * ===============================
 */

/**
 * 获取律师列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.status] 审核状态
 * @param {string} [params.verifyStatus] 认证状态
 * @returns {Promise} 律师列表
 */
export const getLawyerList = (params = {}) => {
  return get('/admin/users/lawyers', params)
}

/**
 * 审核律师资质
 * @param {number} lawyerId 律师ID
 * @param {Object} data 审核数据
 * @param {string} data.verifyStatus 审核状态 approved|rejected
 * @param {string} [data.verifyReason] 审核原因
 * @param {Object} [data.verifyInfo] 审核信息
 * @returns {Promise} 审核结果
 */
export const verifyLawyer = (lawyerId, data) => {
  return put(`/admin/users/lawyers/${lawyerId}/verify`, data)
}

/**
 * ===============================
 * 心理师管理
 * ===============================
 */

/**
 * 获取心理师列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.status] 审核状态
 * @param {string} [params.verifyStatus] 认证状态
 * @returns {Promise} 心理师列表
 */
export const getPsychologistList = (params = {}) => {
  return get('/admin/users/psychologists', params)
}

/**
 * 审核心理师资质
 * @param {number} psychologistId 心理师ID
 * @param {Object} data 审核数据
 * @param {string} data.verifyStatus 审核状态 approved|rejected
 * @param {string} [data.verifyReason] 审核原因
 * @param {Object} [data.verifyInfo] 审核信息
 * @returns {Promise} 审核结果
 */
export const verifyPsychologist = (psychologistId, data) => {
  return put(`/admin/users/psychologists/${psychologistId}/verify`, data)
}

/**
 * ===============================
 * 企业管理
 * ===============================
 */

/**
 * 获取企业列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.status] 审核状态
 * @param {string} [params.verifyStatus] 认证状态
 * @returns {Promise} 企业列表
 */
export const getEnterpriseList = (params = {}) => {
  return get('/admin/users/enterprises', params)
}

/**
 * 审核企业认证
 * @param {number} enterpriseId 企业ID
 * @param {Object} data 审核数据
 * @param {string} data.verifyStatus 审核状态 approved|rejected
 * @param {string} [data.verifyReason] 审核原因
 * @param {Object} [data.verifyInfo] 审核信息
 * @returns {Promise} 审核结果
 */
export const verifyEnterprise = (enterpriseId, data) => {
  return put(`/admin/users/enterprises/${enterpriseId}/verify`, data)
}

/**
 * 更新企业状态
 * @param {number} enterpriseId 企业ID
 * @param {Object} data 状态数据
 * @param {string} data.status 企业状态
 * @param {string} [data.reason] 状态变更原因
 * @returns {Promise} 更新结果
 */
export const updateEnterpriseStatus = (enterpriseId, data) => {
  return put(`/admin/users/enterprises/${enterpriseId}/status`, data)
}

/**
 * ===============================
 * 管理员管理
 * ===============================
 */

/**
 * 获取管理员列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.status] 管理员状态
 * @param {string} [params.role] 角色
 * @returns {Promise} 管理员列表
 */
export const getAdministratorList = (params = {}) => {
  return get('/admin/administrators', params)
}

/**
 * 创建管理员账号
 * @param {Object} data 管理员数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {string} data.email 邮箱
 * @param {string} data.phone 手机号
 * @param {string} data.realName 真实姓名
 * @param {string} data.role 角色
 * @returns {Promise} 创建结果
 */
export const createAdministrator = (data) => {
  return post('/admin/administrators', data)
}

/**
 * 更新管理员信息
 * @param {number} adminId 管理员ID
 * @param {Object} data 更新数据
 * @param {string} [data.email] 邮箱
 * @param {string} [data.phone] 手机号
 * @param {string} [data.realName] 真实姓名
 * @returns {Promise} 更新结果
 */
export const updateAdministrator = (adminId, data) => {
  return put(`/admin/administrators/${adminId}`, data)
}

/**
 * 删除管理员账号
 * @param {number} adminId 管理员ID
 * @returns {Promise} 删除结果
 */
export const deleteAdministrator = (adminId) => {
  return del(`/admin/administrators/${adminId}`)
}

/**
 * 更新管理员状态
 * @param {number} adminId 管理员ID
 * @param {Object} data 状态数据
 * @param {string} data.status 管理员状态
 * @param {string} [data.reason] 状态变更原因
 * @returns {Promise} 更新结果
 */
export const updateAdministratorStatus = (adminId, data) => {
  return put(`/admin/administrators/${adminId}/status`, data)
}

/**
 * 分配角色
 * @param {number} adminId 管理员ID
 * @param {Object} data 角色数据
 * @param {string} data.role 角色
 * @returns {Promise} 分配结果
 */
export const assignAdministratorRole = (adminId, data) => {
  return put(`/admin/administrators/${adminId}/role`, data)
}

/**
 * 重置密码
 * @param {number} adminId 管理员ID
 * @param {Object} data 密码数据
 * @param {string} data.newPassword 新密码
 * @returns {Promise} 重置结果
 */
export const resetAdministratorPassword = (adminId, data) => {
  return post(`/admin/administrators/${adminId}/reset-password`, data)
}

/**
 * 强制下线
 * @param {number} adminId 管理员ID
 * @returns {Promise} 强制下线结果
 */
export const forceLogoutAdministrator = (adminId) => {
  return post(`/admin/administrators/${adminId}/force-logout`)
}

/**
 * 获取登录记录
 * @param {number} adminId 管理员ID
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 登录记录
 */
export const getAdministratorLoginRecords = (adminId, params = {}) => {
  return get(`/admin/administrators/${adminId}/login-records`, params)
}

/**
 * 获取管理员统计数据
 * @returns {Promise} 统计数据
 */
export const getAdministratorStatistics = () => {
  return get('/admin/administrators/statistics')
}

/**
 * 获取在线管理员列表
 * @returns {Promise} 在线管理员列表
 */
export const getOnlineAdministrators = () => {
  return get('/admin/administrators/online')
}

// 默认导出所有方法
export default {
  // 用户管理
  getUserList,
  getUserDetail,
  updateUserStatus,
  deleteUser,
  getUserStatistics,
  // 律师管理
  getLawyerList,
  verifyLawyer,
  // 心理师管理
  getPsychologistList,
  verifyPsychologist,
  // 企业管理
  getEnterpriseList,
  verifyEnterprise,
  updateEnterpriseStatus,
  // 管理员管理
  getAdministratorList,
  createAdministrator,
  updateAdministrator,
  deleteAdministrator,
  updateAdministratorStatus,
  assignAdministratorRole,
  resetAdministratorPassword,
  forceLogoutAdministrator,
  getAdministratorLoginRecords,
  getAdministratorStatistics,
  getOnlineAdministrators
} 