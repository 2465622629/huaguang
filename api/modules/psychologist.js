/**
 * 心理师相关API
 * 包含心理师信息、服务、咨询等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 获取心理师列表
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
 * @returns {Promise} 心理师列表
 */
export const getPsychologists = (params) => {
  return get('/psychologists', params)
}

/**
 * 获取心理师详情
 * @param {string} psychologistId 心理师ID
 * @returns {Promise} 心理师详情
 */
export const getPsychologistDetail = (psychologistId) => {
  return get(`/psychologists/${psychologistId}`)
}

/**
 * 获取心理师服务列表
 * @param {string} psychologistId 心理师ID
 * @returns {Promise} 服务列表
 */
export const getPsychologistServices = (psychologistId) => {
  return get(`/psychologists/${psychologistId}/services`)
}

/**
 * 获取心理师案例
 * @param {string} psychologistId 心理师ID
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 案例列表
 */
export const getPsychologistCases = (psychologistId, params) => {
  return get(`/psychologists/${psychologistId}/cases`, params)
}

/**
 * 获取心理师评价
 * @param {string} psychologistId 心理师ID
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 评价列表
 */
export const getPsychologistReviews = (psychologistId, params) => {
  return get(`/psychologists/${psychologistId}/reviews`, params)
}

/**
 * 预约心理咨询
 * @param {Object} data 预约数据
 * @param {string} data.psychologistId 心理师ID
 * @param {string} data.serviceId 服务ID
 * @param {string} data.appointmentTime 预约时间
 * @param {string} data.consultationType 咨询类型
 * @param {string} data.description 问题描述
 * @param {string} [data.contactPhone] 联系电话
 * @returns {Promise} 预约结果
 */
export const bookPsychologistConsultation = (data) => {
  return post('/psychologist/appointments', data)
}

/**
 * 获取心理师预约时间段
 * @param {string} psychologistId 心理师ID
 * @param {string} date 日期
 * @returns {Promise} 可预约时间段
 */
export const getPsychologistAvailableSlots = (psychologistId, date) => {
  return get(`/psychologists/${psychologistId}/available-slots`, { date })
}

/**
 * 发起心理咨询
 * @param {Object} data 咨询数据
 * @param {string} data.psychologistId 心理师ID
 * @param {string} data.title 咨询标题
 * @param {string} data.content 咨询内容
 * @param {string} data.category 心理类别
 * @param {Array} [data.attachments] 附件列表
 * @returns {Promise} 咨询结果
 */
export const createPsychConsultation = (data) => {
  return post('/psych-consultations', data)
}

/**
 * 获取心理咨询详情
 * @param {string} consultationId 咨询ID
 * @returns {Promise} 咨询详情
 */
export const getPsychConsultationDetail = (consultationId) => {
  return get(`/psych-consultations/${consultationId}`)
}

/**
 * 获取用户心理咨询列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.status] 状态筛选
 * @returns {Promise} 咨询列表
 */
export const getUserPsychConsultations = (params) => {
  return get('/user/psych-consultations', params)
}

/**
 * 评价心理师服务
 * @param {Object} data 评价数据
 * @param {string} data.psychologistId 心理师ID
 * @param {string} data.consultationId 咨询ID
 * @param {number} data.rating 评分
 * @param {string} data.comment 评价内容
 * @param {Array} [data.tags] 标签
 * @returns {Promise} 评价结果
 */
export const ratePsychologist = (data) => {
  return post('/psychologist/reviews', data)
}

/**
 * 获取心理测评列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.category] 分类
 * @returns {Promise} 测评列表
 */
export const getPsychTests = (params) => {
  return get('/psych/tests', params)
}

/**
 * 获取心理测评详情
 * @param {string} testId 测评ID
 * @returns {Promise} 测评详情
 */
export const getPsychTestDetail = (testId) => {
  return get(`/psych/tests/${testId}`)
}

/**
 * 开始心理测评
 * @param {string} testId 测评ID
 * @returns {Promise} 测评会话
 */
export const startPsychTest = (testId) => {
  return post(`/psych/tests/${testId}/start`)
}

/**
 * 提交测评答案
 * @param {Object} data 答案数据
 * @param {string} data.sessionId 会话ID
 * @param {Array} data.answers 答案列表
 * @returns {Promise} 提交结果
 */
export const submitPsychTestAnswers = (data) => {
  return post('/psych/test-answers', data)
}

/**
 * 获取测评结果
 * @param {string} sessionId 会话ID
 * @returns {Promise} 测评结果
 */
export const getPsychTestResult = (sessionId) => {
  return get(`/psych/test-results/${sessionId}`)
}

/**
 * 获取用户测评历史
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 测评历史
 */
export const getUserPsychTestHistory = (params) => {
  return get('/user/psych-test-history', params)
}

/**
 * 获取心理文章
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.category] 分类
 * @param {string} [params.keyword] 搜索关键词
 * @returns {Promise} 文章列表
 */
export const getPsychArticles = (params) => {
  return get('/psych/articles', params)
}

/**
 * 获取心理文章详情
 * @param {string} articleId 文章ID
 * @returns {Promise} 文章详情
 */
export const getPsychArticleDetail = (articleId) => {
  return get(`/psych/articles/${articleId}`)
}

/**
 * 获取当前登录心理师的详细信息
 * @returns {Promise} 心理师详细信息
 */
export const getPsychologistProfile = () => {
  return get('/psychologist/profile')
}

/**
 * 更新心理师详细信息
 * @param {Object} data 更新数据
 * @param {string} [data.licenseNumber] 执业证号
 * @param {Array} [data.specialties] 专业领域
 * @param {number} [data.experienceYears] 执业年限
 * @param {number} [data.textFee] 文字咨询费用
 * @param {number} [data.voiceFee] 语音咨询费用
 * @param {number} [data.videoFee] 视频咨询费用
 * @param {boolean} [data.acceptConsultation] 是否接受咨询
 * @param {string} [data.introduction] 个人介绍
 * @param {Array} [data.certificates] 证书信息
 * @param {string} [data.serviceAdvantages] 服务优势
 * @param {string} [data.slogan] 个人标语
 * @returns {Promise} 更新后的心理师信息
 */
export const updatePsychologistProfile = (data) => {
  return put('/psychologist/profile', data)
}

/**
 * 更新心理师在线状态
 * @param {boolean} isOnline 是否在线
 * @returns {Promise} 更新结果
 */
export const updatePsychologistOnlineStatus = (isOnline) => {
  return put('/psychologist/online-status', null, { isOnline })
}

/**
 * 心理师注册接口
 * @param {Object} data 注册数据
 * @param {string} data.realName 真实姓名
 * @param {string} data.nickname 昵称
 * @param {string} data.email 邮箱
 * @param {string} data.birthDate 出生日期
 * @param {string} data.phone 手机号
 * @param {string} data.password 密码
 * @param {string} [data.inviteCode] 邀请码
 * @param {string} data.licenseNumber 执业证号
 * @param {Array} data.specialties 专业领域
 * @param {number} data.experienceYears 执业年限
 * @param {number} data.textFee 文字咨询费用
 * @param {number} data.voiceFee 语音咨询费用
 * @param {number} data.videoFee 视频咨询费用
 * @param {string} data.introduction 个人介绍
 * @param {Array} data.certificates 证书信息
 * @param {string} data.serviceAdvantages 服务优势
 * @param {string} data.slogan 个人标语
 * @returns {Promise} 注册结果
 */
export const registerPsychologist = (data) => {
  return post('/psychologist/register', data)
}

/**
 * 删除心理师账号及相关信息
 * @returns {Promise} 删除结果
 */
export const deletePsychologistAccount = () => {
  return del('/psychologist/account')
}

// 导出所有心理师相关API
export default {
  getPsychologists,
  getPsychologistDetail,
  getPsychologistServices,
  getPsychologistCases,
  getPsychologistReviews,
  bookPsychologistConsultation,
  getPsychologistAvailableSlots,
  createPsychConsultation,
  getPsychConsultationDetail,
  getUserPsychConsultations,
  ratePsychologist,
  getPsychTests,
  getPsychTestDetail,
  startPsychTest,
  submitPsychTestAnswers,
  getPsychTestResult,
  getUserPsychTestHistory,
  getPsychArticles,
  getPsychArticleDetail,
  getPsychologistProfile,
  updatePsychologistProfile,
  updatePsychologistOnlineStatus,
  registerPsychologist,
  deletePsychologistAccount
}