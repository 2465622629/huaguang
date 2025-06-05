/**
 * 主页管理相关API
 * 包含轮播图、导航、推荐内容、热门律师、热门职位等功能
 */

import { get, post } from '../request.js'

/**
 * 获取热门律师列表
 * @param {Object} params 查询参数
 * @param {number} [params.limit=10] 限制数量
 * @returns {Promise} 热门律师列表
 */
export const getHotLawyers = (params = {}) => {
  return get('/home/lawyers/hot', params)
}

/**
 * 获取热门职位列表
 * @param {Object} params 查询参数
 * @param {number} [params.limit=10] 限制数量
 * @returns {Promise} 热门职位列表
 */
export const getHotJobs = (params = {}) => {
  return get('/home/jobs/hot', params)
}

/**
 * 获取主页数据
 * 获取主页所有模块的数据，包括轮播图、导航、推荐等
 * @returns {Promise} 主页数据
 */
export const getHomePageData = () => {
  return get('/home/data')
}

/**
 * 获取轮播图列表
 * @param {Object} params 查询参数
 * @param {string} [params.position] 位置标识
 * @param {boolean} [params.active] 是否激活
 * @returns {Promise} 轮播图列表
 */
export const getBanners = (params = {}) => {
  return get('/home/banners', params)
}

/**
 * 获取功能导航列表
 * @returns {Promise} 功能导航列表
 */
export const getNavigations = () => {
  return get('/home/navigations')
}

/**
 * 获取推荐内容列表
 * @param {Object} params 查询参数
 * @param {string} [params.type] 推荐类型
 * @param {number} [params.limit] 限制数量
 * @returns {Promise} 推荐内容列表
 */
export const getRecommendations = (params = {}) => {
  return get('/home/recommendations', params)
}

/**
 * 获取服务卡片列表
 * @returns {Promise} 服务卡片列表
 */
export const getServiceCards = () => {
  return get('/home/service-cards')
}

// 导出所有主页管理相关API
export default {
  getHotLawyers,
  getHotJobs,
  getHomePageData,
  getBanners,
  getNavigations,
  getRecommendations,
  getServiceCards
}