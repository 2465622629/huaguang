/**
 * 微信支付相关API
 * 基于华光项目OpenAPI文档，仅包含已验证存在的微信支付接口
 */

import { get, post } from '../request.js'

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

// 导出所有微信支付相关API
export default {
  createWechatPayOrder,
  queryWechatPayOrder,
  closeWechatPayOrder,
  wechatPayNotify
}