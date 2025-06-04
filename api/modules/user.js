/**
 * 用户管理相关API
 * 包含用户信息、个人资料、设置等功能
 */

import { get, post, put, del, upload } from '../request.js'

/**
 * 获取当前用户信息
 * @returns {Promise} 用户信息
 */
export const getCurrentUser = () => {
  return get('/user/profile')
}

/**
 * 更新用户信息
 * @param {Object} data 用户信息
 * @param {string} [data.nickname] 昵称
 * @param {string} [data.avatar] 头像URL
 * @param {string} [data.gender] 性别
 * @param {string} [data.birthday] 生日
 * @param {string} [data.location] 所在地
 * @param {string} [data.bio] 个人简介
 * @returns {Promise} 更新结果
 */
export const updateProfile = (data) => {
  return put('/user/profile', data)
}

/**
 * 修改密码
 * @param {Object} data 密码数据
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.newPassword 新密码
 * @returns {Promise} 修改结果
 */
export const changePassword = (data) => {
  return put('/user/password', data)
}

/**
 * 重置密码
 * @param {Object} data 重置数据
 * @param {string} data.phone 手机号
 * @param {string} data.smsCode 短信验证码
 * @param {string} data.newPassword 新密码
 * @returns {Promise} 重置结果
 */
export const resetPassword = (data) => {
  return post('/user/reset-password', data)
}

/**
 * 绑定手机号
 * @param {Object} data 绑定数据
 * @param {string} data.phone 手机号
 * @param {string} data.smsCode 短信验证码
 * @returns {Promise} 绑定结果
 */
export const bindPhone = (data) => {
  return post('/user/bind-phone', data)
}

/**
 * 绑定邮箱
 * @param {Object} data 绑定数据
 * @param {string} data.email 邮箱
 * @param {string} data.code 验证码
 * @returns {Promise} 绑定结果
 */
export const bindEmail = (data) => {
  return post('/user/bind-email', data)
}

/**
 * 上传头像
 * @param {string} filePath 文件路径
 * @returns {Promise} 上传结果
 */
export const uploadAvatar = (filePath) => {
  return upload('/user/avatar', filePath, 'avatar')
}

/**
 * 获取用户设置
 * @returns {Promise} 用户设置
 */
export const getUserSettings = () => {
  return get('/user/settings')
}

/**
 * 更新用户设置
 * @param {Object} data 设置数据
 * @param {boolean} [data.pushNotification] 推送通知
 * @param {boolean} [data.emailNotification] 邮件通知
 * @param {boolean} [data.smsNotification] 短信通知
 * @param {string} [data.language] 语言设置
 * @param {string} [data.theme] 主题设置
 * @returns {Promise} 更新结果
 */
export const updateSettings = (data) => {
  return put('/user/settings', data)
}

/**
 * 获取用户收藏列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.type] 收藏类型
 * @returns {Promise} 收藏列表
 */
export const getFavorites = (params) => {
  return get('/user/favorites', params)
}

/**
 * 添加收藏
 * @param {Object} data 收藏数据
 * @param {string} data.targetId 目标ID
 * @param {string} data.targetType 目标类型
 * @returns {Promise} 添加结果
 */
export const addFavorite = (data) => {
  return post('/user/favorites', data)
}

/**
 * 取消收藏
 * @param {string} favoriteId 收藏ID
 * @returns {Promise} 取消结果
 */
export const removeFavorite = (favoriteId) => {
  return del(`/user/favorites/${favoriteId}`)
}

/**
 * 获取用户浏览历史
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 浏览历史
 */
export const getBrowseHistory = (params) => {
  return get('/user/history', params)
}

/**
 * 清空浏览历史
 * @returns {Promise} 清空结果
 */
export const clearBrowseHistory = () => {
  return del('/user/history')
}

/**
 * 获取用户反馈列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 反馈列表
 */
export const getFeedbacks = (params) => {
  return get('/user/feedbacks', params)
}

/**
 * 提交反馈
 * @param {Object} data 反馈数据
 * @param {string} data.type 反馈类型
 * @param {string} data.content 反馈内容
 * @param {Array} [data.images] 图片列表
 * @param {string} [data.contact] 联系方式
 * @returns {Promise} 提交结果
 */
export const submitFeedback = (data) => {
  return post('/user/feedbacks', data)
}

/**
 * 注销账户
 * @param {Object} data 注销数据
 * @param {string} data.password 密码确认
 * @param {string} data.reason 注销原因
 * @returns {Promise} 注销结果
 */
export const deleteAccount = (data) => {
  return post('/user/delete-account', data)
}

// 导出所有用户相关API
export default {
  getCurrentUser,
  updateProfile,
  changePassword,
  resetPassword,
  bindPhone,
  bindEmail,
  uploadAvatar,
  getUserSettings,
  updateSettings,
  getFavorites,
  addFavorite,
  removeFavorite,
  getBrowseHistory,
  clearBrowseHistory,
  getFeedbacks,
  submitFeedback,
  deleteAccount
}