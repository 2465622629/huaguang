/**
 * 管理端内容管理API模块
 * 包含心理测试、法律模板、课程等内容管理相关接口
 */
import request from '../request.js'

// ==================== 心理测试管理 ====================

/**
 * 获取心理测试列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.keyword - 关键词搜索
 * @param {string} params.category - 分类筛选
 * @param {string} params.status - 状态筛选
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 心理测试列表
 */
export const getPsychologicalTestList = (params = {}) => {
  return request({
    url: '/admin/content/psychological-tests',
    method: 'GET',
    params
  })
}

/**
 * 创建心理测试
 * @param {Object} data - 创建数据
 * @param {string} data.name - 测试名称
 * @param {string} data.description - 测试描述
 * @param {Object} data.questions - 测试题目
 * @param {Object} data.scoringRules - 评分规则
 * @returns {Promise} 创建结果
 */
export const createPsychologicalTest = (data) => {
  return request({
    url: '/admin/content/psychological-tests',
    method: 'POST',
    data
  })
}

/**
 * 更新心理测试
 * @param {number} testId - 测试ID
 * @param {Object} data - 更新数据
 * @param {string} data.name - 测试名称
 * @param {string} data.description - 测试描述
 * @param {Object} data.questions - 测试题目
 * @param {Object} data.scoringRules - 评分规则
 * @param {boolean} data.isActive - 是否激活
 * @returns {Promise} 更新结果
 */
export const updatePsychologicalTest = (testId, data) => {
  return request({
    url: `/admin/content/psychological-tests/${testId}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除心理测试
 * @param {number} testId - 测试ID
 * @returns {Promise} 删除结果
 */
export const deletePsychologicalTest = (testId) => {
  return request({
    url: `/admin/content/psychological-tests/${testId}`,
    method: 'DELETE'
  })
}

/**
 * 批量操作心理测试
 * @param {Object} data - 批量操作数据
 * @param {Array<number>} data.ids - ID列表
 * @param {string} data.operation - 操作类型：activate(激活) | deactivate(禁用) | delete(删除)
 * @returns {Promise} 批量操作结果
 */
export const batchOperatePsychologicalTests = (data) => {
  return request({
    url: '/admin/content/psychological-tests/batch',
    method: 'POST',
    data
  })
}

// ==================== 法律模板管理 ====================

/**
 * 获取法律模板列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.keyword - 关键词搜索
 * @param {string} params.category - 分类筛选
 * @param {string} params.status - 状态筛选
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 法律模板列表
 */
export const getLegalTemplateList = (params = {}) => {
  return request({
    url: '/admin/content/legal-templates',
    method: 'GET',
    params
  })
}

/**
 * 创建法律模板
 * @param {Object} data - 创建数据
 * @param {string} data.name - 模板名称
 * @param {string} data.category - 分类
 * @param {string} data.description - 描述
 * @param {string} data.templateFileUrl - 模板文件URL
 * @param {string} data.fileType - 文件类型
 * @param {number} data.fileSize - 文件大小
 * @returns {Promise} 创建结果
 */
export const createLegalTemplate = (data) => {
  return request({
    url: '/admin/content/legal-templates',
    method: 'POST',
    data
  })
}

/**
 * 更新法律模板
 * @param {number} templateId - 模板ID
 * @param {Object} data - 更新数据
 * @param {string} data.name - 模板名称
 * @param {string} data.category - 分类
 * @param {string} data.description - 描述
 * @param {string} data.templateFileUrl - 模板文件URL
 * @param {string} data.fileType - 文件类型
 * @param {number} data.fileSize - 文件大小
 * @param {boolean} data.isActive - 是否激活
 * @returns {Promise} 更新结果
 */
export const updateLegalTemplate = (templateId, data) => {
  return request({
    url: `/admin/content/legal-templates/${templateId}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除法律模板
 * @param {number} templateId - 模板ID
 * @returns {Promise} 删除结果
 */
export const deleteLegalTemplate = (templateId) => {
  return request({
    url: `/admin/content/legal-templates/${templateId}`,
    method: 'DELETE'
  })
}

/**
 * 批量操作法律模板
 * @param {Object} data - 批量操作数据
 * @param {Array<number>} data.ids - ID列表
 * @param {string} data.operation - 操作类型：activate(激活) | deactivate(禁用) | delete(删除)
 * @returns {Promise} 批量操作结果
 */
export const batchOperateLegalTemplates = (data) => {
  return request({
    url: '/admin/content/legal-templates/batch',
    method: 'POST',
    data
  })
}

// ==================== 课程管理 ====================

/**
 * 获取课程列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.size - 每页大小，默认10
 * @param {string} params.keyword - 关键词搜索
 * @param {string} params.category - 分类筛选
 * @param {string} params.status - 状态筛选
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 课程列表
 */
export const getCourseList = (params = {}) => {
  return request({
    url: '/admin/content/courses',
    method: 'GET',
    params
  })
}

/**
 * 创建课程
 * @param {Object} data - 创建数据
 * @param {string} data.title - 课程标题
 * @param {string} data.description - 课程描述
 * @param {string} data.category - 课程分类
 * @param {number} data.instructorId - 讲师ID
 * @param {number} data.price - 课程价格
 * @param {number} data.durationMinutes - 课程时长（分钟）
 * @param {string} data.coverImage - 封面图片
 * @param {string} data.videoUrl - 视频URL
 * @param {string} data.status - 状态：active(激活) | inactive(禁用)
 * @returns {Promise} 创建结果
 */
export const createCourse = (data) => {
  return request({
    url: '/admin/content/courses',
    method: 'POST',
    data
  })
}

/**
 * 更新课程
 * @param {number} courseId - 课程ID
 * @param {Object} data - 更新数据
 * @param {string} data.title - 课程标题
 * @param {string} data.description - 课程描述
 * @param {string} data.category - 课程分类
 * @param {number} data.instructorId - 讲师ID
 * @param {number} data.price - 课程价格
 * @param {number} data.durationMinutes - 课程时长（分钟）
 * @param {string} data.coverImage - 封面图片
 * @param {string} data.videoUrl - 视频URL
 * @param {string} data.status - 状态：active(激活) | inactive(禁用)
 * @returns {Promise} 更新结果
 */
export const updateCourse = (courseId, data) => {
  return request({
    url: `/admin/content/courses/${courseId}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除课程
 * @param {number} courseId - 课程ID
 * @returns {Promise} 删除结果
 */
export const deleteCourse = (courseId) => {
  return request({
    url: `/admin/content/courses/${courseId}`,
    method: 'DELETE'
  })
}

/**
 * 批量操作课程
 * @param {Object} data - 批量操作数据
 * @param {Array<number>} data.ids - ID列表
 * @param {string} data.operation - 操作类型：activate(激活) | deactivate(禁用) | delete(删除)
 * @returns {Promise} 批量操作结果
 */
export const batchOperateCourses = (data) => {
  return request({
    url: '/admin/content/courses/batch',
    method: 'POST',
    data
  })
}

// ==================== 内容统计 ====================

/**
 * 获取内容统计信息
 * @returns {Promise} 内容统计数据
 */
export const getContentStatistics = () => {
  return request({
    url: '/admin/content/statistics',
    method: 'GET'
  })
}

// 默认导出所有接口
export default {
  // 心理测试管理
  getPsychologicalTestList,
  createPsychologicalTest,
  updatePsychologicalTest,
  deletePsychologicalTest,
  batchOperatePsychologicalTests,
  
  // 法律模板管理
  getLegalTemplateList,
  createLegalTemplate,
  updateLegalTemplate,
  deleteLegalTemplate,
  batchOperateLegalTemplates,
  
  // 课程管理
  getCourseList,
  createCourse,
  updateCourse,
  deleteCourse,
  batchOperateCourses,
  
  // 内容统计
  getContentStatistics
}