/**
 * 心理测试相关API
 * 包含心理测试列表、详情、提交答案、结果等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 获取心理测试列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码（必需）
 * @param {number} params.size 每页大小（必需）
 * @param {string} [params.keyword] 搜索关键词
 * @returns {Promise} 心理测试列表
 */
export const getTestList = (params = {}) => {
  // 确保必需参数存在
  if (!params.page || !params.size) {
    throw new Error('page 和 size 参数为必需')
  }
  return get('/psychological-tests/list', params)
}

/**
 * 获取心理测试详情
 * @param {number} testId 测试ID
 * @returns {Promise} 心理测试详情
 */
export const getTestDetail = (testId) => {
  return get(`/psychological-tests/${testId}`)
}

/**
 * 检查是否可以参加测试
 * @param {number} testId 测试ID
 * @returns {Promise} 检查结果
 */
export const canTakeTest = (testId) => {
  return get(`/psychological-tests/${testId}/can-take`)
}

/**
 * 提交测试答案
 * @param {Object} data 提交数据
 * @param {number} data.testId 测试ID
 * @param {Array} data.answers 答案列表
 * @param {number} data.timeSpent 耗时（秒）
 * @returns {Promise} 提交结果
 */
export const submitTest = (data) => {
  return post('/psychological-tests/submit', data)
}

/**
 * 重新参加测试
 * @param {number} testId 测试ID
 * @param {Object} data 重测数据
 * @param {string} data.reason 重测原因
 * @returns {Promise} 重测结果
 */
export const retakeTest = (testId, data) => {
  return post(`/psychological-tests/${testId}/retake`, data)
}

/**
 * 获取测试结果详情
 * @param {number} resultId 结果ID
 * @returns {Promise} 测试结果详情
 */
export const getTestResult = (resultId) => {
  return get(`/psychological-tests/results/${resultId}`)
}

/**
 * 分享测试结果
 * @param {number} resultId 结果ID
 * @param {Object} data 分享数据
 * @param {string} data.platform 分享平台
 * @param {string} [data.message] 分享消息
 * @returns {Promise} 分享结果
 */
export const shareTestResult = (resultId, data) => {
  return post(`/psychological-tests/results/${resultId}/share`, data)
}

/**
 * 获取用户测试历史
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.testType] 测试类型
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @returns {Promise} 测试历史列表
 */
export const getTestHistory = (params = {}) => {
  return get('/psychological-tests/history', params)
}

/**
 * 获取热门测试
 * @param {Object} params 查询参数
 * @param {number} [params.limit=10] 数量限制
 * @returns {Promise} 热门测试列表
 */
export const getPopularTests = (params = {}) => {
  return get('/psychological-tests/popular', params)
}

/**
 * 获取最新测试
 * @param {Object} params 查询参数
 * @param {number} [params.limit=10] 数量限制
 * @returns {Promise} 最新测试列表
 */
export const getLatestTests = (params = {}) => {
  return get('/psychological-tests/latest', params)
}

/**
 * 获取个性化建议
 * @param {Object} params 查询参数
 * @param {number} [params.userId] 用户ID
 * @param {string} [params.category] 建议分类
 * @returns {Promise} 个性化建议列表
 */
export const getRecommendations = (params = {}) => {
  return get('/psychological-tests/recommendations', params)
}

/**
 * 获取测试统计信息
 * @param {Object} params 查询参数
 * @param {string} [params.period] 统计周期
 * @param {string} [params.type] 统计类型
 * @returns {Promise} 统计信息
 */
export const getTestStatistics = (params = {}) => {
  return get('/psychological-tests/statistics', params)
}

// 默认导出所有方法
export default {
  getTestList,
  getTestDetail,
  canTakeTest,
  submitTest,
  retakeTest,
  getTestResult,
  shareTestResult,
  getTestHistory,
  getPopularTests,
  getLatestTests,
  getRecommendations,
  getTestStatistics
} 