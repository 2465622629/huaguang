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
 * 获取企业员工列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.department] 部门
 * @param {string} [params.role] 角色
 * @param {string} [params.keyword] 搜索关键词
 * @returns {Promise} 员工列表
 */
export const getEnterpriseEmployees = (params) => {
  return get('/enterprise/employees', params)
}

/**
 * 添加企业员工
 * @param {Object} data 员工数据
 * @param {string} data.name 姓名
 * @param {string} data.phone 手机号
 * @param {string} data.email 邮箱
 * @param {string} data.department 部门
 * @param {string} data.position 职位
 * @param {string} data.role 角色
 * @param {Array} [data.permissions] 权限列表
 * @returns {Promise} 添加结果
 */
export const addEnterpriseEmployee = (data) => {
  return post('/enterprise/employees', data)
}

/**
 * 更新企业员工信息
 * @param {string} employeeId 员工ID
 * @param {Object} data 员工数据
 * @param {string} [data.name] 姓名
 * @param {string} [data.phone] 手机号
 * @param {string} [data.email] 邮箱
 * @param {string} [data.department] 部门
 * @param {string} [data.position] 职位
 * @param {string} [data.role] 角色
 * @param {Array} [data.permissions] 权限列表
 * @param {boolean} [data.active] 是否激活
 * @returns {Promise} 更新结果
 */
export const updateEnterpriseEmployee = (employeeId, data) => {
  return put(`/enterprise/employees/${employeeId}`, data)
}

/**
 * 删除企业员工
 * @param {string} employeeId 员工ID
 * @returns {Promise} 删除结果
 */
export const deleteEnterpriseEmployee = (employeeId) => {
  return del(`/enterprise/employees/${employeeId}`)
}

/**
 * 获取企业服务列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.serviceType] 服务类型
 * @param {string} [params.status] 状态
 * @returns {Promise} 服务列表
 */
export const getEnterpriseServices = (params) => {
  return get('/enterprise/services', params)
}

/**
 * 申请企业服务
 * @param {Object} data 服务申请数据
 * @param {string} data.serviceType 服务类型
 * @param {string} data.title 服务标题
 * @param {string} data.description 服务描述
 * @param {string} data.urgency 紧急程度
 * @param {Array} [data.attachments] 附件列表
 * @param {string} [data.preferredProvider] 首选服务商
 * @returns {Promise} 申请结果
 */
export const applyEnterpriseService = (data) => {
  return post('/enterprise/services', data)
}

/**
 * 获取企业服务详情
 * @param {string} serviceId 服务ID
 * @returns {Promise} 服务详情
 */
export const getEnterpriseServiceDetail = (serviceId) => {
  return get(`/enterprise/services/${serviceId}`)
}

/**
 * 更新企业服务状态
 * @param {string} serviceId 服务ID
 * @param {Object} data 状态数据
 * @param {string} data.status 状态
 * @param {string} [data.comment] 备注
 * @returns {Promise} 更新结果
 */
export const updateEnterpriseServiceStatus = (serviceId, data) => {
  return put(`/enterprise/services/${serviceId}/status`, data)
}

/**
 * 获取企业咨询记录
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.consultationType] 咨询类型
 * @param {string} [params.status] 状态
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @returns {Promise} 咨询记录
 */
export const getEnterpriseConsultations = (params) => {
  return get('/enterprise/consultations', params)
}

/**
 * 获取企业统计数据
 * @param {Object} params 查询参数
 * @param {string} [params.period] 统计周期（day/week/month/year）
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @returns {Promise} 统计数据
 */
export const getEnterpriseStatistics = (params) => {
  return get('/enterprise/statistics', params)
}

/**
 * 获取企业账单列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.status] 账单状态
 * @param {string} [params.startDate] 开始日期
 * @param {string} [params.endDate] 结束日期
 * @returns {Promise} 账单列表
 */
export const getEnterpriseBills = (params) => {
  return get('/enterprise/bills', params)
}

/**
 * 获取企业账单详情
 * @param {string} billId 账单ID
 * @returns {Promise} 账单详情
 */
export const getEnterpriseBillDetail = (billId) => {
  return get(`/enterprise/bills/${billId}`)
}

/**
 * 支付企业账单
 * @param {string} billId 账单ID
 * @param {Object} data 支付数据
 * @param {string} data.paymentMethod 支付方式
 * @param {string} [data.remark] 备注
 * @returns {Promise} 支付结果
 */
export const payEnterpriseBill = (billId, data) => {
  return post(`/enterprise/bills/${billId}/pay`, data)
}

/**
 * 获取企业合同列表
 * @param {Object} params 查询参数
 * @param {number} [params.page] 页码
 * @param {number} [params.pageSize] 每页数量
 * @param {string} [params.status] 合同状态
 * @param {string} [params.contractType] 合同类型
 * @returns {Promise} 合同列表
 */
export const getEnterpriseContracts = (params) => {
  return get('/enterprise/contracts', params)
}

/**
 * 获取企业合同详情
 * @param {string} contractId 合同ID
 * @returns {Promise} 合同详情
 */
export const getEnterpriseContractDetail = (contractId) => {
  return get(`/enterprise/contracts/${contractId}`)
}

/**
 * 签署企业合同
 * @param {string} contractId 合同ID
 * @param {Object} data 签署数据
 * @param {string} data.signatureImage 签名图片
 * @param {string} [data.comment] 签署意见
 * @returns {Promise} 签署结果
 */
export const signEnterpriseContract = (contractId, data) => {
  return post(`/enterprise/contracts/${contractId}/sign`, data)
}

// 导出所有企业相关API
export default {
  getEnterpriseInfo,
  updateEnterpriseInfo,
  getEnterpriseEmployees,
  addEnterpriseEmployee,
  updateEnterpriseEmployee,
  deleteEnterpriseEmployee,
  getEnterpriseServices,
  applyEnterpriseService,
  getEnterpriseServiceDetail,
  updateEnterpriseServiceStatus,
  getEnterpriseConsultations,
  getEnterpriseStatistics,
  getEnterpriseBills,
  getEnterpriseBillDetail,
  payEnterpriseBill,
  getEnterpriseContracts,
  getEnterpriseContractDetail,
  signEnterpriseContract
}