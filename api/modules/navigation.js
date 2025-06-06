/**
 * 导航管理相关API
 * 包含求职招聘选择页面、导航配置等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 获取求职招聘选择页面的选项数据
 * @returns {Promise} 选择页面数据
 */
export const getJobRecruitmentOptions = () => {
  return get('/navigation/job-recruitment/options')
}

/**
 * 获取主导航菜单数据
 * @param {Object} params 查询参数
 * @param {string} [params.platform] 平台类型（web/mobile/app）
 * @param {boolean} [params.active] 是否只获取激活的导航
 * @returns {Promise} 导航菜单数据
 */
export const getMainNavigation = (params = {}) => {
  return get('/navigation/main', params)
}

/**
 * 获取底部导航数据
 * @param {Object} params 查询参数
 * @param {string} [params.platform] 平台类型
 * @returns {Promise} 底部导航数据
 */
export const getBottomNavigation = (params = {}) => {
  return get('/navigation/bottom', params)
}

/**
 * 获取侧边栏导航数据
 * @param {Object} params 查询参数
 * @param {string} [params.userType] 用户类型（individual/enterprise）
 * @returns {Promise} 侧边栏导航数据
 */
export const getSidebarNavigation = (params = {}) => {
  return get('/navigation/sidebar', params)
}

/**
 * 获取面包屑导航数据
 * @param {Object} params 查询参数
 * @param {string} params.path 当前页面路径
 * @returns {Promise} 面包屑导航数据
 */
export const getBreadcrumbNavigation = (params) => {
  return get('/navigation/breadcrumb', params)
}

/**
 * 获取快捷导航数据
 * @param {Object} params 查询参数
 * @param {string} [params.category] 导航分类
 * @param {number} [params.limit] 数量限制
 * @returns {Promise} 快捷导航数据
 */
export const getQuickNavigation = (params = {}) => {
  return get('/navigation/quick', params)
}

/**
 * 获取用户个性化导航配置
 * @returns {Promise} 个性化导航配置
 */
export const getUserNavigationConfig = () => {
  return get('/navigation/user/config')
}

/**
 * 更新用户个性化导航配置
 * @param {Object} data 导航配置数据
 * @param {Array} [data.favoriteMenus] 收藏的菜单项
 * @param {Array} [data.quickAccess] 快速访问项
 * @param {Object} [data.layout] 布局配置
 * @returns {Promise} 更新结果
 */
export const updateUserNavigationConfig = (data) => {
  return put('/navigation/user/config', data)
}

/**
 * 记录导航点击行为
 * @param {Object} data 点击行为数据
 * @param {string} data.menuId 菜单项ID
 * @param {string} data.menuName 菜单项名称
 * @param {string} data.path 跳转路径
 * @param {string} [data.source] 来源位置
 * @returns {Promise} 记录结果
 */
export const recordNavigationClick = (data) => {
  return post('/navigation/click', data)
}

/**
 * 获取导航统计数据
 * @param {Object} params 查询参数
 * @param {string} [params.timeRange] 时间范围
 * @param {string} [params.menuId] 特定菜单ID
 * @returns {Promise} 导航统计数据
 */
export const getNavigationStatistics = (params = {}) => {
  return get('/navigation/statistics', params)
}

/**
 * 获取热门导航项
 * @param {Object} params 查询参数
 * @param {number} [params.limit=10] 数量限制
 * @param {string} [params.timeRange] 时间范围
 * @param {string} [params.category] 导航分类
 * @returns {Promise} 热门导航项列表
 */
export const getHotNavigationItems = (params = {}) => {
  return get('/navigation/hot', params)
}

/**
 * 搜索导航项
 * @param {Object} params 搜索参数
 * @param {string} params.keyword 搜索关键词
 * @param {string} [params.category] 导航分类
 * @param {number} [params.limit=20] 结果数量限制
 * @returns {Promise} 搜索结果
 */
export const searchNavigationItems = (params) => {
  return get('/navigation/search', params)
}

/**
 * 获取导航项详情
 * @param {string} menuId 菜单项ID
 * @returns {Promise} 导航项详情
 */
export const getNavigationItemDetail = (menuId) => {
  return get(`/navigation/items/${menuId}`)
}

/**
 * 添加到快速访问
 * @param {Object} data 快速访问数据
 * @param {string} data.menuId 菜单项ID
 * @param {string} data.name 显示名称
 * @param {string} data.path 访问路径
 * @param {string} [data.icon] 图标
 * @returns {Promise} 添加结果
 */
export const addToQuickAccess = (data) => {
  return post('/navigation/quick-access', data)
}

/**
 * 从快速访问中移除
 * @param {string} itemId 快速访问项ID
 * @returns {Promise} 移除结果
 */
export const removeFromQuickAccess = (itemId) => {
  return del(`/navigation/quick-access/${itemId}`)
}

/**
 * 获取导航权限配置
 * @param {Object} params 查询参数
 * @param {string} [params.userType] 用户类型
 * @param {string} [params.role] 用户角色
 * @returns {Promise} 权限配置
 */
export const getNavigationPermissions = (params = {}) => {
  return get('/navigation/permissions', params)
}

// 导出所有导航管理相关API
export default {
  getJobRecruitmentOptions,
  getMainNavigation,
  getBottomNavigation,
  getSidebarNavigation,
  getBreadcrumbNavigation,
  getQuickNavigation,
  getUserNavigationConfig,
  updateUserNavigationConfig,
  recordNavigationClick,
  getNavigationStatistics,
  getHotNavigationItems,
  searchNavigationItems,
  getNavigationItemDetail,
  addToQuickAccess,
  removeFromQuickAccess,
  getNavigationPermissions
}