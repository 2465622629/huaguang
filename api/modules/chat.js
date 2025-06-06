/**
 * 聊天相关API
 * 包含聊天会话、消息、文件传输等功能
 */

import { get, post, put, del, upload } from '../request.js'

/**
 * 获取聊天会话列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.type] 会话类型
 * @returns {Promise} 会话列表
 */
export const getChatSessions = (params) => {
  return get('/chat/sessions', params)
}

/**
 * 创建聊天会话
 * @param {Object} data 会话数据
 * @param {string} data.targetId 目标用户ID
 * @param {string} data.targetType 目标类型（lawyer/psychologist/user）
 * @param {string} [data.title] 会话标题
 * @param {string} [data.description] 会话描述
 * @returns {Promise} 创建结果
 */
export const createChatSession = (data) => {
  return post('/chat/sessions', data)
}

/**
 * 获取聊天会话详情
 * @param {string} sessionId 会话ID
 * @returns {Promise} 会话详情
 */
export const getChatSessionDetail = (sessionId) => {
  return get(`/chat/sessions/${sessionId}`)
}

/**
 * 更新聊天会话
 * @param {string} sessionId 会话ID
 * @param {Object} data 更新数据
 * @param {string} [data.title] 会话标题
 * @param {boolean} [data.muted] 是否静音
 * @param {boolean} [data.pinned] 是否置顶
 * @returns {Promise} 更新结果
 */
export const updateChatSession = (sessionId, data) => {
  return put(`/chat/sessions/${sessionId}`, data)
}

/**
 * 删除聊天会话
 * @param {string} sessionId 会话ID
 * @returns {Promise} 删除结果
 */
export const deleteChatSession = (sessionId) => {
  return del(`/chat/sessions/${sessionId}`)
}

/**
 * 获取聊天消息列表
 * @param {string} sessionId 会话ID
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.beforeMessageId] 获取指定消息之前的消息
 * @param {string} [params.afterMessageId] 获取指定消息之后的消息
 * @returns {Promise} 消息列表
 */
export const getChatMessages = (sessionId, params) => {
  return get(`/chat/sessions/${sessionId}/messages`, params)
}

/**
 * 发送文本消息
 * @param {Object} data 消息数据
 * @param {string} data.sessionId 会话ID
 * @param {string} data.content 消息内容
 * @param {string} [data.replyToMessageId] 回复的消息ID
 * @returns {Promise} 发送结果
 */
export const sendTextMessage = (data) => {
  return post('/chat/messages/text', data)
}

/**
 * 发送图片消息
 * @param {Object} data 消息数据
 * @param {string} data.sessionId 会话ID
 * @param {string} data.imageUrl 图片URL
 * @param {string} [data.caption] 图片说明
 * @param {string} [data.replyToMessageId] 回复的消息ID
 * @returns {Promise} 发送结果
 */
export const sendImageMessage = (data) => {
  return post('/chat/messages/image', data)
}

/**
 * 发送文件消息
 * @param {Object} data 消息数据
 * @param {string} data.sessionId 会话ID
 * @param {string} data.fileUrl 文件URL
 * @param {string} data.fileName 文件名
 * @param {number} data.fileSize 文件大小
 * @param {string} [data.replyToMessageId] 回复的消息ID
 * @returns {Promise} 发送结果
 */
export const sendFileMessage = (data) => {
  return post('/chat/messages/file', data)
}

/**
 * 发送语音消息
 * @param {Object} data 消息数据
 * @param {string} data.sessionId 会话ID
 * @param {string} data.audioUrl 语音URL
 * @param {number} data.duration 语音时长（秒）
 * @param {string} [data.replyToMessageId] 回复的消息ID
 * @returns {Promise} 发送结果
 */
export const sendAudioMessage = (data) => {
  return post('/chat/messages/audio', data)
}

/**
 * 上传聊天文件
 * @param {string} filePath 文件路径
 * @param {string} fileType 文件类型（image/file/audio）
 * @returns {Promise} 上传结果
 */
export const uploadChatFile = (filePath, fileType) => {
  return upload(`/chat/upload/${fileType}`, filePath, 'file')
}

/**
 * 标记消息为已读
 * @param {string} sessionId 会话ID
 * @param {string} messageId 消息ID
 * @returns {Promise} 标记结果
 */
export const markMessageAsRead = (sessionId, messageId) => {
  return post(`/chat/sessions/${sessionId}/messages/${messageId}/read`)
}

/**
 * 批量标记消息为已读
 * @param {string} sessionId 会话ID
 * @param {Array} messageIds 消息ID列表
 * @returns {Promise} 标记结果
 */
export const markMessagesAsRead = (sessionId, messageIds) => {
  return post(`/chat/sessions/${sessionId}/messages/batch-read`, { messageIds })
}

/**
 * 撤回消息
 * @param {string} sessionId 会话ID
 * @param {string} messageId 消息ID
 * @returns {Promise} 撤回结果
 */
export const recallMessage = (sessionId, messageId) => {
  return post(`/chat/sessions/${sessionId}/messages/${messageId}/recall`)
}

/**
 * 删除消息
 * @param {string} sessionId 会话ID
 * @param {string} messageId 消息ID
 * @returns {Promise} 删除结果
 */
export const deleteMessage = (sessionId, messageId) => {
  return del(`/chat/sessions/${sessionId}/messages/${messageId}`)
}

/**
 * 获取未读消息数量
 * @returns {Promise} 未读消息数量
 */
export const getUnreadCount = () => {
  return get('/chat/unread-count')
}

/**
 * 搜索聊天消息
 * @param {Object} params 搜索参数
 * @param {string} params.keyword 搜索关键词
 * @param {string} [params.sessionId] 会话ID
 * @param {string} [params.messageType] 消息类型
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 搜索结果
 */
export const searchMessages = (params) => {
  return get('/chat/search', params)
}

/**
 * 获取聊天统计信息
 * @param {string} sessionId 会话ID
 * @returns {Promise} 统计信息
 */
export const getChatStatistics = (sessionId) => {
  return get(`/chat/sessions/${sessionId}/statistics`)
}

/**
 * 导出聊天记录
 * @param {string} sessionId 会话ID
 * @param {Object} params 导出参数
 * @param {string} [params.format] 导出格式（txt/pdf/excel）
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @returns {Promise} 导出结果
 */
export const exportChatHistory = (sessionId, params) => {
  return post(`/chat/sessions/${sessionId}/export`, params)
}

/**
 * 上传聊天中的图片或文件
 * @param {File} file 要上传的文件
 * @param {string} [fileType] 文件类型
 * @returns {Promise} 上传结果
 */
export const uploadChatMedia = (file, fileType) => {
  return upload('/chat/upload', file, 'file', { fileType })
}

/**
 * 在心理咨询中发送测试结果
 * @param {Object} data 测试结果数据
 * @param {string} data.sessionId 会话ID
 * @param {string} data.testId 测试ID
 * @param {Object} data.testResult 测试结果
 * @param {string} [data.comment] 备注
 * @returns {Promise} 发送结果
 */
export const sendPsychTestResult = (data) => {
  return post('/chat/psych/test-result', data)
}

/**
 * 在企业咨询中发送简历
 * @param {Object} data 简历数据
 * @param {string} data.sessionId 会话ID
 * @param {string} data.resumeId 简历ID
 * @param {string} data.resumeUrl 简历文件URL
 * @param {string} [data.comment] 备注
 * @returns {Promise} 发送结果
 */
export const sendEnterpriseResume = (data) => {
  return post('/chat/enterprise/resume', data)
}

/**
 * 发送文本或文件消息（通用接口）
 * @param {Object} data 消息数据
 * @param {string} data.sessionId 会话ID
 * @param {string} data.messageType 消息类型（text/file/image/audio）
 * @param {string} [data.content] 文本内容
 * @param {string} [data.fileUrl] 文件URL
 * @param {string} [data.fileName] 文件名
 * @param {number} [data.fileSize] 文件大小
 * @param {string} [data.replyToMessageId] 回复的消息ID
 * @returns {Promise} 发送结果
 */
export const sendMessage = (data) => {
  return post('/chat/messages', data)
}

/**
 * 标记指定会话的消息为已读
 * @param {string} sessionId 会话ID
 * @param {Array} [messageIds] 消息ID列表，不传则标记所有未读消息
 * @returns {Promise} 标记结果
 */
export const markSessionMessagesAsRead = (sessionId, messageIds) => {
  return post(`/chat/sessions/${sessionId}/read`, { messageIds })
}

/**
 * 获取当前用户的会话列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.type] 会话类型
 * @param {string} [params.status] 会话状态
 * @returns {Promise} 会话列表
 */
export const getUserSessions = (params) => {
  return get('/chat/user/sessions', params)
}

/**
 * 创建新会话或获取已存在的会话
 * @param {Object} data 会话数据
 * @param {string} data.targetId 目标用户ID
 * @param {string} data.targetType 目标类型（lawyer/psychologist/enterprise）
 * @param {string} [data.serviceType] 服务类型
 * @returns {Promise} 会话信息
 */
export const createOrGetSession = (data) => {
  return post('/chat/sessions/create-or-get', data)
}

/**
 * 获取当前用户的未读消息总数
 * @returns {Promise} 未读消息总数
 */
export const getUserUnreadCount = () => {
  return get('/chat/user/unread-count')
}

/**
 * 获取心理咨询聊天页面数据
 * @param {string} sessionId 会话ID
 * @returns {Promise} 心理咨询聊天页面数据
 */
export const getPsychChatPageData = (sessionId) => {
  return get(`/chat/psych/${sessionId}/page-data`)
}

/**
 * 获取聊天页面的完整数据
 * @param {string} sessionId 会话ID
 * @returns {Promise} 聊天页面完整数据
 */
export const getChatPageData = (sessionId) => {
  return get(`/chat/${sessionId}/page-data`)
}

/**
 * 获取律师咨询聊天页面数据
 * @param {string} sessionId 会话ID
 * @returns {Promise} 律师咨询聊天页面数据
 */
export const getLawyerChatPageData = (sessionId) => {
  return get(`/chat/lawyer/${sessionId}/page-data`)
}

/**
 * 获取企业咨询聊天页面数据
 * @param {string} sessionId 会话ID
 * @returns {Promise} 企业咨询聊天页面数据
 */
export const getEnterpriseChatPageData = (sessionId) => {
  return get(`/chat/enterprise/${sessionId}/page-data`)
}

/**
 * 获取指定会话的详细信息
 * @param {string} sessionId 会话ID
 * @returns {Promise} 会话详细信息
 */
export const getSessionDetails = (sessionId) => {
  return get(`/chat/sessions/${sessionId}/details`)
}

/**
 * 删除指定的会话及其所有消息
 * @param {string} sessionId 会话ID
 * @returns {Promise} 删除结果
 */
export const deleteSessionAndMessages = (sessionId) => {
  return del(`/chat/sessions/${sessionId}/complete`)
}

/**
 * 获取指定会话的未读消息数量
 * @param {string} sessionId 会话ID
 * @returns {Promise} 未读消息数量
 */
export const getSessionUnreadCount = (sessionId) => {
  return get(`/chat/sessions/${sessionId}/unread-count`)
}

/**
 * 在指定会话中搜索消息
 * @param {string} sessionId 会话ID
 * @param {Object} params 搜索参数
 * @param {string} params.keyword 搜索关键词
 * @param {string} [params.messageType] 消息类型
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @returns {Promise} 搜索结果
 */
export const searchSessionMessages = (sessionId, params) => {
  return get(`/chat/sessions/${sessionId}/search`, params)
}

/**
 * 获取指定会话的消息列表
 * @param {string} sessionId 会话ID
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.beforeMessageId] 获取指定消息之前的消息
 * @param {string} [params.afterMessageId] 获取指定消息之后的消息
 * @param {string} [params.messageType] 消息类型筛选
 * @returns {Promise} 消息列表
 */
export const getSessionMessages = (sessionId, params) => {
  return get(`/chat/sessions/${sessionId}/messages/list`, params)
}

// 导出所有聊天相关API
export default {
  getChatSessions,
  createChatSession,
  getChatSessionDetail,
  updateChatSession,
  deleteChatSession,
  getChatMessages,
  sendTextMessage,
  sendImageMessage,
  sendFileMessage,
  sendAudioMessage,
  uploadChatFile,
  markMessageAsRead,
  markMessagesAsRead,
  recallMessage,
  deleteMessage,
  getUnreadCount,
  searchMessages,
  getChatStatistics,
  exportChatHistory,
  // 新增的聊天对话API
  uploadChatMedia,
  sendPsychTestResult,
  sendEnterpriseResume,
  sendMessage,
  markSessionMessagesAsRead,
  getUserSessions,
  createOrGetSession,
  getUserUnreadCount,
  getPsychChatPageData,
  getChatPageData,
  getLawyerChatPageData,
  getEnterpriseChatPageData,
  getSessionDetails,
  deleteSessionAndMessages,
  getSessionUnreadCount,
  searchSessionMessages,
  getSessionMessages
}