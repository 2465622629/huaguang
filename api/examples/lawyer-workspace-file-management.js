/**
 * 律师工作台和文件管理API使用示例
 * 展示如何使用律师工作台相关接口和文件管理功能
 */

import api from '../index.js'

// ==================== 律师工作台API使用示例 ====================

/**
 * 获取律师的接单设置
 */
export const getLawyerOrderSettingsExample = async () => {
  try {
    const response = await api.lawyerWorkspace.getOrderSettings()
    console.log('律师接单设置:', response.data)
    return response.data
  } catch (error) {
    console.error('获取接单设置失败:', error)
    throw error
  }
}

/**
 * 更新律师的接单设置
 */
export const updateLawyerOrderSettingsExample = async () => {
  try {
    const settingsData = {
      autoAcceptOrder: true,
      maxDailyOrders: 10,
      serviceTypes: ['consultation', 'document_review'],
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      weekdays: [1, 2, 3, 4, 5] // 周一到周五
    }
    
    const response = await api.lawyerWorkspace.updateOrderSettings(settingsData)
    console.log('接单设置更新成功:', response.data)
    return response.data
  } catch (error) {
    console.error('更新接单设置失败:', error)
    throw error
  }
}

/**
 * 获取律师的通知设置
 */
export const getLawyerNotificationSettingsExample = async () => {
  try {
    const response = await api.lawyerWorkspace.getNotificationSettings()
    console.log('律师通知设置:', response.data)
    return response.data
  } catch (error) {
    console.error('获取通知设置失败:', error)
    throw error
  }
}

/**
 * 更新律师的通知设置
 */
export const updateLawyerNotificationSettingsExample = async () => {
  try {
    const notificationData = {
      emailNotification: true,
      smsNotification: false,
      pushNotification: true,
      notificationTypes: {
        newOrder: true,
        orderUpdate: true,
        payment: true,
        systemMessage: false
      }
    }
    
    const response = await api.lawyerWorkspace.updateNotificationSettings(notificationData)
    console.log('通知设置更新成功:', response.data)
    return response.data
  } catch (error) {
    console.error('更新通知设置失败:', error)
    throw error
  }
}

/**
 * 律师申请提现
 */
export const lawyerWithdrawExample = async () => {
  try {
    const withdrawData = {
      amount: 1000.00,
      bankAccount: '6222021234567890123',
      bankName: '中国工商银行',
      accountName: '张律师',
      withdrawReason: '月度收入提现'
    }
    
    const response = await api.lawyerWorkspace.applyWithdraw(withdrawData)
    console.log('提现申请提交成功:', response.data)
    return response.data
  } catch (error) {
    console.error('提现申请失败:', error)
    throw error
  }
}

/**
 * 获取律师个人中心数据
 */
export const getLawyerProfileCenterExample = async () => {
  try {
    const response = await api.lawyerWorkspace.getProfileCenter()
    console.log('律师个人中心数据:', response.data)
    return response.data
  } catch (error) {
    console.error('获取个人中心数据失败:', error)
    throw error
  }
}

/**
 * 获取律师的收入统计数据
 */
export const getLawyerIncomeStatsExample = async () => {
  try {
    const params = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      period: 'month' // day, week, month, year
    }
    
    const response = await api.lawyerWorkspace.getIncomeStats(params)
    console.log('律师收入统计:', response.data)
    return response.data
  } catch (error) {
    console.error('获取收入统计失败:', error)
    throw error
  }
}

/**
 * 获取律师的收入明细列表
 */
export const getLawyerIncomeDetailsExample = async () => {
  try {
    const params = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      serviceType: 'consultation', // consultation, document_review, legal_advice
      page: 1,
      size: 20
    }
    
    const response = await api.lawyerWorkspace.getIncomeDetails(params)
    console.log('律师收入明细:', response.data)
    return response.data
  } catch (error) {
    console.error('获取收入明细失败:', error)
    throw error
  }
}

/**
 * 获取律师工作台主页数据
 */
export const getLawyerWorkspaceHomeExample = async () => {
  try {
    const response = await api.lawyerWorkspace.getWorkspaceHome()
    console.log('律师工作台主页数据:', response.data)
    return response.data
  } catch (error) {
    console.error('获取工作台主页数据失败:', error)
    throw error
  }
}

/**
 * 获取法律文书审核列表
 */
export const getDocumentReviewListExample = async () => {
  try {
    const params = {
      status: 'pending', // pending, reviewing, completed, rejected
      page: 1,
      size: 20,
      sortBy: 'createTime',
      sortOrder: 'desc'
    }
    
    const response = await api.lawyerWorkspace.getDocumentReviewList(params)
    console.log('法律文书审核列表:', response.data)
    return response.data
  } catch (error) {
    console.error('获取文书审核列表失败:', error)
    throw error
  }
}

/**
 * 获取咨询信息管理列表
 */
export const getConsultationManagementListExample = async () => {
  try {
    const params = {
      status: 'active', // active, completed, cancelled
      page: 1,
      size: 20,
      sortBy: 'createTime',
      sortOrder: 'desc'
    }
    
    const response = await api.lawyerWorkspace.getConsultationManagementList(params)
    console.log('咨询信息管理列表:', response.data)
    return response.data
  } catch (error) {
    console.error('获取咨询管理列表失败:', error)
    throw error
  }
}

// ==================== 文件管理API使用示例 ====================

/**
 * 文件上传示例
 */
export const uploadFileExample = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'document') // document, image, video, audio
    formData.append('description', '法律文件上传')
    
    const response = await api.fileManagement.uploadFile(formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`上传进度: ${percentCompleted}%`)
      }
    })
    
    console.log('文件上传成功:', response.data)
    return response.data
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

/**
 * 批量文件上传示例
 */
export const uploadMultipleFilesExample = async (files) => {
  try {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })
    formData.append('category', 'document')
    
    const response = await api.fileManagement.uploadMultipleFiles(formData)
    console.log('批量文件上传成功:', response.data)
    return response.data
  } catch (error) {
    console.error('批量文件上传失败:', error)
    throw error
  }
}

/**
 * 获取文件信息示例
 */
export const getFileInfoExample = async () => {
  try {
    const filePath = '/uploads/documents/contract_2024.pdf'
    const response = await api.fileManagement.getFileInfo(filePath)
    console.log('文件信息:', response.data)
    return response.data
  } catch (error) {
    console.error('获取文件信息失败:', error)
    throw error
  }
}

/**
 * 检查文件是否存在示例
 */
export const checkFileExistsExample = async () => {
  try {
    const filePath = '/uploads/documents/contract_2024.pdf'
    const response = await api.fileManagement.checkFileExists(filePath)
    console.log('文件存在性检查:', response.data)
    return response.data
  } catch (error) {
    console.error('检查文件存在性失败:', error)
    throw error
  }
}

/**
 * 删除文件示例
 */
export const deleteFileExample = async () => {
  try {
    const filePath = '/uploads/documents/old_contract.pdf'
    const response = await api.fileManagement.deleteFile(filePath)
    console.log('文件删除成功:', response.data)
    return response.data
  } catch (error) {
    console.error('删除文件失败:', error)
    throw error
  }
}

/**
 * 文件下载示例
 */
export const downloadFileExample = async () => {
  try {
    const filePath = '/uploads/documents/contract_2024.pdf'
    const fileName = '合同文件_2024.pdf'
    
    const response = await api.fileManagement.downloadFile(filePath, fileName)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    console.log('文件下载成功')
  } catch (error) {
    console.error('文件下载失败:', error)
    throw error
  }
}

/**
 * 获取文件访问URL示例
 */
export const getFileAccessUrlExample = () => {
  const filePath = '/uploads/images/avatar.jpg'
  const accessUrl = api.fileManagement.getFileAccessUrl(filePath)
  console.log('文件访问URL:', accessUrl)
  return accessUrl
}

/**
 * 获取文件预览URL示例
 */
export const getFilePreviewUrlExample = () => {
  const filePath = '/uploads/images/document.jpg'
  const previewUrl = api.fileManagement.getFilePreviewUrl(filePath, {
    width: 800,
    height: 600,
    quality: 'high'
  })
  console.log('文件预览URL:', previewUrl)
  return previewUrl
}

/**
 * 获取文件列表示例
 */
export const getFileListExample = async () => {
  try {
    const params = {
      directory: '/uploads/documents',
      fileType: 'pdf',
      keyword: '合同',
      page: 1,
      size: 20,
      sortBy: 'createTime',
      sortOrder: 'desc'
    }
    
    const response = await api.fileManagement.getFileList(params)
    console.log('文件列表:', response.data)
    return response.data
  } catch (error) {
    console.error('获取文件列表失败:', error)
    throw error
  }
}

// ==================== 综合工作流示例 ====================

/**
 * 律师工作台完整工作流示例
 */
export const lawyerWorkspaceWorkflowExample = async () => {
  try {
    console.log('=== 律师工作台完整工作流 ===')
    
    // 1. 获取工作台主页数据
    const homeData = await getLawyerWorkspaceHomeExample()
    
    // 2. 检查并更新接单设置
    const orderSettings = await getLawyerOrderSettingsExample()
    if (!orderSettings.autoAcceptOrder) {
      await updateLawyerOrderSettingsExample()
    }
    
    // 3. 获取收入统计
    const incomeStats = await getLawyerIncomeStatsExample()
    
    // 4. 获取待处理的文书审核
    const pendingReviews = await getDocumentReviewListExample()
    
    // 5. 获取活跃咨询
    const activeConsultations = await getConsultationManagementListExample()
    
    console.log('律师工作台工作流完成')
    return {
      homeData,
      orderSettings,
      incomeStats,
      pendingReviews,
      activeConsultations
    }
  } catch (error) {
    console.error('律师工作台工作流执行失败:', error)
    throw error
  }
}

/**
 * 文件管理完整工作流示例
 */
export const fileManagementWorkflowExample = async (files) => {
  try {
    console.log('=== 文件管理完整工作流 ===')
    
    // 1. 批量上传文件
    const uploadResult = await uploadMultipleFilesExample(files)
    
    // 2. 获取文件列表
    const fileList = await getFileListExample()
    
    // 3. 检查特定文件是否存在
    const fileExists = await checkFileExistsExample()
    
    // 4. 获取文件信息
    const fileInfo = await getFileInfoExample()
    
    // 5. 生成文件访问URL
    const accessUrl = getFileAccessUrlExample()
    
    console.log('文件管理工作流完成')
    return {
      uploadResult,
      fileList,
      fileExists,
      fileInfo,
      accessUrl
    }
  } catch (error) {
    console.error('文件管理工作流执行失败:', error)
    throw error
  }
}

// 导出所有示例函数
export default {
  // 律师工作台示例
  getLawyerOrderSettingsExample,
  updateLawyerOrderSettingsExample,
  getLawyerNotificationSettingsExample,
  updateLawyerNotificationSettingsExample,
  lawyerWithdrawExample,
  getLawyerProfileCenterExample,
  getLawyerIncomeStatsExample,
  getLawyerIncomeDetailsExample,
  getLawyerWorkspaceHomeExample,
  getDocumentReviewListExample,
  getConsultationManagementListExample,
  
  // 文件管理示例
  uploadFileExample,
  uploadMultipleFilesExample,
  getFileInfoExample,
  checkFileExistsExample,
  deleteFileExample,
  downloadFileExample,
  getFileAccessUrlExample,
  getFilePreviewUrlExample,
  getFileListExample,
  
  // 工作流示例
  lawyerWorkspaceWorkflowExample,
  fileManagementWorkflowExample
}