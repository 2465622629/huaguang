/**
 * 企业招聘相关API
 * 包含职位管理、简历投递、企业信息等功能
 */

import { get, post, put, del, upload } from '../request.js'

/**
 * 更新职位信息
 * @param {string} jobId 职位ID
 * @param {Object} data 职位数据
 * @param {string} [data.title] 职位标题
 * @param {string} [data.description] 职位描述
 * @param {string} [data.requirements] 职位要求
 * @param {string} [data.salary] 薪资范围
 * @param {string} [data.location] 工作地点
 * @param {string} [data.type] 工作类型
 * @param {string} [data.experience] 经验要求
 * @param {string} [data.education] 学历要求
 * @param {Array} [data.skills] 技能要求
 * @param {string} [data.department] 所属部门
 * @param {number} [data.count] 招聘人数
 * @param {Date} [data.deadline] 截止日期
 * @returns {Promise} 更新结果
 */
export const updateJobInfo = (jobId, data) => {
  return put(`/recruitment/jobs/${jobId}`, data)
}

/**
 * 删除职位（软删除）
 * @param {string} jobId 职位ID
 * @returns {Promise} 删除结果
 */
export const deleteJob = (jobId) => {
  return del(`/recruitment/jobs/${jobId}`)
}

/**
 * 获取当前用户的企业信息
 * @returns {Promise} 企业信息
 */
export const getCurrentEnterpriseInfo = () => {
  return get('/recruitment/enterprise/current')
}

/**
 * 更新企业基本信息
 * @param {Object} data 企业信息
 * @param {string} [data.name] 企业名称
 * @param {string} [data.description] 企业描述
 * @param {string} [data.industry] 行业类型
 * @param {string} [data.scale] 企业规模
 * @param {string} [data.address] 企业地址
 * @param {string} [data.website] 企业官网
 * @param {string} [data.logo] 企业logo
 * @param {string} [data.contactPhone] 联系电话
 * @param {string} [data.contactEmail] 联系邮箱
 * @param {string} [data.businessLicense] 营业执照
 * @param {string} [data.legalPerson] 法人代表
 * @returns {Promise} 更新结果
 */
export const updateEnterpriseBasicInfo = (data) => {
  return put('/recruitment/enterprise/basic', data)
}

/**
 * 企业更新简历投递申请的状态
 * @param {string} applicationId 申请ID
 * @param {Object} data 状态数据
 * @param {string} data.status 状态（pending/reviewing/interviewed/hired/rejected）
 * @param {string} [data.remark] 备注
 * @param {Date} [data.interviewTime] 面试时间
 * @param {string} [data.interviewLocation] 面试地点
 * @returns {Promise} 更新结果
 */
export const updateApplicationStatus = (applicationId, data) => {
  return put(`/recruitment/applications/${applicationId}/status`, data)
}

/**
 * 上传简历文件
 * @param {string} filePath 文件路径
 * @param {Object} options 上传选项
 * @param {string} [options.name] 文件字段名
 * @param {Object} [options.formData] 额外表单数据
 * @returns {Promise} 上传结果
 */
export const uploadResume = (filePath, options = {}) => {
  return upload('/recruitment/resume/upload', filePath, {
    name: 'resume',
    ...options
  })
}

/**
 * 获取当前企业的职位列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.pageSize=10] 每页数量
 * @param {string} [params.status] 职位状态
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.department] 部门
 * @returns {Promise} 职位列表
 */
export const getEnterpriseJobs = (params = {}) => {
  return get('/recruitment/enterprise/jobs', params)
}

/**
 * 发布新的招聘职位
 * @param {Object} data 职位数据
 * @param {string} data.title 职位标题
 * @param {string} data.description 职位描述
 * @param {string} data.requirements 职位要求
 * @param {string} data.salary 薪资范围
 * @param {string} data.location 工作地点
 * @param {string} data.type 工作类型
 * @param {string} data.experience 经验要求
 * @param {string} data.education 学历要求
 * @param {Array} data.skills 技能要求
 * @param {string} data.department 所属部门
 * @param {number} data.count 招聘人数
 * @param {Date} data.deadline 截止日期
 * @returns {Promise} 发布结果
 */
export const publishJob = (data) => {
  return post('/recruitment/jobs', data)
}

/**
 * 记录职位浏览行为
 * @param {string} jobId 职位ID
 * @param {Object} data 浏览数据
 * @param {string} [data.source] 来源
 * @param {string} [data.referrer] 引荐来源
 * @returns {Promise} 记录结果
 */
export const recordJobView = (jobId, data = {}) => {
  return post(`/recruitment/jobs/${jobId}/view`, data)
}

/**
 * 向指定职位投递简历
 * @param {string} jobId 职位ID
 * @param {Object} data 投递数据
 * @param {string} data.resumeId 简历ID
 * @param {string} [data.coverLetter] 求职信
 * @param {string} [data.expectedSalary] 期望薪资
 * @returns {Promise} 投递结果
 */
export const applyForJob = (jobId, data) => {
  return post(`/recruitment/jobs/${jobId}/apply`, data)
}

/**
 * 获取企业详情页数据，包括企业信息、在招职位和统计数据
 * @param {string} enterpriseId 企业ID
 * @returns {Promise} 企业详情数据
 */
export const getEnterpriseDetail = (enterpriseId) => {
  return get(`/recruitment/enterprises/${enterpriseId}/detail`)
}

/**
 * 获取企业工作台数据，包括企业信息、职位统计、最新职位和投递记录
 * @returns {Promise} 工作台数据
 */
export const getEnterpriseWorkbench = () => {
  return get('/recruitment/enterprise/workbench')
}

/**
 * 获取企业列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.pageSize=10] 每页数量
 * @param {string} [params.industry] 行业类型
 * @param {string} [params.scale] 企业规模
 * @param {string} [params.location] 地区
 * @param {string} [params.keyword] 搜索关键词
 * @returns {Promise} 企业列表
 */
export const getEnterpriseList = (params = {}) => {
  return get('/recruitment/enterprises', params)
}

/**
 * 获取职位详情页数据，包括职位信息、企业信息和相关职位推荐
 * @param {string} jobId 职位ID
 * @returns {Promise} 职位详情数据
 */
export const getJobDetail = (jobId) => {
  return get(`/recruitment/jobs/${jobId}/detail`)
}

/**
 * 根据条件搜索职位
 * @param {Object} params 搜索参数
 * @param {string} [params.keyword] 关键词
 * @param {string} [params.location] 地区
 * @param {string} [params.industry] 行业
 * @param {string} [params.salary] 薪资范围
 * @param {string} [params.experience] 经验要求
 * @param {string} [params.education] 学历要求
 * @param {string} [params.type] 工作类型
 * @param {number} [params.page=1] 页码
 * @param {number} [params.pageSize=10] 每页数量
 * @returns {Promise} 搜索结果
 */
export const searchJobs = (params = {}) => {
  return get('/recruitment/jobs/search', params)
}

/**
 * 获取热门职位列表
 * @param {Object} params 查询参数
 * @param {number} [params.limit=10] 限制数量
 * @param {string} [params.location] 地区
 * @param {string} [params.industry] 行业
 * @returns {Promise} 热门职位列表
 */
export const getHotJobs = (params = {}) => {
  return get('/recruitment/jobs/hot', params)
}

/**
 * 获取简历投递申请的详细信息
 * @param {string} applicationId 申请ID
 * @returns {Promise} 申请详情
 */
export const getApplicationDetail = (applicationId) => {
  return get(`/recruitment/applications/${applicationId}`)
}

/**
 * 获取当前用户的简历投递记录
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.pageSize=10] 每页数量
 * @param {string} [params.status] 状态筛选
 * @returns {Promise} 投递记录列表
 */
export const getUserApplications = (params = {}) => {
  return get('/recruitment/applications/user', params)
}

/**
 * 获取企业收到的简历投递记录
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.pageSize=10] 每页数量
 * @param {string} [params.status] 状态筛选
 * @param {string} [params.jobId] 职位ID筛选
 * @returns {Promise} 投递记录列表
 */
export const getEnterpriseApplications = (params = {}) => {
  return get('/recruitment/applications/enterprise', params)
}

// 导出所有企业招聘相关API
export default {
  updateJobInfo,
  deleteJob,
  getCurrentEnterpriseInfo,
  updateEnterpriseBasicInfo,
  updateApplicationStatus,
  uploadResume,
  getEnterpriseJobs,
  publishJob,
  recordJobView,
  applyForJob,
  getEnterpriseDetail,
  getEnterpriseWorkbench,
  getEnterpriseList,
  getJobDetail,
  searchJobs,
  getHotJobs,
  getApplicationDetail,
  getUserApplications,
  getEnterpriseApplications
}