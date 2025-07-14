/**
 * 用户管理相关API
 * 包含用户信息、个人资料、邀请功能、订单管理等功能
 */

import { get, post, put, del, upload } from '../request.js'

/**
 * 获取当前用户信息
 * @returns {Promise} 用户信息
 */
export const getCurrentUser = () => {
  return get('/user/profile')
}

/**
 * 更新用户信息
 * @param {Object} data 用户信息
 * @param {string} [data.nickname] 昵称
 * @param {string} [data.realName] 真实姓名
 * @param {string} [data.email] 邮箱
 * @param {string} [data.phone] 手机号
 * @param {string} [data.gender] 性别
 * @param {string} [data.birthDate] 生日
 * @param {string} [data.bio] 个人简介
 * @param {string} [data.address] 地址
 * @param {string} [data.wechat] 微信号
 * @param {string} [data.qq] QQ号
 * @param {string} [data.educationLevel] 教育水平
 * @param {string} [data.workExperience] 工作经验
 * @param {string} [data.skills] 技能
 * @param {string} [data.parentContact] 父母联系方式
 * @returns {Promise} 更新结果
 */
export const updateProfile = (data) => {
  return put('/user/profile', data)
}

/**
 * 修改密码
 * @param {Object} data 密码数据
 * @param {string} data.currentPassword 当前密码
 * @param {string} data.newPassword 新密码
 * @param {string} data.confirmPassword 确认新密码
 * @returns {Promise} 修改结果
 */
export const changePassword = (data) => {
  return post('/user/change-password', data)
}

/**
 * 上传用户头像
 * @param {File} file 头像文件
 * @returns {Promise} 上传结果
 */
export const uploadAvatar = (file) => {
  return upload('/user/avatar', file, 'file')
}

/**
 * 获取邀请信息
 * @returns {Promise} 邀请信息
 */
export const getInviteInfo = () => {
  return get('/user/invite/info')
}

/**
 * 生成邀请海报
 * @returns {Promise} 海报URL
 */
export const generateInvitePoster = () => {
  return post('/user/invite/poster')
}

/**
 * 获取邀请统计
 * @returns {Promise} 邀请统计信息
 */
export const getInviteStats = () => {
  return get('/user/invite/stats')
}

/**
 * 删除账号
 * @returns {Promise} 删除结果
 */
export const deleteAccount = () => {
  return del('/user/account')
}

/**
 * 退出登录
 * @returns {Promise} 退出结果
 */
export const logout = () => {
  return post('/auth/logout')
}

/**
 * ===============================
 * 个人中心相关接口
 * ===============================
 */

/**
 * 获取个人中心页面数据
 * @returns {Promise} 个人中心页面数据
 */
export const getPersonalCenterPage = () => {
  return get('/user/personal-center/page')
}

/**
 * 获取我的佣金信息
 * @returns {Promise} 佣金信息
 */
export const getMyCommission = () => {
  return get('/user/personal-center/my-commission')
}

/**
 * 获取佣金记录列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @param {string} [params.status] 状态筛选
 * @returns {Promise} 佣金记录列表
 */
export const getCommissionRecords = (params) => {
  return get('/user/personal-center/commission-records', params)
}

/**
 * 申请提现
 * @param {Object} data 提现数据
 * @param {number} data.amount 提现金额
 * @param {string} [data.bankAccount] 银行账户
 * @param {string} [data.remark] 备注
 * @returns {Promise} 申请结果
 */
export const applyWithdrawal = (data) => {
  return post('/user/personal-center/apply-withdrawal', data)
}

/**
 * ===============================
 * 订单管理相关接口
 * ===============================
 */

/**
 * 查询所有类型订单
 * @param {Object} params 查询参数
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @param {string} [params.orderType] 订单类型
 * @param {string} [params.status] 订单状态
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @param {string} [params.keyword] 关键词搜索
 * @returns {Promise} 订单列表
 */
export const getAllOrders = (params) => {
  return get('/user/orders/all', params)
}

/**
 * 查询课程订单列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @param {string} [params.status] 订单状态
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @param {string} [params.keyword] 关键词搜索
 * @returns {Promise} 课程订单列表
 */
export const getCourseOrders = (params) => {
  return get('/user/orders/course', params)
}

/**
 * 创建课程订单
 * @param {Object} data 订单数据
 * @param {number} data.courseId 课程ID
 * @param {number} [data.promoCode] 优惠码
 * @returns {Promise} 创建结果
 */
export const createCourseOrder = (data) => {
  return post('/user/orders/course', data)
}

/**
 * 获取课程订单详情
 * @param {number} orderId 订单ID
 * @returns {Promise} 订单详情
 */
export const getCourseOrderDetail = (orderId) => {
  return get(`/user/orders/course/${orderId}`)
}

/**
 * 检查课程购买状态
 * @param {number} courseId 课程ID
 * @returns {Promise} 购买状态
 */
export const checkCoursePurchase = (courseId) => {
  return get(`/user/orders/course/${courseId}/check-purchase`)
}

/**
 * 取消课程订单
 * @param {number} orderId 订单ID
 * @returns {Promise} 取消结果
 */
export const cancelCourseOrder = (orderId) => {
  return put(`/user/orders/course/${orderId}/cancel`)
}

/**
 * 申请课程订单退款
 * @param {number} orderId 订单ID
 * @param {Object} data 退款数据
 * @param {string} data.reason 退款原因
 * @param {string} [data.description] 退款说明
 * @returns {Promise} 退款申请结果
 */
export const refundCourseOrder = (orderId, data) => {
  return post(`/user/orders/course/${orderId}/refund`, data)
}

/**
 * 查询援助订单列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @param {string} [params.status] 订单状态
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @param {string} [params.keyword] 关键词搜索
 * @returns {Promise} 援助订单列表
 */
export const getAssistanceOrders = (params) => {
  return get('/user/orders/assistance', params)
}

/**
 * 创建援助订单
 * @param {Object} data 订单数据
 * @param {number} data.assistanceApplicationId 援助申请ID
 * @returns {Promise} 创建结果
 */
export const createAssistanceOrder = (data) => {
  return post('/user/orders/assistance', data)
}

/**
 * 获取援助订单详情
 * @param {number} orderId 订单ID
 * @returns {Promise} 订单详情
 */
export const getAssistanceOrderDetail = (orderId) => {
  return get(`/user/orders/assistance/${orderId}`)
}

/**
 * 取消援助订单
 * @param {number} orderId 订单ID
 * @returns {Promise} 取消结果
 */
export const cancelAssistanceOrder = (orderId) => {
  return put(`/user/orders/assistance/${orderId}/cancel`)
}

/**
 * 获取订单统计信息
 * @param {Object} params 查询参数
 * @param {string} [params.type] 统计类型
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @returns {Promise} 订单统计数据
 */
export const getOrderStatistics = (params) => {
  return get('/user/orders/statistics', params)
}

// 导出所有用户相关API
export default {
  getCurrentUser,
  updateProfile,
  changePassword,
  uploadAvatar,
  getInviteInfo,
  generateInvitePoster,
  getInviteStats,
  deleteAccount,
  logout,
  // 个人中心相关
  getPersonalCenterPage,
  getMyCommission,
  getCommissionRecords,
  applyWithdrawal,
  // 订单管理相关
  getAllOrders,
  getCourseOrders,
  createCourseOrder,
  getCourseOrderDetail,
  checkCoursePurchase,
  cancelCourseOrder,
  refundCourseOrder,
  getAssistanceOrders,
  createAssistanceOrder,
  getAssistanceOrderDetail,
  cancelAssistanceOrder,
  getOrderStatistics
}