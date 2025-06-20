/**
 * 搜索功能相关API
 * 包含职位搜索、企业搜索、课程搜索、搜索建议等功能
 */

import { get, post } from '../request.js'

/**
 * 记录用户的搜索行为，用于统计热门搜索
 * @param {Object} data 搜索行为数据
 * @param {string} data.keyword 搜索关键词
 * @param {string} data.type 搜索类型（job/enterprise/course/skill）
 * @param {string} [data.source] 搜索来源
 * @param {Object} [data.filters] 搜索筛选条件
 * @returns {Promise} 记录结果
 */
export const recordSearchBehavior = (data) => {
  return post('/search/behavior', data)
}

/**
 * 通过GET请求搜索职位，支持简单参数
 * @param {Object} params 搜索参数
 * @param {string} [params.q] 搜索关键词
 * @param {string} [params.location] 地区
 * @param {string} [params.salary] 薪资范围
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页数量
 * @returns {Promise} 搜索结果
 */
export const searchJobsSimple = (params = {}) => {
  return get('/search/jobs', params)
}

/**
 * 根据关键词和筛选条件搜索职位
 * @param {Object} data 搜索数据
 * @param {string} data.keyword 搜索关键词
 * @param {Object} [data.filters] 筛选条件
 * @param {string} [data.filters.location] 地区
 * @param {string} [data.filters.industry] 行业
 * @param {string} [data.filters.salary] 薪资范围
 * @param {string} [data.filters.experience] 经验要求
 * @param {string} [data.filters.education] 学历要求
 * @param {string} [data.filters.type] 工作类型
 * @param {string} [data.filters.scale] 企业规模
 * @param {Object} [data.pagination] 分页信息
 * @param {number} [data.pagination.page=1] 页码
 * @param {number} [data.pagination.pageSize=10] 每页数量
 * @param {Object} [data.sort] 排序条件
 * @param {string} [data.sort.field] 排序字段
 * @param {string} [data.sort.order] 排序方向（asc/desc）
 * @returns {Promise} 搜索结果
 */
export const searchJobsAdvanced = (data) => {
  return post('/search/jobs/advanced', data)
}

/**
 * 通过GET请求搜索企业
 * @param {Object} params 搜索参数
 * @param {string} [params.q] 搜索关键词
 * @param {string} [params.industry] 行业类型
 * @param {string} [params.scale] 企业规模
 * @param {string} [params.location] 地区
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页数量
 * @returns {Promise} 搜索结果
 */
export const searchEnterprisesSimple = (params = {}) => {
  return get('/search/enterprises', params)
}

/**
 * 根据关键词和筛选条件搜索企业
 * @param {Object} data 搜索数据
 * @param {string} data.keyword 搜索关键词
 * @param {Object} [data.filters] 筛选条件
 * @param {string} [data.filters.industry] 行业类型
 * @param {string} [data.filters.scale] 企业规模
 * @param {string} [data.filters.location] 地区
 * @param {string} [data.filters.nature] 企业性质
 * @param {string} [data.filters.financing] 融资阶段
 * @param {Object} [data.pagination] 分页信息
 * @param {number} [data.pagination.page=1] 页码
 * @param {number} [data.pagination.pageSize=10] 每页数量
 * @param {Object} [data.sort] 排序条件
 * @param {string} [data.sort.field] 排序字段
 * @param {string} [data.sort.order] 排序方向（asc/desc）
 * @returns {Promise} 搜索结果
 */
export const searchEnterprisesAdvanced = (data) => {
  return post('/search/enterprises/advanced', data)
}

/**
 * 通过GET请求搜索课程
 * @param {Object} params 搜索参数
 * @param {string} [params.q] 搜索关键词
 * @param {string} [params.category] 课程分类
 * @param {string} [params.level] 课程级别
 * @param {string} [params.price] 价格范围
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页数量
 * @returns {Promise} 搜索结果
 */
export const searchCoursesSimple = (params = {}) => {
  return get('/search/courses', params)
}

/**
 * 根据关键词和筛选条件搜索课程
 * @param {Object} data 搜索数据
 * @param {string} data.keyword 搜索关键词
 * @param {Object} [data.filters] 筛选条件
 * @param {string} [data.filters.category] 课程分类
 * @param {string} [data.filters.level] 课程级别
 * @param {string} [data.filters.price] 价格范围
 * @param {string} [data.filters.duration] 课程时长
 * @param {string} [data.filters.instructor] 讲师
 * @param {string} [data.filters.language] 语言
 * @param {Object} [data.pagination] 分页信息
 * @param {number} [data.pagination.page=1] 页码
 * @param {number} [data.pagination.pageSize=10] 每页数量
 * @param {Object} [data.sort] 排序条件
 * @param {string} [data.sort.field] 排序字段
 * @param {string} [data.sort.order] 排序方向（asc/desc）
 * @returns {Promise} 搜索结果
 */
export const searchCoursesAdvanced = (data) => {
  return post('/search/courses/advanced', data)
}

/**
 * 根据输入的关键词前缀获取搜索建议
 * @param {Object} params 查询参数
 * @param {string} params.prefix 关键词前缀
 * @param {string} [params.type] 搜索类型（job/enterprise/course/skill）
 * @param {number} [params.limit=10] 建议数量限制
 * @returns {Promise} 搜索建议列表
 */
export const getSearchSuggestions = (params) => {
  return get('/search/suggestions', params)
}

/**
 * 获取技能搜索页面的热门搜索标签
 * @param {Object} params 查询参数
 * @param {number} [params.limit=20] 标签数量限制
 * @returns {Promise} 热门技能标签列表
 */
export const getSkillHotTags = (params = {}) => {
  return get('/search/skills/hot-tags', params)
}

/**
 * 获取职位搜索页面的筛选标签和热门搜索
 * @returns {Promise} 职位搜索页面数据
 */
export const getJobSearchPageData = () => {
  return get('/search/jobs/page-data')
}

/**
 * 获取指定类型的热门搜索关键词
 * @param {Object} params 查询参数
 * @param {string} params.type 搜索类型（job/enterprise/course/skill）
 * @param {number} [params.limit=10] 关键词数量限制
 * @param {string} [params.timeRange] 时间范围（day/week/month）
 * @returns {Promise} 热门搜索关键词列表
 */
export const getHotSearchKeywords = (params) => {
  return get('/search/hot-keywords', params)
}

/**
 * 获取企业搜索页面的筛选标签和热门搜索
 * @returns {Promise} 企业搜索页面数据
 */
export const getEnterpriseSearchPageData = () => {
  return get('/search/enterprises/page-data')
}

/**
 * 获取课程搜索页面的筛选标签和热门搜索
 * @returns {Promise} 课程搜索页面数据
 */
export const getCourseSearchPageData = () => {
  return get('/search/courses/page-data')
}

/**
 * 获取搜索历史记录
 * @param {Object} params 查询参数
 * @param {string} [params.type] 搜索类型筛选
 * @param {number} [params.limit=20] 历史记录数量限制
 * @returns {Promise} 搜索历史列表
 */
export const getSearchHistory = (params = {}) => {
  return get('/search/history', params)
}

/**
 * 清除搜索历史记录
 * @param {Object} data 清除数据
 * @param {string} [data.type] 要清除的搜索类型，不传则清除所有
 * @param {Array} [data.ids] 要清除的具体记录ID列表
 * @returns {Promise} 清除结果
 */
export const clearSearchHistory = (data = {}) => {
  return post('/search/history/clear', data)
}

/**
 * 获取搜索统计数据
 * @param {Object} params 查询参数
 * @param {string} [params.type] 搜索类型
 * @param {string} [params.timeRange] 时间范围
 * @returns {Promise} 搜索统计数据
 */
export const getSearchStatistics = (params = {}) => {
  return get('/search/statistics', params)
}

// 导出所有搜索功能相关API
export default {
  recordSearchBehavior,
  searchJobsSimple,
  searchJobsAdvanced,
  searchEnterprisesSimple,
  searchEnterprisesAdvanced,
  searchCoursesSimple,
  searchCoursesAdvanced,
  getSearchSuggestions,
  getSkillHotTags,
  getJobSearchPageData,
  getHotSearchKeywords,
  getEnterpriseSearchPageData,
  getCourseSearchPageData,
  getSearchHistory,
  clearSearchHistory,
  getSearchStatistics
}