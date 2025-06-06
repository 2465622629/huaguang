/**
 * 管理端内容管理API使用示例
 * 包含心理测试、法律模板、课程等内容管理功能的使用方法
 */
import api from '@/api'

// ==================== 心理测试管理示例 ====================

/**
 * 心理测试管理完整工作流示例
 */
export const psychologicalTestWorkflow = {
  // 1. 获取心理测试列表
  async getTestList() {
    try {
      const result = await api.adminContent.getPsychologicalTestList({
        page: 1,
        size: 20,
        keyword: '焦虑',
        category: '心理健康',
        status: 'active'
      })
      console.log('心理测试列表:', result)
      return result
    } catch (error) {
      console.error('获取心理测试列表失败:', error)
    }
  },

  // 2. 创建新的心理测试
  async createTest() {
    try {
      const testData = {
        name: '焦虑自评量表',
        description: '用于评估个体焦虑水平的专业心理测试工具',
        questions: {
          'q1': '我感到比平常更加紧张和焦虑',
          'q2': '我无缘无故地感到害怕',
          'q3': '我容易心烦意乱或感到惊恐',
          'q4': '我感到我可能将要发疯',
          'q5': '我觉得一切都很好，不会有什么不幸发生'
        },
        scoringRules: {
          'low': '0-20分：焦虑水平较低',
          'medium': '21-40分：中等焦虑水平',
          'high': '41-60分：较高焦虑水平',
          'severe': '61-80分：严重焦虑水平'
        }
      }
      
      const result = await api.adminContent.createPsychologicalTest(testData)
      console.log('创建心理测试成功:', result)
      return result
    } catch (error) {
      console.error('创建心理测试失败:', error)
    }
  },

  // 3. 更新心理测试
  async updateTest(testId) {
    try {
      const updateData = {
        name: '焦虑自评量表（修订版）',
        description: '用于评估个体焦虑水平的专业心理测试工具（2024年修订版）',
        isActive: true
      }
      
      const result = await api.adminContent.updatePsychologicalTest(testId, updateData)
      console.log('更新心理测试成功:', result)
      return result
    } catch (error) {
      console.error('更新心理测试失败:', error)
    }
  },

  // 4. 批量操作心理测试
  async batchOperateTests() {
    try {
      const result = await api.adminContent.batchOperatePsychologicalTests({
        ids: [1, 2, 3],
        operation: 'activate' // 批量激活
      })
      console.log('批量操作心理测试成功:', result)
      return result
    } catch (error) {
      console.error('批量操作心理测试失败:', error)
    }
  },

  // 5. 删除心理测试
  async deleteTest(testId) {
    try {
      const result = await api.adminContent.deletePsychologicalTest(testId)
      console.log('删除心理测试成功:', result)
      return result
    } catch (error) {
      console.error('删除心理测试失败:', error)
    }
  }
}

// ==================== 法律模板管理示例 ====================

/**
 * 法律模板管理完整工作流示例
 */
export const legalTemplateWorkflow = {
  // 1. 获取法律模板列表
  async getTemplateList() {
    try {
      const result = await api.adminContent.getLegalTemplateList({
        page: 1,
        size: 15,
        keyword: '合同',
        category: '劳动法',
        status: 'active'
      })
      console.log('法律模板列表:', result)
      return result
    } catch (error) {
      console.error('获取法律模板列表失败:', error)
    }
  },

  // 2. 创建新的法律模板
  async createTemplate() {
    try {
      const templateData = {
        name: '劳动合同模板',
        category: '劳动法',
        description: '标准劳动合同模板，适用于一般企业员工聘用',
        templateFileUrl: 'https://example.com/templates/labor-contract.docx',
        fileType: 'docx',
        fileSize: 102400 // 100KB
      }
      
      const result = await api.adminContent.createLegalTemplate(templateData)
      console.log('创建法律模板成功:', result)
      return result
    } catch (error) {
      console.error('创建法律模板失败:', error)
    }
  },

  // 3. 更新法律模板
  async updateTemplate(templateId) {
    try {
      const updateData = {
        name: '劳动合同模板（2024版）',
        description: '标准劳动合同模板，适用于一般企业员工聘用（2024年最新版本）',
        isActive: true
      }
      
      const result = await api.adminContent.updateLegalTemplate(templateId, updateData)
      console.log('更新法律模板成功:', result)
      return result
    } catch (error) {
      console.error('更新法律模板失败:', error)
    }
  },

  // 4. 批量操作法律模板
  async batchOperateTemplates() {
    try {
      const result = await api.adminContent.batchOperateLegalTemplates({
        ids: [1, 2, 3, 4],
        operation: 'deactivate' // 批量禁用
      })
      console.log('批量操作法律模板成功:', result)
      return result
    } catch (error) {
      console.error('批量操作法律模板失败:', error)
    }
  },

  // 5. 删除法律模板
  async deleteTemplate(templateId) {
    try {
      const result = await api.adminContent.deleteLegalTemplate(templateId)
      console.log('删除法律模板成功:', result)
      return result
    } catch (error) {
      console.error('删除法律模板失败:', error)
    }
  }
}

// ==================== 课程管理示例 ====================

/**
 * 课程管理完整工作流示例
 */
export const courseWorkflow = {
  // 1. 获取课程列表
  async getCourseList() {
    try {
      const result = await api.adminContent.getCourseList({
        page: 1,
        size: 12,
        keyword: '心理咨询',
        category: '专业技能',
        status: 'active'
      })
      console.log('课程列表:', result)
      return result
    } catch (error) {
      console.error('获取课程列表失败:', error)
    }
  },

  // 2. 创建新课程
  async createCourse() {
    try {
      const courseData = {
        title: '心理咨询基础技能培训',
        description: '面向初学者的心理咨询基础技能培训课程，涵盖咨询理论、技巧和实践',
        category: '专业技能',
        instructorId: 123,
        price: 299.00,
        durationMinutes: 180, // 3小时
        coverImage: 'https://example.com/images/course-cover.jpg',
        videoUrl: 'https://example.com/videos/course-video.mp4',
        status: 'active'
      }
      
      const result = await api.adminContent.createCourse(courseData)
      console.log('创建课程成功:', result)
      return result
    } catch (error) {
      console.error('创建课程失败:', error)
    }
  },

  // 3. 更新课程
  async updateCourse(courseId) {
    try {
      const updateData = {
        title: '心理咨询基础技能培训（进阶版）',
        description: '面向初学者的心理咨询基础技能培训课程，涵盖咨询理论、技巧和实践（包含最新案例分析）',
        price: 399.00,
        status: 'active'
      }
      
      const result = await api.adminContent.updateCourse(courseId, updateData)
      console.log('更新课程成功:', result)
      return result
    } catch (error) {
      console.error('更新课程失败:', error)
    }
  },

  // 4. 批量操作课程
  async batchOperateCourses() {
    try {
      const result = await api.adminContent.batchOperateCourses({
        ids: [1, 2, 3, 4, 5],
        operation: 'activate' // 批量激活
      })
      console.log('批量操作课程成功:', result)
      return result
    } catch (error) {
      console.error('批量操作课程失败:', error)
    }
  },

  // 5. 删除课程
  async deleteCourse(courseId) {
    try {
      const result = await api.adminContent.deleteCourse(courseId)
      console.log('删除课程成功:', result)
      return result
    } catch (error) {
      console.error('删除课程失败:', error)
    }
  }
}

// ==================== 内容统计示例 ====================

/**
 * 获取内容统计信息
 */
export const getContentStatistics = async () => {
  try {
    const result = await api.adminContent.getContentStatistics()
    console.log('内容统计信息:', result)
    return result
  } catch (error) {
    console.error('获取内容统计信息失败:', error)
  }
}

// ==================== 综合管理工作流示例 ====================

/**
 * 内容管理综合工作流示例
 */
export const contentManagementWorkflow = async () => {
  try {
    console.log('=== 开始内容管理工作流 ===')
    
    // 1. 获取各类内容统计
    const statistics = await getContentStatistics()
    console.log('当前内容统计:', statistics)
    
    // 2. 管理心理测试
    console.log('\n=== 心理测试管理 ===')
    const testList = await psychologicalTestWorkflow.getTestList()
    
    if (testList && testList.data && testList.data.records.length > 0) {
      // 更新第一个测试
      await psychologicalTestWorkflow.updateTest(testList.data.records[0].id)
    }
    
    // 3. 管理法律模板
    console.log('\n=== 法律模板管理 ===')
    const templateList = await legalTemplateWorkflow.getTemplateList()
    
    if (templateList && templateList.data && templateList.data.records.length > 0) {
      // 更新第一个模板
      await legalTemplateWorkflow.updateTemplate(templateList.data.records[0].id)
    }
    
    // 4. 管理课程
    console.log('\n=== 课程管理 ===')
    const courseList = await courseWorkflow.getCourseList()
    
    if (courseList && courseList.data && courseList.data.records.length > 0) {
      // 更新第一个课程
      await courseWorkflow.updateCourse(courseList.data.records[0].id)
    }
    
    // 5. 获取更新后的统计信息
    const updatedStatistics = await getContentStatistics()
    console.log('\n更新后的内容统计:', updatedStatistics)
    
    console.log('=== 内容管理工作流完成 ===')
    
  } catch (error) {
    console.error('内容管理工作流执行失败:', error)
  }
}

// ==================== 错误处理示例 ====================

/**
 * 带错误处理的API调用示例
 */
export const safeApiCall = async (apiFunction, ...args) => {
  try {
    const result = await apiFunction(...args)
    return {
      success: true,
      data: result,
      error: null
    }
  } catch (error) {
    console.error('API调用失败:', error)
    
    // 根据错误类型进行不同处理
    if (error.response) {
      // 服务器返回错误响应
      const { status, data } = error.response
      return {
        success: false,
        data: null,
        error: {
          type: 'server_error',
          status,
          message: data.message || '服务器错误',
          code: data.code
        }
      }
    } else if (error.request) {
      // 网络错误
      return {
        success: false,
        data: null,
        error: {
          type: 'network_error',
          message: '网络连接失败，请检查网络设置'
        }
      }
    } else {
      // 其他错误
      return {
        success: false,
        data: null,
        error: {
          type: 'unknown_error',
          message: error.message || '未知错误'
        }
      }
    }
  }
}

/**
 * 使用安全API调用的示例
 */
export const safeContentManagement = {
  async getTestListSafely() {
    return await safeApiCall(
      api.adminContent.getPsychologicalTestList,
      { page: 1, size: 10 }
    )
  },
  
  async createTestSafely(testData) {
    return await safeApiCall(
      api.adminContent.createPsychologicalTest,
      testData
    )
  },
  
  async getTemplateListSafely() {
    return await safeApiCall(
      api.adminContent.getLegalTemplateList,
      { page: 1, size: 10 }
    )
  },
  
  async getCourseListSafely() {
    return await safeApiCall(
      api.adminContent.getCourseList,
      { page: 1, size: 10 }
    )
  }
}

export default {
  psychologicalTestWorkflow,
  legalTemplateWorkflow,
  courseWorkflow,
  getContentStatistics,
  contentManagementWorkflow,
  safeApiCall,
  safeContentManagement
}