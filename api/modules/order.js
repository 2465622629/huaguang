/**
 * 订单管理相关API
 * 统一处理各类订单的查询、状态管理等功能
 */

import { get, post, put } from '../request.js'

/**
 * 获取订单详情（统一接口）
 * @param {string} orderNo 订单号
 * @param {string} orderType 订单类型 legal|course|psychology
 * @returns {Promise} 订单详情
 */
export const getOrderDetail = (orderNo, orderType = 'legal') => {
  return get(`/orders/${orderNo}/detail`, { orderType })
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
 * 获取课程订单详情
 * @param {string} orderId 订单ID
 * @returns {Promise} 订单详情
 */
export const getCourseOrderDetail = (orderId) => {
  return get(`/course/orders/${orderId}/detail`)
}

/**
 * 获取心理咨询订单详情
 * @param {string} orderNo 订单号
 * @returns {Promise} 订单详情
 */
export const getPsychologyOrderDetail = (orderNo) => {
  return get(`/psychology/orders/${orderNo}/detail`)
}

/**
 * 更新订单状态
 * @param {string} orderNo 订单号
 * @param {Object} data 状态数据
 * @param {string} data.status 订单状态
 * @param {string} [data.remark] 备注
 * @returns {Promise} 更新结果
 */
export const updateOrderStatus = (orderNo, data) => {
  return put(`/orders/${orderNo}/status`, data)
}

/**
 * 获取订单支付状态
 * @param {string} orderNo 订单号
 * @returns {Promise} 支付状态
 */
export const getOrderPaymentStatus = (orderNo) => {
  return get(`/orders/${orderNo}/payment-status`)
}

/**
 * 获取用户订单列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.orderType] 订单类型
 * @param {string} [params.status] 订单状态
 * @param {string} [params.paymentStatus] 支付状态
 * @returns {Promise} 订单列表
 */
export const getUserOrders = (params) => {
  return get('/user/orders', params)
}

/**
 * 取消订单
 * @param {string} orderNo 订单号
 * @param {Object} data 取消数据
 * @param {string} data.reason 取消原因
 * @returns {Promise} 取消结果
 */
export const cancelOrder = (orderNo, data) => {
  return put(`/orders/${orderNo}/cancel`, data)
}

/**
 * 申请退款
 * @param {string} orderNo 订单号
 * @param {Object} data 退款数据
 * @param {string} data.reason 退款原因
 * @param {number} [data.amount] 退款金额
 * @returns {Promise} 退款申请结果
 */
export const applyRefund = (orderNo, data) => {
  return post(`/orders/${orderNo}/refund`, data)
}

/**
 * 确认收货/完成服务
 * @param {string} orderNo 订单号
 * @param {Object} data 确认数据
 * @param {string} [data.comment] 评价
 * @param {number} [data.rating] 评分
 * @returns {Promise} 确认结果
 */
export const confirmOrder = (orderNo, data = {}) => {
  return put(`/orders/${orderNo}/confirm`, data)
}

/**
 * 获取订单操作日志
 * @param {string} orderNo 订单号
 * @returns {Promise} 操作日志
 */
export const getOrderLogs = (orderNo) => {
  return get(`/orders/${orderNo}/logs`)
}

// 导出所有订单管理相关API
export default {
  getOrderDetail,
  getLegalOrderDetail,
  getCourseOrderDetail,
  getPsychologyOrderDetail,
  updateOrderStatus,
  getOrderPaymentStatus,
  getUserOrders,
  cancelOrder,
  applyRefund,
  confirmOrder,
  getOrderLogs
}