/**
 * 律师相关API
 * 包含律师信息、服务、案例等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 获取律师列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.specialty] 专业领域
 * @param {string} [params.location] 所在地区
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.sortBy] 排序方式
 * @param {number} [params.minPrice] 最低价格
 * @param {number} [params.maxPrice] 最高价格
 * @param {number} [params.minRating] 最低评分
 * @returns {Promise} 律师列表
 */
export const getLawyers = (params) => {
  return get('/lawyers', params)
}

/**
 * 获取律师详情
 * @param {string} lawyerId 律师ID
 * @returns {Promise} 律师详情
 */
export const getLawyerDetail = (lawyerId) => {
  return get(`/lawyers/${lawyerId}`)
}

/**
 * 获取律师服务列表
 * @param {string} lawyerId 律师ID
 * @returns {Promise} 服务列表
 */
export const getLawyerServices = (lawyerId) => {
  return get(`/lawyers/${lawyerId}/services`)
}

/**
 * 获取律师案例
 * @param {string} lawyerId 律师ID
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 案例列表
 */
export const getLawyerCases = (lawyerId, params) => {
  return get(`/lawyers/${lawyerId}/cases`, params)
}

/**
 * 获取律师评价
 * @param {string} lawyerId 律师ID
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 评价列表
 */
export const getLawyerReviews = (lawyerId, params) => {
  return get(`/lawyers/${lawyerId}/reviews`, params)
}

/**
 * 预约律师咨询
 * @param {Object} data 预约数据
 * @param {string} data.lawyerId 律师ID
 * @param {string} data.serviceId 服务ID
 * @param {string} data.appointmentTime 预约时间
 * @param {string} data.consultationType 咨询类型
 * @param {string} data.description 问题描述
 * @param {string} [data.contactPhone] 联系电话
 * @returns {Promise} 预约结果
 */
export const bookLawyerConsultation = (data) => {
  return post('/lawyer/appointments', data)
}

/**
 * 获取律师预约时间段
 * @param {string} lawyerId 律师ID
 * @param {string} date 日期
 * @returns {Promise} 可预约时间段
 */
export const getLawyerAvailableSlots = (lawyerId, date) => {
  return get(`/lawyers/${lawyerId}/available-slots`, { date })
}

/**
 * 发起律师咨询
 * @param {Object} data 咨询数据
 * @param {string} data.lawyerId 律师ID
 * @param {string} data.title 咨询标题
 * @param {string} data.content 咨询内容
 * @param {string} data.category 法律类别
 * @param {Array} [data.attachments] 附件列表
 * @returns {Promise} 咨询结果
 */
export const createConsultation = (data) => {
  return post('/consultations', data)
}

/**
 * 获取咨询详情
 * @param {string} consultationId 咨询ID
 * @returns {Promise} 咨询详情
 */
export const getConsultationDetail = (consultationId) => {
  return get(`/consultations/${consultationId}`)
}

/**
 * 获取用户咨询列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.status] 状态筛选
 * @returns {Promise} 咨询列表
 */
export const getUserConsultations = (params) => {
  return get('/user/consultations', params)
}

/**
 * 评价律师服务
 * @param {Object} data 评价数据
 * @param {string} data.lawyerId 律师ID
 * @param {string} data.consultationId 咨询ID
 * @param {number} data.rating 评分
 * @param {string} data.comment 评价内容
 * @param {Array} [data.tags] 标签
 * @returns {Promise} 评价结果
 */
export const rateLawyer = (data) => {
  return post('/lawyer/reviews', data)
}

/**
 * 获取法律文章
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.category] 分类
 * @param {string} [params.keyword] 搜索关键词
 * @returns {Promise} 文章列表
 */
export const getLegalArticles = (params) => {
  return get('/legal/articles', params)
}

/**
 * 获取法律文章详情
 * @param {string} articleId 文章ID
 * @returns {Promise} 文章详情
 */
export const getLegalArticleDetail = (articleId) => {
  return get(`/legal/articles/${articleId}`)
}

/**
 * 获取法律法规
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.category] 分类
 * @param {string} [params.keyword] 搜索关键词
 * @returns {Promise} 法规列表
 */
export const getLegalRegulations = (params) => {
  return get('/legal/regulations', params)
}

/**
 * 获取法律法规详情
 * @param {string} regulationId 法规ID
 * @returns {Promise} 法规详情
 */
export const getLegalRegulationDetail = (regulationId) => {
  return get(`/legal/regulations/${regulationId}`)
}

/**
 * 获取当前登录律师的详细信息
 * @returns {Promise} 律师详细信息
 */
export const getCurrentLawyerInfo = () => {
  return get('/lawyer/profile')
}

/**
 * 更新律师详细信息
 * @param {Object} data 律师信息数据
 * @param {string} [data.name] 律师姓名
 * @param {string} [data.phone] 联系电话
 * @param {string} [data.email] 邮箱地址
 * @param {string} [data.avatar] 头像URL
 * @param {string} [data.specialty] 专业领域
 * @param {string} [data.experience] 执业经验
 * @param {string} [data.education] 教育背景
 * @param {string} [data.certification] 执业证书
 * @param {string} [data.office] 执业机构
 * @param {string} [data.address] 办公地址
 * @param {string} [data.introduction] 个人简介
 * @param {Array} [data.serviceAreas] 服务区域
 * @param {Array} [data.practiceAreas] 执业领域
 * @param {Object} [data.pricing] 收费标准
 * @returns {Promise} 更新结果
 */
export const updateLawyerInfo = (data) => {
  return put('/lawyer/profile', data)
}

/**
 * 更新律师在线状态
 * @param {Object} data 状态数据
 * @param {boolean} data.isOnline 是否在线
 * @param {string} [data.status] 状态描述 (available, busy, offline)
 * @param {string} [data.statusMessage] 状态消息
 * @returns {Promise} 更新结果
 */
export const updateLawyerOnlineStatus = (data) => {
  return put('/lawyer/status', data)
}

/**
 * 律师注册接口
 * @param {Object} data 注册数据
 * @param {string} data.name 律师姓名
 * @param {string} data.phone 手机号码
 * @param {string} data.email 邮箱地址
 * @param {string} data.password 密码
 * @param {string} data.confirmPassword 确认密码
 * @param {string} data.licenseNumber 执业证号
 * @param {string} data.lawFirm 律师事务所
 * @param {string} data.specialty 专业领域
 * @param {string} data.experience 执业年限
 * @param {string} [data.verificationCode] 验证码
 * @returns {Promise} 注册结果
 */
export const registerLawyer = (data) => {
  return post('/lawyer/register', data)
}

/**
 * 删除律师账号及相关信息
 * @param {Object} data 删除确认数据
 * @param {string} data.password 当前密码
 * @param {string} [data.reason] 删除原因
 * @param {boolean} [data.deleteAllData] 是否删除所有相关数据
 * @returns {Promise} 删除结果
 */
export const deleteLawyerAccount = (data) => {
  return del('/lawyer/account', data)
}

// 导出所有律师相关API
export default {
  getLawyers,
  getLawyerDetail,
  getLawyerServices,
  getLawyerCases,
  getLawyerReviews,
  bookLawyerConsultation,
  getLawyerAvailableSlots,
  createConsultation,
  getConsultationDetail,
  getUserConsultations,
  rateLawyer,
  getLegalArticles,
  getLegalArticleDetail,
  getLegalRegulations,
  getLegalRegulationDetail,
  // 新增的律师管理接口
  getCurrentLawyerInfo,
  updateLawyerInfo,
  updateLawyerOnlineStatus,
  registerLawyer,
  deleteLawyerAccount
}