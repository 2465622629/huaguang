/**
 * 聊天相关API
 * 包含聊天会话、消息、文件传输等功能
 */

import { get, post, put, del, upload } from '../request.js'

/**
 * 获取会话列表
 * @param {object} params - 查询参数
 * @param {('all'|'private'|'consultation')} params.type - 会话类型：all-全部, private-私聊, consultation-咨询
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 */
export const getChatSessions = (params) => {
  return get('/chat/conversations', params)
}

/**
 * 创建或获取聊天会话
 * @param {Object} data 会话数据
 * @param {number} data.otherUserId 对方用户ID
 * @param {string} data.type 会话类型, 支持 'all', 'private', 'consultation'
 * @param {number} [data.consultationOrderId] 咨询订单ID（咨询会话时需要）
 * @returns {Promise} 会话信息
 */
export const createChatSession = (data) => {
  return post('/chat/conversations', data)
}

/**
 * 获取聊天会话详情
 * @param {number} conversationId 会话ID
 * @returns {Promise} 会话详情
 */
export const getChatSessionDetail = (conversationId) => {
  return get(`/chat/conversations/${conversationId}`)
}



/**
 * 删除聊天会话
 * @param {number} conversationId 会话ID
 * @returns {Promise} 删除结果
 */
export const deleteChatSession = (conversationId) => {
  return del(`/chat/conversations/${conversationId}`)
}

/**
 * 获取聊天消息列表
 * @param {number} conversationId 会话ID
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=20] 每页数量
 * @param {string} [params.messageType] 消息类型过滤（可选）
 * @param {number} [params.targetId] 目标用户ID（可选）
 * @returns {Promise} 消息列表
 */
export const getChatMessages = (conversationId, params = {}) => {
  // 设置默认参数
  const defaultParams = {
    page: 1,
    size: 20,
    ...params
  }
  
  return get(`/chat/conversations/${conversationId}/messages`, defaultParams)
}

/**
 * 发送消息（通用接口）
 * @param {Object} data 消息数据
 * @param {number} data.conversationId 会话ID
 * @param {string} data.messageType 消息类型（text/file/image/audio）
 * @param {string} [data.content] 文本内容
 * @param {string} [data.fileUrl] 文件URL
 * @param {string} [data.fileName] 文件名
 * @param {number} [data.fileSize] 文件大小
 * @param {number} [data.replyToMessageId] 回复的消息ID
 * @returns {Promise} 发送结果
 */
export const sendMessage = (data) => {
  return post('/chat/messages', data)
}

/**
 * 标记消息为已读
 * @param {Object} data 标记数据
 * @param {number} data.conversationId 会话ID
 * @returns {Promise} 标记结果
 */
export const markMessagesAsRead = (data) => {
  return post('/chat/messages/mark-read', data)
}

/**
 * 上传聊天文件
 * @param {File|Object} file 文件对象或文件路径对象
 * @param {string} fileType 文件类型（image/file/audio）
 * @param {number} conversationId 会话ID
 * @returns {Promise} 上传结果
 */
export const uploadChatFile = (file, fileType, conversationId) => {
  // 处理文件路径或文件对象
  const filePath = file.path || file
  const fileName = file.name || 'file'
  
  return upload(`/chat/upload?fileType=${encodeURIComponent(fileType)}&conversationId=${conversationId}`, filePath, {
    name: 'file',
    formData: {
      fileName: fileName
    }
  })
}

/**
 * 发送简历
 * @param {Object} params 参数
 * @param {number} params.conversationId 会话ID
 * @param {number} params.resumeFileId 简历文件ID
 * @returns {Promise} 发送结果
 */
export const sendEnterpriseResume = (params) => {
  return post('/chat/send-resume', null, params)
}

/**
 * 发送测试结果
 * @param {Object} params 参数
 * @param {number} params.conversationId 会话ID
 * @param {number} params.testResultId 测试结果ID
 * @returns {Promise} 发送结果
 */
export const sendPsychTestResult = (params) => {
  const { conversationId, testResultId } = params
  return post(`/chat/send-test-result?conversationId=${conversationId}&testResultId=${testResultId}`)
}

/**
 * 获取未读消息数量
 * @returns {Promise} 未读消息数量
 */
export const getUnreadCount = () => {
  return get('/chat/unread-count')
}

/**
 * 获取会话未读消息数量
 * @param {number} conversationId 会话ID
 * @returns {Promise} 未读消息数量
 */
export const getSessionUnreadCount = (conversationId) => {
  return get(`/chat/conversations/${conversationId}/unread-count`)
}

/**
 * 搜索消息
 * @param {number} conversationId 会话ID
 * @param {Object} params 搜索参数
 * @param {string} params.keyword 搜索关键词
 * @returns {Promise} 搜索结果
 */
export const searchMessages = (conversationId, params) => {
  return get(`/chat/conversations/${conversationId}/search`, params)
}

/**
 * 获取律师咨询聊天页面数据
 * @param {number} conversationId 会话ID
 * @returns {Promise} 律师咨询聊天页面数据
 */
export const getLawyerChatPageData = (conversationId) => {
  return get(`/chat/lawyer/${conversationId}`)
}

/**
 * 获取企业咨询聊天页面数据
 * @param {number} conversationId 会话ID
 * @returns {Promise} 企业咨询聊天页面数据
 */
export const getEnterpriseChatPageData = (conversationId) => {
  return get(`/chat/enterprise/${conversationId}`)
}

/**
 * 获取心理咨询聊天页面数据
 * @param {number} conversationId 会话ID
 * @returns {Promise} 心理咨询聊天页面数据
 */
export const getPsychChatPageData = (conversationId) => {
  return get(`/chat/psychology/${conversationId}`)
}

/**
 * 获取聊天页面数据
 * @param {number} conversationId 会话ID
 * @returns {Promise} 聊天页面数据
 */
export const getChatPageData = (conversationId) => {
  return get(`/chat/page/${conversationId}`)
}

// 导出所有聊天相关API
export default {
  getChatSessions,
  createChatSession,
  getChatSessionDetail,
  deleteChatSession,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  uploadChatFile,
  sendEnterpriseResume,
  sendPsychTestResult,
  getUnreadCount,
  getSessionUnreadCount,
  searchMessages,
  getLawyerChatPageData,
  getEnterpriseChatPageData,
  getPsychChatPageData,
  getChatPageData
}