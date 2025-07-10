/**
 * 支付相关API
 * 包含支付订单创建、状态查询、第三方支付集成等功能
 */

import { get, post, put } from '../request.js'

/**
 * 创建支付订单
 * @param {Object} data 支付数据
 * @param {string} data.orderNo 业务订单号
 * @param {string} data.orderType 订单类型
 * @param {number} data.amount 支付金额
 * @param {string} data.paymentMethod 支付方式 alipay|wechat|balance
 * @param {string} [data.subject] 支付主题
 * @param {string} [data.description] 支付描述
 * @param {string} [data.returnUrl] 支付成功返回URL
 * @param {string} [data.notifyUrl] 支付结果通知URL
 * @returns {Promise} 支付订单信息
 */
export const createPaymentOrder = (data) => {
  return post('/payment/orders', data)
}

/**
 * 获取支付订单详情
 * @param {string} paymentOrderNo 支付订单号
 * @returns {Promise} 支付订单详情
 */
export const getPaymentOrderDetail = (paymentOrderNo) => {
  return get(`/payment/orders/${paymentOrderNo}`)
}

/**
 * 查询支付状态
 * @param {string} paymentOrderNo 支付订单号
 * @returns {Promise} 支付状态
 */
export const getPaymentStatus = (paymentOrderNo) => {
  return get(`/payment/orders/${paymentOrderNo}/status`)
}

/**
 * 支付宝支付
 * @param {Object} data 支付数据
 * @param {string} data.paymentOrderNo 支付订单号
 * @param {string} [data.returnUrl] 返回URL
 * @returns {Promise} 支付宝支付信息
 */
export const alipayPayment = (data) => {
  return post('/payment/alipay', data)
}

/**
 * 微信支付
 * @param {Object} data 支付数据
 * @param {string} data.paymentOrderNo 支付订单号
 * @param {string} data.openid 用户openid
 * @returns {Promise} 微信支付信息
 */
export const wechatPayment = (data) => {
  return post('/payment/wechat', data)
}

/**
 * 余额支付
 * @param {Object} data 支付数据
 * @param {string} data.paymentOrderNo 支付订单号
 * @param {string} [data.paymentPassword] 支付密码
 * @returns {Promise} 余额支付结果
 */
export const balancePayment = (data) => {
  return post('/payment/balance', data)
}

/**
 * 处理支付回调
 * @param {Object} data 回调数据
 * @param {string} data.paymentOrderNo 支付订单号
 * @param {string} data.tradeNo 第三方交易号
 * @param {string} data.status 支付状态
 * @param {Object} [data.extra] 额外信息
 * @returns {Promise} 处理结果
 */
export const handlePaymentCallback = (data) => {
  return post('/payment/callback', data)
}

/**
 * 申请退款
 * @param {Object} data 退款数据
 * @param {string} data.paymentOrderNo 支付订单号
 * @param {number} data.refundAmount 退款金额
 * @param {string} data.refundReason 退款原因
 * @param {string} [data.refundNo] 退款单号
 * @returns {Promise} 退款申请结果
 */
export const applyPaymentRefund = (data) => {
  return post('/payment/refund', data)
}

/**
 * 查询退款状态
 * @param {string} refundNo 退款单号
 * @returns {Promise} 退款状态
 */
export const getRefundStatus = (refundNo) => {
  return get(`/payment/refund/${refundNo}/status`)
}

/**
 * 获取用户支付记录
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.paymentMethod] 支付方式
 * @param {string} [params.status] 支付状态
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @returns {Promise} 支付记录
 */
export const getUserPaymentRecords = (params) => {
  return get('/user/payment-records', params)
}

/**
 * 获取用户余额
 * @returns {Promise} 用户余额信息
 */
export const getUserBalance = () => {
  return get('/user/balance')
}

/**
 * 获取支付配置
 * @returns {Promise} 支付配置信息
 */
export const getPaymentConfig = () => {
  return get('/payment/config')
}

/**
 * 验证支付密码
 * @param {Object} data 验证数据
 * @param {string} data.paymentPassword 支付密码
 * @returns {Promise} 验证结果
 */
export const verifyPaymentPassword = (data) => {
  return post('/payment/verify-password', data)
}

/**
 * 设置支付密码
 * @param {Object} data 密码数据
 * @param {string} data.paymentPassword 新支付密码
 * @param {string} [data.oldPaymentPassword] 旧支付密码
 * @param {string} [data.verifyCode] 验证码
 * @returns {Promise} 设置结果
 */
export const setPaymentPassword = (data) => {
  return post('/payment/set-password', data)
}

/**
 * ===============================
 * 微信支付专用接口（与OpenAPI文档一致）
 * ===============================
 */

/**
 * 创建微信支付订单
 * @param {Object} data 支付订单数据
 * @param {string} data.relatedOrderId 关联订单ID
 * @param {string} data.relatedOrderType 关联订单类型
 * @param {number} data.amount 支付金额
 * @param {string} data.description 支付描述
 * @param {string} data.payType 支付类型 JSAPI|NATIVE|APP
 * @returns {Promise} 微信支付订单信息
 */
export const createWechatPayOrder = (data) => {
  return post('/user/wechat-pay/create-order', data)
}

/**
 * 查询微信支付订单
 * @param {string} outTradeNo 商户订单号
 * @returns {Promise} 支付订单信息
 */
export const queryWechatPayOrder = (outTradeNo) => {
  return get(`/user/wechat-pay/query-order/${outTradeNo}`)
}

/**
 * 关闭微信支付订单
 * @param {string} outTradeNo 商户订单号
 * @returns {Promise} 关闭结果
 */
export const closeWechatPayOrder = (outTradeNo) => {
  return post(`/user/wechat-pay/close-order/${outTradeNo}`)
}

/**
 * 微信支付回调通知处理（内部使用）
 * @param {Object} data 回调数据
 * @returns {Promise} 处理结果
 */
export const wechatPayNotify = (data) => {
  return post('/user/wechat-pay/notify', data)
}

// 导出所有支付相关API
export default {
  createPaymentOrder,
  getPaymentOrderDetail,
  getPaymentStatus,
  alipayPayment,
  wechatPayment,
  balancePayment,
  handlePaymentCallback,
  applyPaymentRefund,
  getRefundStatus,
  getUserPaymentRecords,
  getUserBalance,
  getPaymentConfig,
  verifyPaymentPassword,
  setPaymentPassword,
  // 微信支付专用接口
  createWechatPayOrder,
  queryWechatPayOrder,
  closeWechatPayOrder,
  wechatPayNotify
}