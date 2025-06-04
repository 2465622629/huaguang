/**
 * 通用工具相关API
 * 包含文件上传、地区数据、配置信息等功能
 */

import { get, post, upload } from '../request.js'

/**
 * 上传文件
 * @param {string} filePath 文件路径
 * @param {string} businessType 业务类型
 * @param {string} [businessId] 业务ID
 * @returns {Promise} 上传结果
 */
export const uploadFile = (filePath, businessType, businessId) => {
  const url = businessId 
    ? `/upload/${businessType}/${businessId}`
    : `/upload/${businessType}`
  return upload(url, filePath, 'file')
}

/**
 * 上传图片
 * @param {string} filePath 图片路径
 * @param {string} businessType 业务类型
 * @param {string} [businessId] 业务ID
 * @returns {Promise} 上传结果
 */
export const uploadImage = (filePath, businessType, businessId) => {
  const url = businessId 
    ? `/upload/image/${businessType}/${businessId}`
    : `/upload/image/${businessType}`
  return upload(url, filePath, 'image')
}

/**
 * 上传音频
 * @param {string} filePath 音频路径
 * @param {string} businessType 业务类型
 * @param {string} [businessId] 业务ID
 * @returns {Promise} 上传结果
 */
export const uploadAudio = (filePath, businessType, businessId) => {
  const url = businessId 
    ? `/upload/audio/${businessType}/${businessId}`
    : `/upload/audio/${businessType}`
  return upload(url, filePath, 'audio')
}

/**
 * 上传视频
 * @param {string} filePath 视频路径
 * @param {string} businessType 业务类型
 * @param {string} [businessId] 业务ID
 * @returns {Promise} 上传结果
 */
export const uploadVideo = (filePath, businessType, businessId) => {
  const url = businessId 
    ? `/upload/video/${businessType}/${businessId}`
    : `/upload/video/${businessType}`
  return upload(url, filePath, 'video')
}

/**
 * 获取省份列表
 * @returns {Promise} 省份列表
 */
export const getProvinces = () => {
  return get('/common/provinces')
}

/**
 * 获取城市列表
 * @param {string} provinceCode 省份代码
 * @returns {Promise} 城市列表
 */
export const getCities = (provinceCode) => {
  return get(`/common/cities/${provinceCode}`)
}

/**
 * 获取区县列表
 * @param {string} cityCode 城市代码
 * @returns {Promise} 区县列表
 */
export const getDistricts = (cityCode) => {
  return get(`/common/districts/${cityCode}`)
}

/**
 * 获取完整地区数据
 * @returns {Promise} 地区数据
 */
export const getRegionData = () => {
  return get('/common/regions')
}

/**
 * 获取行业分类
 * @returns {Promise} 行业分类
 */
export const getIndustries = () => {
  return get('/common/industries')
}

/**
 * 获取法律专业领域
 * @returns {Promise} 专业领域
 */
export const getLegalSpecialties = () => {
  return get('/common/legal-specialties')
}

/**
 * 获取心理专业领域
 * @returns {Promise} 专业领域
 */
export const getPsychSpecialties = () => {
  return get('/common/psych-specialties')
}

/**
 * 获取应用配置
 * @returns {Promise} 应用配置
 */
export const getAppConfig = () => {
  return get('/common/app-config')
}

/**
 * 获取系统公告
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.type] 公告类型
 * @returns {Promise} 公告列表
 */
export const getAnnouncements = (params) => {
  return get('/common/announcements', params)
}

/**
 * 获取公告详情
 * @param {string} announcementId 公告ID
 * @returns {Promise} 公告详情
 */
export const getAnnouncementDetail = (announcementId) => {
  return get(`/common/announcements/${announcementId}`)
}

/**
 * 获取常见问题
 * @param {Object} params 查询参数
 * @param {string} [params.category] 分类
 * @param {string} [params.keyword] 搜索关键词
 * @returns {Promise} 常见问题
 */
export const getFAQs = (params) => {
  return get('/common/faqs', params)
}

/**
 * 获取帮助文档
 * @param {Object} params 查询参数
 * @param {string} [params.category] 分类
 * @param {string} [params.keyword] 搜索关键词
 * @returns {Promise} 帮助文档
 */
export const getHelpDocs = (params) => {
  return get('/common/help-docs', params)
}

/**
 * 获取帮助文档详情
 * @param {string} docId 文档ID
 * @returns {Promise} 文档详情
 */
export const getHelpDocDetail = (docId) => {
  return get(`/common/help-docs/${docId}`)
}

/**
 * 搜索内容
 * @param {Object} params 搜索参数
 * @param {string} params.keyword 搜索关键词
 * @param {string} [params.type] 搜索类型
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 搜索结果
 */
export const searchContent = (params) => {
  return get('/common/search', params)
}

/**
 * 获取热门搜索词
 * @returns {Promise} 热门搜索词
 */
export const getHotSearchKeywords = () => {
  return get('/common/hot-keywords')
}

/**
 * 获取版本信息
 * @returns {Promise} 版本信息
 */
export const getVersionInfo = () => {
  return get('/common/version')
}

/**
 * 检查更新
 * @param {Object} data 版本数据
 * @param {string} data.currentVersion 当前版本
 * @param {string} data.platform 平台
 * @returns {Promise} 更新信息
 */
export const checkUpdate = (data) => {
  return post('/common/check-update', data)
}

/**
 * 上报错误日志
 * @param {Object} data 错误数据
 * @param {string} data.error 错误信息
 * @param {string} data.stack 错误堆栈
 * @param {string} data.userAgent 用户代理
 * @param {string} data.url 页面URL
 * @param {Object} [data.extra] 额外信息
 * @returns {Promise} 上报结果
 */
export const reportError = (data) => {
  return post('/common/error-report', data)
}

/**
 * 上报用户行为
 * @param {Object} data 行为数据
 * @param {string} data.action 行为类型
 * @param {string} data.page 页面
 * @param {Object} [data.params] 参数
 * @param {number} [data.duration] 持续时间
 * @returns {Promise} 上报结果
 */
export const reportUserBehavior = (data) => {
  return post('/common/behavior-report', data)
}

// 导出所有通用工具相关API
export default {
  uploadFile,
  uploadImage,
  uploadAudio,
  uploadVideo,
  getProvinces,
  getCities,
  getDistricts,
  getRegionData,
  getIndustries,
  getLegalSpecialties,
  getPsychSpecialties,
  getAppConfig,
  getAnnouncements,
  getAnnouncementDetail,
  getFAQs,
  getHelpDocs,
  getHelpDocDetail,
  searchContent,
  getHotSearchKeywords,
  getVersionInfo,
  checkUpdate,
  reportError,
  reportUserBehavior
}