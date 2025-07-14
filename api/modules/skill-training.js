/**
 * 技能培训扩展模块API
 * 包含课程评价、学习进度、搜索建议、讲师信息、个性化推荐等功能
 */

import { get, post, put, del } from '../request.js'

















/**
 * 获取用户的收藏列表
 * @param {Object} [params] 查询参数
 * @param {string} [params.itemType='course'] 收藏类型
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 用户收藏列表
 */
export const getUserFavorites = (params = {}) => {
  return get('/skill-training/favorites', params)
}

/**
 * 收藏或取消收藏课程
 * @param {Object} data 收藏操作数据
 * @param {number} data.itemId 收藏项ID
 * @param {string} data.itemType 收藏项类型（course, job, lawyer, psychologist）
 * @param {string} data.action 操作类型（add, remove）
 * @returns {Promise} 操作结果
 */
export const toggleFavorite = (data) => {
  return post('/skill-training/favorites', data)
}

/**
 * 增加课程浏览次数
 * @param {number} courseId 课程ID
 * @returns {Promise} 操作结果
 */
export const incrementCourseViewCount = (courseId) => {
  return post(`/skill-training/courses/${courseId}/view`)
}

/**
 * 分享课程
 * @param {number} courseId 课程ID
 * @returns {Promise} 分享结果
 */
export const shareCourse = (courseId) => {
  return post(`/skill-training/courses/${courseId}/share`)
}

/**
 * 点赞课程
 * @param {number} courseId 课程ID
 * @returns {Promise} 点赞结果
 */
export const likeCourse = (courseId) => {
  return post(`/skill-training/courses/${courseId}/like`)
}

/**
 * 获取课程统计信息
 * @returns {Promise} 课程统计信息
 */
export const getCourseStatisticsOverview = () => {
  return get('/skill-training/statistics')
}

/**
 * 获取讲师详细信息
 * @param {number} instructorId 讲师ID
 * @returns {Promise} 讲师详细信息
 */
export const getInstructorInfo = (instructorId) => {
  return get(`/skill-training/instructors/${instructorId}`)
}

/**
 * 获取指定讲师的课程列表
 * @param {number} instructorId 讲师ID
 * @param {Object} [params] 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 讲师课程列表
 */
export const getCoursesByInstructor = (instructorId, params = {}) => {
  return get(`/skill-training/instructors/${instructorId}/courses`, params)
}

/**
 * 获取技能培训主页数据
 * @returns {Promise} 主页数据，包括轮播图、分类、热门课程等
 */
export const getSkillTrainingHome = () => {
  return get('/skill-training/home')
}

/**
 * 检查用户是否已收藏某课程
 * @param {number} courseId 课程ID
 * @returns {Promise} 是否已收藏
 */
export const isFavorited = (courseId) => {
  return get(`/skill-training/courses/${courseId}/is-favorited`)
}

/**
 * 获取课程详情信息
 * @param {number} courseId 课程ID
 * @returns {Promise} 课程详情信息，包括讲师信息和相关推荐
 */
export const getCourseDetails = (courseId) => {
  return get(`/skill-training/courses/${courseId}/detail`)
}

/**
 * 根据条件搜索课程
 * @param {Object} params 搜索参数
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.category] 课程分类
 * @param {string} [params.level] 课程难度
 * @param {string} params.sortBy 排序方式（必需）
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @returns {Promise} 搜索结果
 */
export const searchCourses = (params = {}) => {
  // 确保必需参数存在
  if (!params.sortBy || !params.page || !params.size) {
    throw new Error('sortBy、page 和 size 参数为必需')
  }
  return get('/skill-training/courses/search', params)
}

/**
 * 获取推荐课程列表
 * @param {Object} params 查询参数
 * @param {number} params.limit 限制数量
 * @returns {Promise} 推荐课程列表
 */
export const getRecommendedCourses = (params) => {
  return get('/skill-training/courses/recommended', params)
}

/**
 * 获取最新课程列表
 * @param {Object} params 查询参数
 * @param {number} params.limit 限制数量
 * @returns {Promise} 最新课程列表
 */
export const getLatestCoursesList = (params) => {
  return get('/skill-training/courses/latest', params)
}

/**
 * 获取热门课程列表
 * @param {Object} params 查询参数
 * @param {number} params.limit 限制数量
 * @returns {Promise} 热门课程列表
 */
export const getHotCourses = (params) => {
  return get('/skill-training/courses/hot', params)
}

/**
 * 根据分类获取课程列表
 * @param {string} category 分类
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.size 每页大小
 * @returns {Promise} 分类课程列表
 */
export const getCoursesByCategory = (category, params) => {
  return get(`/skill-training/courses/category/${category}`, params)
}

/**
 * 获取所有课程分类列表
 * @param {Object} [params] 查询参数
 * @param {boolean} [params.includeCount=false] 是否包含课程数量
 * @returns {Promise} 课程分类列表
 */
export const getAllCategories = (params = {}) => {
  return get('/skill-training/categories', params)
}

// 导出所有技能培训相关API（仅保留符合OpenAPI规范的接口）
export default {
  // 主页和分类接口
  getSkillTrainingHome,
  getAllCategories,
  getCoursesByCategory,
  // 课程搜索和列表接口
  searchCourses,
  getCourseDetails,
  getHotCourses,
  getLatestCoursesList,
  getRecommendedCourses,
  // 课程交互接口
  incrementCourseViewCount,
  likeCourse,
  shareCourse,
  // 收藏管理接口
  toggleFavorite,
  getUserFavorites,
  isFavorited,
  // 讲师相关接口
  getInstructorInfo,
  getCoursesByInstructor,
  // 统计概览接口
  getCourseStatisticsOverview
}