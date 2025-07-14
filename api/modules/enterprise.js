/**
 * 企业相关API
 * 包含企业信息、服务、员工管理等功能
 */

import { get, post, put, del } from '../request.js'

/**
 * 获取企业信息
 * @returns {Promise} 企业信息
 */
export const getEnterpriseInfo = () => {
  return get('/enterprise/info')
}

/**
 * 获取当前登录企业的详细信息
 * @returns {Promise} 企业详细信息
 */
export const getCurrentEnterpriseInfo = () => {
  return get('/enterprise/profile')
}

/**
 * 更新企业信息
 * @param {Object} data 企业信息
 * @param {string} [data.companyName] 企业名称
 * @param {string} [data.businessLicense] 营业执照号
 * @param {string} [data.legalPerson] 法人代表
 * @param {string} [data.contactPerson] 联系人
 * @param {string} [data.contactPhone] 联系电话
 * @param {string} [data.contactEmail] 联系邮箱
 * @param {string} [data.address] 企业地址
 * @param {string} [data.industry] 行业类型
 * @param {string} [data.description] 企业描述
 * @param {string} [data.website] 企业官网
 * @returns {Promise} 更新结果
 */
export const updateEnterpriseInfo = (data) => {
  return put('/enterprise/info', data)
}

/**
 * 更新企业详细信息
 * @param {Object} data 企业详细信息数据
 * @param {string} [data.companyName] 企业名称
 * @param {string} [data.businessLicense] 营业执照号
 * @param {string} [data.unifiedSocialCreditCode] 统一社会信用代码
 * @param {string} [data.legalPerson] 法人代表
 * @param {string} [data.registeredCapital] 注册资本
 * @param {string} [data.establishmentDate] 成立日期
 * @param {string} [data.businessScope] 经营范围
 * @param {string} [data.contactPerson] 联系人
 * @param {string} [data.contactPhone] 联系电话
 * @param {string} [data.contactEmail] 联系邮箱
 * @param {string} [data.registeredAddress] 注册地址
 * @param {string} [data.businessAddress] 经营地址
 * @param {string} [data.industry] 行业类型
 * @param {string} [data.companyType] 企业类型
 * @param {string} [data.description] 企业描述
 * @param {string} [data.website] 企业官网
 * @param {string} [data.logo] 企业Logo
 * @param {Array} [data.businessLicenseImages] 营业执照图片
 * @param {Object} [data.bankInfo] 银行信息
 * @returns {Promise} 更新结果
 */
export const updateEnterpriseDetailInfo = (data) => {
  return put('/enterprise/profile', data)
}







/**
 * 企业注册接口
 * @param {Object} data 注册数据
 * @param {string} data.companyName 企业名称
 * @param {string} data.businessLicense 营业执照号
 * @param {string} data.unifiedSocialCreditCode 统一社会信用代码
 * @param {string} data.legalPerson 法人代表
 * @param {string} data.contactPerson 联系人
 * @param {string} data.contactPhone 联系电话
 * @param {string} data.contactEmail 联系邮箱
 * @param {string} data.password 密码
 * @param {string} data.confirmPassword 确认密码
 * @param {string} data.registeredAddress 注册地址
 * @param {string} data.industry 行业类型
 * @param {string} data.companyType 企业类型
 * @param {Array} data.businessLicenseImages 营业执照图片
 * @param {string} [data.verificationCode] 验证码
 * @returns {Promise} 注册结果
 */
export const registerEnterprise = (data) => {
  return post('/enterprise/register', data)
}

/**
 * 删除企业账号及相关信息
 * @param {Object} data 删除确认数据
 * @param {string} data.password 当前密码
 * @param {string} [data.reason] 删除原因
 * @param {boolean} [data.deleteAllData] 是否删除所有相关数据
 * @param {string} [data.confirmText] 确认文本
 * @returns {Promise} 删除结果
 */
export const deleteEnterpriseAccount = (data) => {
  return del('/enterprise/account', data)
}

/**
 * 获取企业列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 企业列表
 */
export const getEnterpriseList = (params) => {
  return get('/enterprise/list', params)
}

// ==================== 企业招聘相关接口 ====================

/**
 * 更新职位信息
 * @param {string|number} jobId 职位ID
 * @param {Object} data 职位数据
 * @param {string} data.title 职位标题
 * @param {string} data.description 职位描述
 * @param {string} data.requirements 职位要求
 * @param {number} data.salaryMin 最低薪资
 * @param {number} data.salaryMax 最高薪资
 * @param {string} data.location 工作地点
 * @param {string} [data.workExperience] 工作经验要求
 * @param {string} [data.educationRequirement] 学历要求
 * @param {string} [data.jobType] 工作类型（full_time/part_time/internship/contract）
 * @returns {Promise} 更新结果
 */
export const updateJob = (jobId, data) => {
  return put(`/enterprise/jobs/${jobId}`, data)
}

/**
 * 删除职位（软删除）
 * @param {string|number} jobId 职位ID
 * @returns {Promise} 删除结果
 */
export const deleteJob = (jobId) => {
  return del(`/enterprise/jobs/${jobId}`)
}

/**
 * 获取当前企业的职位列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @returns {Promise} 职位列表
 */
export const getEnterpriseJobs = (params) => {
  return get('/enterprise/jobs', params)
}

/**
 * 发布新的招聘职位
 * @param {Object} data 职位数据
 * @param {string} data.title 职位标题
 * @param {string} data.description 职位描述
 * @param {string} data.requirements 职位要求
 * @param {number} data.salaryMin 最低薪资
 * @param {number} data.salaryMax 最高薪资
 * @param {string} data.location 工作地点
 * @param {string} [data.workExperience] 工作经验要求
 * @param {string} [data.educationRequirement] 学历要求
 * @param {string} [data.jobType] 工作类型（full_time/part_time/internship/contract）
 * @returns {Promise} 创建结果
 */
export const createJob = (data) => {
  return post('/enterprise/jobs', data)
}

/**
 * 记录职位浏览行为
 * @param {string|number} jobId 职位ID
 * @returns {Promise} 记录结果
 */
export const incrementJobViewCount = (jobId) => {
  return post(`/enterprise/jobs/${jobId}/view`)
}

/**
 * 上传简历文件
 * @param {File} file 简历文件
 * @returns {Promise} 上传结果，包含文件URL
 */
export const uploadResume = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return post('/enterprise/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 向指定职位投递简历
 * @param {string|number} jobId 职位ID
 * @param {Object} data 投递数据
 * @param {string} [data.resumeUrl] 简历文件URL
 * @param {string} [data.coverLetter] 求职信
 * @returns {Promise} 投递结果
 */
export const applyJob = (jobId, data) => {
  return post(`/enterprise/jobs/${jobId}/apply`, data)
}

/**
 * 企业更新简历投递申请的状态
 * @param {string|number} applicationId 申请ID
 * @param {Object} data 状态数据
 * @param {string} data.status 申请状态（pending/reviewing/interviewed/hired/rejected）
 * @param {string} [data.feedback] 反馈信息
 * @returns {Promise} 更新结果
 */
export const updateApplicationStatus = (applicationId, data) => {
  return put(`/enterprise/applications/${applicationId}/status`, data)
}

/**
 * 获取企业详情页数据，包括企业信息、在招职位和统计数据
 * @param {string|number} enterpriseId 企业ID
 * @returns {Promise} 企业详情数据
 */
export const getEnterpriseDetail = (enterpriseId) => {
  return get(`/enterprise/${enterpriseId}/detail`)
}

/**
 * 获取企业工作台数据，包括企业信息、职位统计、最新职位和投递记录
 * @returns {Promise} 企业工作台数据
 */
export const getEnterpriseWorkspace = () => {
  return get('/enterprise/workspace')
}

/**
 * 获取职位详情页数据，包括职位信息、企业信息和相关职位推荐
 * @param {string|number} jobId 职位ID
 * @returns {Promise} 职位详情数据
 */
export const getJobDetail = (jobId) => {
  return get(`/enterprise/jobs/${jobId}/detail`)
}

/**
 * 根据条件搜索职位
 * @param {Object} params 搜索参数
 * @param {string} [params.keyword] 关键词
 * @param {string} [params.location] 工作地点
 * @param {string} [params.jobType] 工作类型
 * @param {number} [params.salaryMin] 最低薪资
 * @param {number} [params.salaryMax] 最高薪资
 * @param {string} [params.workExperience] 工作经验
 * @param {string} [params.educationRequirement] 学历要求
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} params.sortBy 排序方式
 * @returns {Promise} 搜索结果
 */
export const searchJobs = (params) => {
  return get('/enterprise/jobs/search', params)
}

/**
 * 获取热门职位列表
 * @param {Object} params 查询参数
 * @param {number} params.limit 限制数量
 * @returns {Promise} 热门职位列表
 */
export const getHotJobs = (params) => {
  return get('/enterprise/jobs/hot', params)
}

/**
 * 获取简历投递申请的详细信息
 * @param {string|number} applicationId 申请ID
 * @returns {Promise} 申请详情
 */
export const getApplicationDetail = (applicationId) => {
  return get(`/enterprise/applications/${applicationId}`)
}

/**
 * 获取当前用户的简历投递记录
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.status] 申请状态筛选
 * @returns {Promise} 用户投递记录
 */
export const getUserApplications = (params) => {
  return get('/enterprise/applications/user', params)
}

/**
 * 获取企业收到的简历投递记录
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.size=10] 每页大小
 * @param {string} [params.status] 申请状态筛选
 * @param {string|number} [params.jobId] 职位ID筛选
 * @returns {Promise} 企业收到的投递记录
 */
export const getEnterpriseApplications = (params) => {
  return get('/enterprise/applications/enterprise', params)
}

// 导出所有企业相关API


export default {
  // 企业基本信息管理接口
  getEnterpriseInfo,
  updateEnterpriseInfo,
  getCurrentEnterpriseInfo,
  updateEnterpriseDetailInfo,
  registerEnterprise,
  deleteEnterpriseAccount,
  // 企业列表和详情接口
  getEnterpriseList,
  getEnterpriseDetail,
  getEnterpriseWorkspace,
  // 职位管理接口
  createJob,
  updateJob,
  deleteJob,
  getEnterpriseJobs,
  incrementJobViewCount,
  // 职位搜索和查询接口
  searchJobs,
  getJobDetail,
  getHotJobs,
  // 简历投递管理接口
  uploadResume,
  applyJob,
  updateApplicationStatus,
  getApplicationDetail,
  getUserApplications,
  getEnterpriseApplications
}