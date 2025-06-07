import request from './request'
import { API_CONFIG } from '@/config/index'

/**
 * 文件上传工具
 * 
 * 注意：推荐使用新的API管理系统 @/api
 * 新功能请使用 @/api/modules/common.js 中的文件上传方法
 */

/**
 * 文件上传
 * @param {Object} options 上传选项
 * @param {File} options.file 要上传的文件
 * @param {string} [options.businessType] 业务类型
 * @param {string} [options.businessId] 业务ID
 * @returns {Promise<{fileId: number, fileName: string, fileUrl: string, fileSize: number, fileType: string}>}
 */
export const uploadFile = async (options) => {
  try {
    // 构建完整的URL，包含query参数
    let url = '/file/upload'
    if (options.businessType || options.businessId) {
      const params = new URLSearchParams()
      if (options.businessType) params.append('businessType', options.businessType)
      if (options.businessId) params.append('businessId', options.businessId)
      url += `?${params.toString()}`
    }

    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${API_CONFIG.BASE_URL}${url}`,
        filePath: options.file.path || options.file,
        name: 'file',
        // 移除Content-Type设置，让uni.uploadFile自动设置正确的multipart/form-data和boundary
        success: (uploadRes) => {
          try {
            console.log('上传响应原始数据：', uploadRes)
            const res = JSON.parse(uploadRes.data)
            console.log('解析后的响应数据：', res)
            
            // 处理不同的响应格式
            if (res.code === 0 || res.code === 200 || uploadRes.statusCode === 200) {
              // 如果有data字段，使用data；否则使用整个res作为结果
              const resultData = res.data || res
              resolve(resultData)
            } else {
              reject(new Error(res.message || '文件上传失败'))
            }
          } catch (error) {
            console.error('解析响应数据失败：', error)
            // 如果解析失败，检查是否是HTTP 200成功响应
            if (uploadRes.statusCode === 200) {
              console.log('HTTP状态码200，但解析JSON失败，可能是纯文本响应')
              resolve({ message: uploadRes.data })
            } else {
              reject(new Error('解析响应数据失败'))
            }
          }
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '文件上传失败'))
        }
      })
    })
  } catch (error) {
    console.error('文件上传失败：', error)
    throw error
  }
}

/**
 * 文件下载
 * @param {Object} options 下载选项
 * @param {string} options.fileId 文件ID
 * @param {string} [options.fileName] 下载后的文件名
 * @returns {Promise<void>}
 */
export const downloadFile = async (options) => {
  try {
    // 先获取文件信息
    const fileInfo = await request({
      url: `/file/info/${options.fileId}`,
      method: 'GET'
    })

    if (fileInfo.code !== 0) {
      throw new Error(fileInfo.message || '获取文件信息失败')
    }

    // 使用uni.downloadFile下载文件
    const downloadTask = uni.downloadFile({
      url: fileInfo.data.fileUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存文件到本地
          uni.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              uni.showToast({
                title: '下载成功',
                icon: 'success'
              })
            },
            fail: (err) => {
              console.error('保存文件失败：', err)
              uni.showToast({
                title: '保存文件失败',
                icon: 'none'
              })
            }
          })
        } else {
          throw new Error('下载失败')
        }
      },
      fail: (err) => {
        console.error('下载文件失败：', err)
        throw new Error('下载文件失败')
      }
    })

    // 监听下载进度
    downloadTask.onProgressUpdate((res) => {
      console.log('下载进度：', res.progress)
    })

  } catch (error) {
    console.error('文件下载失败：', error)
    uni.showToast({
      title: error.message || '下载失败',
      icon: 'none'
    })
    throw error
  }
}

/**
 * 生成文件临时访问链接
 * @param {Object} options 选项
 * @param {number} options.fileId 文件ID
 * @param {number} [options.expireTime] 过期时间（分钟）
 * @returns {Promise<string>} 临时访问链接
 */
export const generateTempUrl = async (options) => {
  try {
    const res = await request({
      url: '/file/temp-url',
      method: 'GET',
      params: {
        fileId: options.fileId,
        expireTime: options.expireTime
      }
    })

    if (res.code === 0 && res.data) {
      // 获取返回数据中的第一个key作为临时链接
      const tempUrl = Object.keys(res.data)[0]
      return tempUrl
    } else {
      throw new Error(res.message || '生成临时链接失败')
    }
  } catch (error) {
    console.error('生成临时链接失败：', error)
    throw error
  }
}

/**
 * 删除文件
 * @param {Object} options 选项
 * @param {string} options.fileId 文件ID
 * @returns {Promise<boolean>} 删除结果
 */
export const deleteFile = async (options) => {
  try {
    const res = await request({
      url: `/file/${options.fileId}`,
      method: 'DELETE'
    })

    if (res.code === 0) {
      return res.data
    } else {
      throw new Error(res.message || '文件删除失败')
    }
  } catch (error) {
    console.error('文件删除失败：', error)
    throw error
  }
}

/**
 * 文件处理工具类
 */
export default {
  uploadFile,
  downloadFile,
  generateTempUrl,
  deleteFile
}