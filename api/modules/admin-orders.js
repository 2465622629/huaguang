/**
 * 后台订单管理相关API
 * 包含订单列表、订单详情、状态管理、退款处理等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * ===============================
 * 课程订单管理
 * ===============================
 */

/**
 * 查询所有课程订单
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.status] 订单状态
 * @param {string} [params.keyword] 关键词
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @returns {Promise} 课程订单列表
 */
export const getAllCourseOrders = (params = {}) => {
  return get('/admin/orders/course', params)
}

/**
 * 更新课程订单状态
 * @param {string} orderId 订单ID
 * @param {Object} data 状态数据
 * @param {string} data.status 订单状态
 * @param {string} [data.reason] 状态变更原因
 * @returns {Promise} 更新结果
 */
export const updateCourseOrderStatus = (orderId, data) => {
  return put(`/admin/orders/course/${orderId}/status`, data)
}

/**
 * 查询课程销售统计
 * @param {string} courseId 课程ID
 * @param {Object} params 查询参数
 * @param {string} [params.period] 统计周期
 * @returns {Promise} 销售统计
 */
export const getCourseOrderStatistics = (courseId, params = {}) => {
  return get(`/admin/orders/course/${courseId}/statistics`, params)
}

/**
 * 批量关闭过期订单
 * @param {Object} data 关闭数据
 * @param {number} [data.expiredDays=7] 过期天数
 * @returns {Promise} 关闭结果
 */
export const closeExpiredCourseOrders = (data = {}) => {
  return post('/admin/orders/course/close-expired', data)
}

/**
 * ===============================
 * 援助订单管理
 * ===============================
 */

/**
 * 查询待审批援助订单
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.urgencyLevel] 紧急程度
 * @returns {Promise} 待审批订单列表
 */
export const getPendingAssistanceOrders = (params = {}) => {
  return get('/admin/orders/assistance/pending', params)
}

/**
 * 查询紧急援助订单
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 紧急订单列表
 */
export const getUrgentAssistanceOrders = (params = {}) => {
  return get('/admin/orders/assistance/urgent', params)
}

/**
 * 查询超期未处理订单
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {number} [params.overdueDays=3] 超期天数
 * @returns {Promise} 超期订单列表
 */
export const getOverdueAssistanceOrders = (params = {}) => {
  return get('/admin/orders/assistance/overdue', params)
}

/**
 * 查询我审批的订单
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.status] 审批状态
 * @returns {Promise} 审批订单列表
 */
export const getMyApprovedAssistanceOrders = (params = {}) => {
  return get('/admin/orders/assistance/my-approvals', params)
}

/**
 * 审批援助订单
 * @param {string} orderId 订单ID
 * @param {Object} data 审批数据
 * @param {string} data.status 审批结果 approved|rejected
 * @param {string} [data.approvalReason] 审批原因
 * @param {number} [data.approvedAmount] 批准金额
 * @returns {Promise} 审批结果
 */
export const approveAssistanceOrder = (orderId, data) => {
  return put(`/admin/orders/assistance/${orderId}/approve`, data)
}

/**
 * 拒绝援助订单
 * @param {string} orderId 订单ID
 * @param {Object} data 拒绝数据
 * @param {string} data.rejectReason 拒绝原因
 * @returns {Promise} 拒绝结果
 */
export const rejectAssistanceOrder = (orderId, data) => {
  return put(`/admin/orders/assistance/${orderId}/reject`, data)
}

/**
 * 发放援助
 * @param {string} orderId 订单ID
 * @param {Object} data 发放数据
 * @param {number} data.disburseAmount 发放金额
 * @param {string} data.disburseMethod 发放方式
 * @param {string} [data.remarks] 备注
 * @returns {Promise} 发放结果
 */
export const disburseAssistance = (orderId, data) => {
  return put(`/admin/orders/assistance/${orderId}/disburse`, data)
}

/**
 * 更新援助订单状态
 * @param {string} orderId 订单ID
 * @param {Object} data 状态数据
 * @param {string} data.status 订单状态
 * @param {string} [data.reason] 状态变更原因
 * @returns {Promise} 更新结果
 */
export const updateAssistanceOrderStatus = (orderId, data) => {
  return put(`/admin/orders/assistance/${orderId}/status`, data)
}

/**
 * 查询援助订单统计
 * @param {Object} params 查询参数
 * @param {string} [params.period] 统计周期
 * @param {string} [params.type] 统计类型
 * @returns {Promise} 统计数据
 */
export const getAssistanceOrderStatistics = (params = {}) => {
  return get('/admin/orders/assistance/statistics', params)
}

/**
 * 查询援助类型统计
 * @param {Object} params 查询参数
 * @param {string} [params.period] 统计周期
 * @returns {Promise} 类型统计
 */
export const getAssistanceTypeStatistics = (params = {}) => {
  return get('/admin/orders/assistance/type-statistics', params)
}

/**
 * ===============================
 * 咨询订单管理
 * ===============================
 */

/**
 * 获取咨询订单列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.status] 订单状态
 * @param {string} [params.orderType] 订单类型
 * @param {string} [params.keyword] 关键词
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @returns {Promise} 咨询订单列表
 */
export const getConsultationOrders = (params = {}) => {
  return get('/admin/order-management/consultation/orders', params)
}

/**
 * 获取咨询订单详情
 * @param {string} orderNo 订单号
 * @returns {Promise} 订单详情
 */
export const getConsultationOrderDetail = (orderNo) => {
  return get(`/admin/order-management/consultation/orders/${orderNo}`)
}

/**
 * 更新咨询订单状态
 * @param {string} orderNo 订单号
 * @param {Object} data 状态数据
 * @param {string} data.status 订单状态
 * @param {string} [data.reason] 状态变更原因
 * @returns {Promise} 更新结果
 */
export const updateConsultationOrderStatus = (orderNo, data) => {
  return put(`/admin/order-management/consultation/orders/${orderNo}/status`, data)
}

/**
 * 处理咨询订单退款
 * @param {string} orderNo 订单号
 * @param {Object} data 退款数据
 * @param {number} data.refundAmount 退款金额
 * @param {string} data.refundReason 退款原因
 * @returns {Promise} 退款结果
 */
export const refundConsultationOrder = (orderNo, data) => {
  return post(`/admin/order-management/consultation/orders/${orderNo}/refund`, data)
}

/**
 * ===============================
 * 提现申请管理
 * ===============================
 */

/**
 * 获取提现申请列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.status] 申请状态
 * @param {string} [params.applicationType] 申请类型
 * @param {string} [params.keyword] 关键词
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @returns {Promise} 提现申请列表
 */
export const getWithdrawalApplications = (params = {}) => {
  return get('/admin/order-management/withdrawal/applications', params)
}

/**
 * 处理提现申请
 * @param {string} withdrawalId 提现申请ID
 * @param {Object} data 处理数据
 * @param {string} data.action 处理动作 approve|reject
 * @param {string} [data.processReason] 处理原因
 * @param {number} [data.actualAmount] 实际到账金额
 * @returns {Promise} 处理结果
 */
export const processWithdrawalApplication = (withdrawalId, data) => {
  return put(`/admin/order-management/withdrawal/applications/${withdrawalId}/process`, data)
}

/**
 * ===============================
 * 佣金管理
 * ===============================
 */

/**
 * 获取佣金记录列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.commissionType] 佣金类型
 * @param {string} [params.status] 佣金状态
 * @param {string} [params.keyword] 关键词
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @returns {Promise} 佣金记录列表
 */
export const getCommissionRecords = (params = {}) => {
  return get('/admin/order-management/commission/records', params)
}

/**
 * 调整用户佣金
 * @param {Object} data 调整数据
 * @param {number} data.userId 用户ID
 * @param {number} data.adjustAmount 调整金额
 * @param {string} data.adjustType 调整类型 increase|decrease
 * @param {string} data.adjustReason 调整原因
 * @returns {Promise} 调整结果
 */
export const adjustUserCommission = (data) => {
  return post('/admin/order-management/commission/adjust', data)
}

/**
 * ===============================
 * 订单与交易管理统计
 * ===============================
 */

/**
 * 获取订单与交易管理统计数据
 * @param {Object} params 查询参数
 * @param {string} [params.period] 统计周期
 * @param {string} [params.type] 统计类型
 * @returns {Promise} 统计数据
 */
export const getOrderManagementStatistics = (params = {}) => {
  return get('/admin/order-management/statistics', params)
}

// 默认导出所有方法
export default {
  // 课程订单管理
  getAllCourseOrders,
  updateCourseOrderStatus,
  getCourseOrderStatistics,
  closeExpiredCourseOrders,
  // 援助订单管理
  getPendingAssistanceOrders,
  getUrgentAssistanceOrders,
  getOverdueAssistanceOrders,
  getMyApprovedAssistanceOrders,
  approveAssistanceOrder,
  rejectAssistanceOrder,
  disburseAssistance,
  updateAssistanceOrderStatus,
  getAssistanceOrderStatistics,
  getAssistanceTypeStatistics,
  // 咨询订单管理
  getConsultationOrders,
  getConsultationOrderDetail,
  updateConsultationOrderStatus,
  refundConsultationOrder,
  // 提现申请管理
  getWithdrawalApplications,
  processWithdrawalApplication,
  // 佣金管理
  getCommissionRecords,
  adjustUserCommission,
  // 统计数据
  getOrderManagementStatistics
} 