/**
 * API配置管理
 * 集中管理所有API相关配置
 */

// 导入原有配置
import { API_CONFIG, staticBaseUrl } from '@/config/index'

// API配置
export const apiConfig = {
  ...API_CONFIG,
  // 可以在这里扩展更多配置
  RETRY_COUNT: 3, // 重试次数
  CACHE_TIME: 5 * 60 * 1000, // 缓存时间 5分钟
}

// 静态资源配置
export const staticConfig = {
  baseUrl: staticBaseUrl,
  imageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  videoTypes: ['mp4', 'avi', 'mov', 'wmv'],
  documentTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
}

// 业务配置
export const businessConfig = {
  // 分页配置
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  },
  
  // 文件上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      document: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      video: ['mp4', 'avi', 'mov']
    }
  },
  
  // 聊天配置
  chat: {
    messagePageSize: 20,
    maxMessageLength: 1000,
    fileUploadTimeout: 30000
  },
  
  // 验证码配置
  sms: {
    codeLength: 6,
    expireTime: 5 * 60, // 5分钟
    resendInterval: 60 // 60秒
  }
}

// 错误码配置
export const errorCodes = {
  SUCCESS: 0,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  NETWORK_ERROR: -1,
  TIMEOUT: -2
}

// 用户类型配置
export const userTypes = {
  USER: 'user',
  LAWYER: 'lawyer',
  PSYCHOLOGIST: 'psychologist',
  ENTERPRISE: 'enterprise',
  ADMIN: 'admin'
}

// 服务类型配置
export const serviceTypes = {
  LEGAL_CONSULTATION: 'legal_consultation',
  PSYCHOLOGICAL_CONSULTATION: 'psychological_consultation',
  ENTERPRISE_CONSULTATION: 'enterprise_consultation',
  LEGAL_DOCUMENT: 'legal_document',
  FUND_APPLICATION: 'fund_application'
}

// 导出默认配置
export default {
  apiConfig,
  staticConfig,
  businessConfig,
  errorCodes,
  userTypes,
  serviceTypes
}