/**
 * 文件管理API
 * 包含文件上传、获取文件信息、检查文件存在性、删除文件等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 文件上传
 * @param {FormData} formData 文件数据
 * @param {Object} config 上传配置
 * @param {Function} [config.onUploadProgress] 上传进度回调
 * @returns {Promise} 上传结果
 */
export const uploadFile = (formData, config = {}) => {
  return post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

/**
 * 批量文件上传
 * @param {FormData} formData 包含多个文件的表单数据
 * @param {Object} config 上传配置
 * @param {Function} [config.onUploadProgress] 上传进度回调
 * @returns {Promise} 批量上传结果
 */
export const uploadMultipleFiles = (formData, config = {}) => {
  return post('/files/upload/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

/**
 * 根据文件路径获取文件详细信息
 * @param {string} filePath 文件路径
 * @returns {Promise} 文件详细信息
 */
export const getFileInfo = (filePath) => {
  return get('/files/info', { filePath })
}

/**
 * 检查指定路径的文件是否存在
 * @param {string} filePath 文件路径
 * @returns {Promise} 文件存在性检查结果
 */
export const checkFileExists = (filePath) => {
  return get('/files/exists', { filePath })
}

/**
 * 根据文件路径删除指定文件
 * @param {string} filePath 文件路径
 * @returns {Promise} 删除结果
 */
export const deleteFile = (filePath) => {
  return del('/files/delete', { filePath })
}

/**
 * 批量删除文件
 * @param {Array<string>} filePaths 文件路径数组
 * @returns {Promise} 批量删除结果
 */
export const deleteMultipleFiles = (filePaths) => {
  return del('/files/delete/batch', { filePaths })
}

/**
 * 强制下载文件
 * @param {string} filePath 文件路径
 * @param {string} [fileName] 下载时的文件名
 * @returns {Promise} 下载链接或文件流
 */
export const downloadFile = (filePath, fileName) => {
  const params = { filePath }
  if (fileName) {
    params.fileName = fileName
  }
  return get('/files/download', params, {
    responseType: 'blob'
  })
}

/**
 * 直接访问上传的文件
 * @param {string} filePath 文件路径
 * @returns {string} 文件访问URL
 */
export const getFileAccessUrl = (filePath) => {
  // 构建文件访问URL
  const baseUrl = process.env.VUE_APP_API_BASE_URL || '/api'
  return `${baseUrl}/files/access?filePath=${encodeURIComponent(filePath)}`
}

/**
 * 获取文件预览URL
 * @param {string} filePath 文件路径
 * @param {Object} options 预览选项
 * @param {number} [options.width] 预览宽度
 * @param {number} [options.height] 预览高度
 * @param {string} [options.quality] 预览质量
 * @returns {string} 文件预览URL
 */
export const getFilePreviewUrl = (filePath, options = {}) => {
  const baseUrl = process.env.VUE_APP_API_BASE_URL || '/api'
  const queryParams = new URLSearchParams({
    filePath,
    ...options
  })
  return `${baseUrl}/files/preview?${queryParams.toString()}`
}

/**
 * 获取文件列表
 * @param {Object} params 查询参数
 * @param {string} [params.directory] 目录路径
 * @param {string} [params.fileType] 文件类型筛选
 * @param {string} [params.keyword] 搜索关键词
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=20] 每页大小
 * @param {string} [params.sortBy] 排序字段
 * @param {string} [params.sortOrder] 排序方向
 * @returns {Promise} 文件列表
 */
export const getFileList = (params) => {
  return get('/files/list', params)
}

/**
 * 创建文件夹
 * @param {Object} data 文件夹数据
 * @param {string} data.folderPath 文件夹路径
 * @param {string} [data.description] 文件夹描述
 * @returns {Promise} 创建结果
 */
export const createFolder = (data) => {
  return post('/files/folder/create', data)
}

/**
 * 删除文件夹
 * @param {string} folderPath 文件夹路径
 * @param {boolean} [recursive=false] 是否递归删除
 * @returns {Promise} 删除结果
 */
export const deleteFolder = (folderPath, recursive = false) => {
  return del('/files/folder/delete', { folderPath, recursive })
}

/**
 * 重命名文件或文件夹
 * @param {Object} data 重命名数据
 * @param {string} data.oldPath 原路径
 * @param {string} data.newPath 新路径
 * @returns {Promise} 重命名结果
 */
export const renameFile = (data) => {
  return put('/files/rename', data)
}

/**
 * 移动文件或文件夹
 * @param {Object} data 移动数据
 * @param {string} data.sourcePath 源路径
 * @param {string} data.targetPath 目标路径
 * @returns {Promise} 移动结果
 */
export const moveFile = (data) => {
  return put('/files/move', data)
}

/**
 * 复制文件或文件夹
 * @param {Object} data 复制数据
 * @param {string} data.sourcePath 源路径
 * @param {string} data.targetPath 目标路径
 * @returns {Promise} 复制结果
 */
export const copyFile = (data) => {
  return post('/files/copy', data)
}

// 导出所有文件管理相关API
export default {
  uploadFile,
  uploadMultipleFiles,
  getFileInfo,
  checkFileExists,
  deleteFile,
  deleteMultipleFiles,
  downloadFile,
  getFileAccessUrl,
  getFilePreviewUrl,
  getFileList,
  createFolder,
  deleteFolder,
  renameFile,
  moveFile,
  copyFile
}