/**
 * 搜索功能相关API
 * 包含职位搜索、企业搜索、课程搜索、搜索建议等功能
 */

import { get, post } from '../request.js'

/**
 * 记录用户的搜索行为，用于统计热门搜索
 * @param {Object} data 搜索行为数据
 * @param {string} data.keyword 搜索关键词
 * @param {string} data.searchType 搜索类型（job/enterprise/course/skill）
 * @returns {Promise} 记录结果
 */
export const recordSearchBehavior = (data) => {
  return post('/user/search/record', data)
}

/**
 * 通过GET请求搜索职位，支持简单参数
 * @param {Object} params 搜索参数
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.location] 工作地点
 * @param {string} [params.salaryMin] 最低薪资
 * @param {string} [params.salaryMax] 最高薪资
 * @param {string} [params.jobType] 工作类型
 * @param {string} [params.educationRequirement] 学历要求
 * @param {string} [params.workExperience] 工作经验
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页数量（必需）
 * @param {string} params.sortBy 排序方式（必需）
 * @returns {Promise} 搜索结果
 */
export const searchJobsSimple = (params = {}) => {
  // 确保必需参数存在
  if (!params.page || !params.size || !params.sortBy) {
    throw new Error('page、size 和 sortBy 参数为必需')
  }
  return get('/user/search/jobs', params)
}

/**
 * 通过POST请求搜索职位，支持复杂查询
 * @param {Object} data 搜索数据
 * @param {string} [data.keyword] 搜索关键词
 * @param {string} [data.location] 工作地点
 * @param {string} [data.salaryMin] 最低薪资
 * @param {string} [data.salaryMax] 最高薪资
 * @param {string} [data.jobType] 工作类型
 * @param {string} [data.educationRequirement] 学历要求
 * @param {string} [data.workExperience] 工作经验
 * @param {number} data.page 页码（必需）
 * @param {number} data.size 每页数量（必需）
 * @param {string} data.sortBy 排序方式（必需）
 * @param {Object} [data.filters] 高级筛选条件
 * @returns {Promise} 搜索结果
 */
export const searchJobsPost = (data = {}) => {
  // 确保必需参数存在
  if (!data.page || !data.size || !data.sortBy) {
    throw new Error('page、size 和 sortBy 参数为必需')
  }
  return post('/user/search/jobs', data)
}

/**
 * 通过GET请求搜索企业
 * @param {Object} params 搜索参数
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.companyType] 公司类型
 * @param {string} [params.companySize] 公司规模
 * @param {string} [params.industry] 行业
 * @param {string} [params.location] 地区
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @param {string} params.sortBy 排序方式（必需）
 * @returns {Promise} 搜索结果
 */
export const searchEnterprisesSimple = (params) => {
  return get('/user/search/enterprises', params)
}

/**
 * 通过POST请求搜索企业，支持复杂查询
 * @param {Object} data 搜索数据
 * @param {string} [data.keyword] 搜索关键词
 * @param {string} [data.companyType] 公司类型
 * @param {string} [data.companySize] 公司规模
 * @param {string} [data.industry] 行业
 * @param {string} [data.location] 地区
 * @param {number} data.page 页码（必需）
 * @param {number} data.size 每页大小（必需）
 * @param {string} data.sortBy 排序方式（必需）
 * @param {Object} [data.filters] 高级筛选条件
 * @returns {Promise} 搜索结果
 */
export const searchEnterprisesPost = (data) => {
  return post('/user/search/enterprises', data)
}

/**
 * 通过GET请求搜索课程
 * @param {Object} params 搜索参数
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.category] 课程分类
 * @param {number} [params.instructorId] 讲师ID
 * @param {string} [params.priceMin] 最低价格
 * @param {string} [params.priceMax] 最高价格
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @param {string} params.sortBy 排序方式（必需）
 * @returns {Promise} 搜索结果
 */
export const searchCoursesSimple = (params) => {
  return get('/user/search/courses', params)
}

/**
 * 通过POST请求搜索课程，支持复杂查询
 * @param {Object} data 搜索数据
 * @param {string} [data.keyword] 搜索关键词
 * @param {string} [data.category] 课程分类
 * @param {number} [data.instructorId] 讲师ID
 * @param {string} [data.priceMin] 最低价格
 * @param {string} [data.priceMax] 最高价格
 * @param {number} data.page 页码（必需）
 * @param {number} data.size 每页大小（必需）
 * @param {string} data.sortBy 排序方式（必需）
 * @param {Object} [data.filters] 高级筛选条件
 * @returns {Promise} 搜索结果
 */
export const searchCoursesPost = (data) => {
  return post('/user/search/courses', data)
}

/**
 * 根据输入的关键词前缀获取搜索建议
 * @param {Object} params 查询参数
 * @param {string} params.keyword 关键词前缀（必需）
 * @param {string} [params.searchType] 搜索类型（job/enterprise/course/skill）
 * @param {number} params.limit 建议数量限制（必需）
 * @returns {Promise} 搜索建议列表
 */
export const getSearchSuggestions = (params) => {
  return get('/user/search/suggestions', params)
}

/**
 * 获取技能搜索页面的热门搜索标签
 * @returns {Promise} 热门技能标签列表
 */
export const getSkillHotTags = () => {
  return get('/user/search/skills/hot')
}

/**
 * 获取指定类型的热门搜索关键词
 * @param {Object} params 查询参数
 * @param {string} [params.searchType] 搜索类型（job/enterprise/course/skill）
 * @param {number} params.limit 关键词数量限制（必需）
 * @returns {Promise} 热门搜索关键词列表
 */
export const getHotSearchKeywords = (params) => {
  return get('/user/search/hot', params)
}

/**
 * 获取职位搜索页面的筛选标签和热门搜索
 * @param {Object} params 查询参数
 * @param {string} params.sortBy 排序方式（必需）
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @returns {Promise} 职位搜索页面数据
 */
export const getJobSearchFilters = (params) => {
  return get('/user/search/jobs/filters', params)
}

/**
 * 获取企业搜索页面的筛选标签和热门搜索
 * @param {Object} params 查询参数
 * @param {string} params.sortBy 排序方式（必需）
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @returns {Promise} 企业搜索页面数据
 */
export const getEnterpriseSearchFilters = (params) => {
  return get('/user/search/enterprises/filters', params)
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
  searchJobsPost,
  searchEnterprisesSimple,
  searchEnterprisesPost,
  searchCoursesSimple,
  searchCoursesPost,
  getSearchSuggestions,
  getSkillHotTags,
  getHotSearchKeywords,
  getJobSearchFilters,
  getEnterpriseSearchFilters
}