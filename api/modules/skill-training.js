/**
 * 技能培训扩展模块API
 * 包含课程评价、学习进度、搜索建议、讲师信息、个性化推荐等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 对课程评价进行点赞或取消点赞
 * @param {Object} data 点赞数据
 * @param {string} data.evaluationId 评价ID
 * @param {boolean} data.isLike 是否点赞（true-点赞，false-取消点赞）
 * @returns {Promise} 点赞结果
 */
export const likeEvaluation = (data) => {
  return post('/skill-training/evaluation/like', data)
}

/**
 * 获取用户在指定课程的学习进度
 * @param {string} courseId 课程ID
 * @returns {Promise} 学习进度信息
 */
export const getLearningProgress = (courseId) => {
  return get(`/skill-training/course/${courseId}/progress`)
}

/**
 * 更新用户在指定课程的学习进度
 * @param {Object} data 学习进度数据
 * @param {string} data.courseId 课程ID
 * @param {number} data.progress 学习进度（0-100）
 * @param {number} data.duration 学习时长（秒）
 * @param {string} [data.chapterId] 章节ID
 * @param {string} [data.lessonId] 课时ID
 * @returns {Promise} 更新结果
 */
export const updateLearningProgress = (data) => {
  return put('/skill-training/learning/progress', data)
}

/**
 * 记录用户的学习行为数据
 * @param {Object} data 学习行为数据
 * @param {string} data.courseId 课程ID
 * @param {string} data.actionType 行为类型（view-观看，pause-暂停，resume-继续，complete-完成等）
 * @param {number} [data.timestamp] 时间戳
 * @param {Object} [data.metadata] 额外元数据
 * @returns {Promise} 记录结果
 */
export const recordLearningBehavior = (data) => {
  return post('/skill-training/learning/behavior', data)
}

/**
 * 提交对指定课程的评价
 * @param {Object} data 评价数据
 * @param {string} data.courseId 课程ID
 * @param {number} data.rating 评分（1-5）
 * @param {string} data.content 评价内容
 * @param {Array} [data.tags] 评价标签
 * @returns {Promise} 提交结果
 */
export const submitCourseEvaluation = (data) => {
  return post('/skill-training/course/evaluation', data)
}

/**
 * 获取课程排序的所有选项
 * @returns {Promise} 排序选项列表
 */
export const getCourseSortOptions = () => {
  return get('/skill-training/course/sort-options')
}

/**
 * 根据关键词前缀获取搜索建议
 * @param {string} keyword 关键词前缀
 * @param {number} [limit=10] 返回数量限制
 * @returns {Promise} 搜索建议列表
 */
export const getSearchSuggestions = (keyword, limit = 10) => {
  return get('/skill-training/search/suggestions', { keyword, limit })
}

/**
 * 获取搜索结果的统计信息
 * @param {string} keyword 搜索关键词
 * @param {Object} [filters] 筛选条件
 * @returns {Promise} 搜索统计信息
 */
export const getSearchStatistics = (keyword, filters = {}) => {
  return get('/skill-training/search/statistics', { keyword, ...filters })
}

/**
 * 获取讲师的详细资料信息
 * @param {string} instructorId 讲师ID
 * @returns {Promise} 讲师详细信息
 */
export const getInstructorProfile = (instructorId) => {
  return get(`/skill-training/instructor/${instructorId}/profile`)
}

/**
 * 获取课程筛选的所有选项数据
 * @returns {Promise} 筛选选项数据
 */
export const getCourseFilterOptions = () => {
  return get('/skill-training/course/filter-options')
}

/**
 * 获取课程搜索的扩展结果，包括统计信息、建议等
 * @param {Object} params 搜索参数
 * @param {string} params.keyword 搜索关键词
 * @param {Object} [params.filters] 筛选条件
 * @param {number} [params.page=1] 页码
 * @param {number} [params.pageSize=20] 每页数量
 * @returns {Promise} 扩展搜索结果
 */
export const getExtendedSearchResults = (params) => {
  return get('/skill-training/search/extended', params)
}

/**
 * 获取个性化推荐课程列表
 * @param {Object} [params] 推荐参数
 * @param {number} [params.limit=10] 返回数量限制
 * @param {string} [params.type] 推荐类型
 * @returns {Promise} 推荐课程列表
 */
export const getPersonalizedRecommendations = (params = {}) => {
  return get('/skill-training/recommendations/personalized', params)
}

/**
 * 获取课程列表页的完整数据，包括筛选选项、排序选项等
 * @param {Object} [params] 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.pageSize=20] 每页数量
 * @param {Object} [params.filters] 筛选条件
 * @param {string} [params.sortBy] 排序字段
 * @returns {Promise} 课程列表完整数据
 */
export const getCourseListPageData = (params = {}) => {
  return get('/skill-training/course/list-page-data', params)
}

/**
 * 获取最新课程列表，包含更多统计信息
 * @param {Object} [params] 查询参数
 * @param {number} [params.limit=10] 返回数量限制
 * @param {boolean} [params.includeStats=true] 是否包含统计信息
 * @returns {Promise} 最新课程列表
 */
export const getLatestCourses = (params = {}) => {
  return get('/skill-training/course/latest', params)
}

/**
 * 获取热门课程列表，包含更多统计信息
 * @param {Object} [params] 查询参数
 * @param {number} [params.limit=10] 返回数量限制
 * @param {boolean} [params.includeStats=true] 是否包含统计信息
 * @returns {Promise} 热门课程列表
 */
export const getPopularCourses = (params = {}) => {
  return get('/skill-training/course/popular', params)
}

/**
 * 获取用户与指定课程的交互状态
 * @param {string} courseId 课程ID
 * @returns {Promise} 用户交互状态
 */
export const getUserCourseInteraction = (courseId) => {
  return get(`/skill-training/course/${courseId}/user-interaction`)
}

/**
 * 获取课程的详细统计数据
 * @param {string} courseId 课程ID
 * @returns {Promise} 课程统计数据
 */
export const getCourseStatistics = (courseId) => {
  return get(`/skill-training/course/${courseId}/statistics`)
}

/**
 * 获取指定课程的评价列表
 * @param {string} courseId 课程ID
 * @param {Object} [params] 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.pageSize=20] 每页数量
 * @param {string} [params.sortBy] 排序字段
 * @returns {Promise} 课程评价列表
 */
export const getCourseEvaluations = (courseId, params = {}) => {
  return get(`/skill-training/course/${courseId}/evaluations`, params)
}

/**
 * 获取与指定课程相关的推荐课程
 * @param {string} courseId 课程ID
 * @param {Object} [params] 推荐参数
 * @param {number} [params.limit=10] 返回数量限制
 * @returns {Promise} 相关推荐课程
 */
export const getRelatedCourses = (courseId, params = {}) => {
  return get(`/skill-training/course/${courseId}/related`, params)
}

/**
 * 获取课程的详细简介信息
 * @param {string} courseId 课程ID
 * @returns {Promise} 课程详细简介
 */
export const getCourseIntroduction = (courseId) => {
  return get(`/skill-training/course/${courseId}/introduction`)
}

/**
 * 获取课程详情页的完整数据，包括课程信息、统计数据、讲师信息等
 * @param {string} courseId 课程ID
 * @returns {Promise} 课程详情页完整数据
 */
export const getCourseDetailPageData = (courseId) => {
  return get(`/skill-training/course/${courseId}/detail-page-data`)
}

/**
 * 获取指定分类的详细信息
 * @param {string} categoryId 分类ID
 * @returns {Promise} 分类详细信息
 */
export const getCategoryDetail = (categoryId) => {
  return get(`/skill-training/category/${categoryId}/detail`)
}

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
  return get(`/skill-training/courses/${courseId}`)
}

/**
 * 根据条件搜索课程
 * @param {Object} params 搜索参数
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.category] 课程分类
 * @param {string} [params.level] 课程难度
 * @param {string} [params.sortBy] 排序方式
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 搜索结果
 */
export const searchCourses = (params = {}) => {
  return get('/skill-training/courses/search', params)
}

/**
 * 获取推荐课程列表
 * @param {Object} [params] 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.type] 推荐类型
 * @returns {Promise} 推荐课程列表
 */
export const getRecommendedCourses = (params = {}) => {
  return get('/skill-training/courses/recommended', params)
}

/**
 * 获取最新课程列表
 * @param {Object} [params] 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 最新课程列表
 */
export const getLatestCoursesList = (params = {}) => {
  return get('/skill-training/courses/latest', params)
}

/**
 * 获取热门课程列表
 * @param {Object} [params] 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 热门课程列表
 */
export const getHotCourses = (params = {}) => {
  return get('/skill-training/courses/hot', params)
}

/**
 * 根据分类获取课程列表
 * @param {string} categoryId 分类ID
 * @param {Object} [params] 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.sortBy] 排序方式
 * @returns {Promise} 分类课程列表
 */
export const getCoursesByCategory = (categoryId, params = {}) => {
  return get(`/skill-training/categories/${categoryId}/courses`, params)
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

// 导出所有技能培训相关API
export default {
  likeEvaluation,
  getLearningProgress,
  updateLearningProgress,
  recordLearningBehavior,
  submitCourseEvaluation,
  getCourseSortOptions,
  getSearchSuggestions,
  getSearchStatistics,
  getInstructorProfile,
  getCourseFilterOptions,
  getExtendedSearchResults,
  getPersonalizedRecommendations,
  getCourseListPageData,
  getLatestCourses,
  getPopularCourses,
  getUserCourseInteraction,
  getCourseStatistics,
  getCourseEvaluations,
  getRelatedCourses,
  getCourseIntroduction,
  getCourseDetailPageData,
  getCategoryDetail,
  // 新增的API接口
  getUserFavorites,
  toggleFavorite,
  incrementCourseViewCount,
  shareCourse,
  likeCourse,
  getCourseStatisticsOverview,
  getInstructorInfo,
  getCoursesByInstructor,
  getSkillTrainingHome,
  isFavorited,
  getCourseDetails,
  searchCourses,
  getRecommendedCourses,
  getLatestCoursesList,
  getHotCourses,
  getCoursesByCategory,
  getAllCategories
}