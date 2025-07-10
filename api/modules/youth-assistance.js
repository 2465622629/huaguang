/**
 * @file 青年帮扶基金模块 API
 * @description 包含青年帮扶基金相关的所有接口，如信用修复、帮扶申请、帮扶记录等。
 */

import request from '../request';

const youthAssistanceApi = {
  /**
   * @description 获取用户信用修复申请列表
   * @param {object} params - 查询参数
   * @param {string} [params.status] - 状态
   * @param {string} [params.bankPlatform] - 银行平台
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<object>} - 信用修复申请列表
   */
  getCreditRepairApplications(params) {
    return request.get('/youth-assistance/credit/repair', { params });
  },

  /**
   * @description 提交信用修复申请
   * @param {object} data - 申请数据
   * @param {string} data.bankPlatform - 银行平台
   * @param {string} data.loanDate - 贷款日期
   * @param {number} data.loanAmount - 贷款金额
   * @param {string} data.overdueDate - 逾期日期
   * @param {number} data.remainingAmount - 剩余金额
   * @param {number} data.repaymentAmount - 还款金额
   * @param {string[]} data.proofDocuments - 证明文档
   * @returns {Promise<object>} - 申请结果
   */
  submitCreditRepairApplication(data) {
    return request.post('/youth-assistance/credit/repair', data);
  },

  /**
   * @description 获取用户帮扶申请列表
   * @param {object} params - 查询参数
   * @param {string} [params.applicationType] - 申请类型
   * @param {string} [params.status] - 状态
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<object>} - 帮扶申请列表
   */
  getAssistanceApplications(params) {
    return request.get('/youth-assistance/applications', { params });
  },

  /**
   * @description 提交通用帮扶申请
   * @param {object} data - 申请数据
   * @param {string} data.applicationType - 申请类型 (unemployment/debt_relief/psychological_support/legal_aid)
   * @param {object} data.basicInfo - 基本信息
   * @param {object} data.financialInfo - 财务信息
   * @param {object} data.supportingDocuments - 支持文档
   * @returns {Promise<object>} - 申请结果
   */
  submitAssistanceApplication(data) {
    return request.post('/youth-assistance/applications', data);
  },

  /**
   * @description 提交失业援助申请
   * @param {object} data - 申请数据
   * @returns {Promise<object>} - 申请结果
   */
  submitUnemploymentAssistance(data) {
    return request.post('/youth-assistance/applications/unemployment', data);
  },

  /**
   * @description 提交心理支持申请
   * @param {object} data - 申请数据
   * @returns {Promise<object>} - 申请结果
   */
  submitPsychologicalSupport(data) {
    return request.post('/youth-assistance/applications/psychological-support', data);
  },

  /**
   * @description 提交法律护航申请
   * @param {object} data - 申请数据
   * @returns {Promise<object>} - 申请结果
   */
  submitLegalAid(data) {
    return request.post('/youth-assistance/applications/legal-aid', data);
  },

  /**
   * @description 提交债务纾困申请
   * @param {object} data - 申请数据
   * @returns {Promise<object>} - 申请结果
   */
  submitDebtRelief(data) {
    return request.post('/youth-assistance/applications/debt-relief', data);
  },

  /**
   * @description 获取用户帮扶记录列表
   * @param {object} params - 查询参数
   * @param {string} [params.serviceType] - 服务类型
   * @param {string} [params.status] - 状态
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<object>} - 帮扶记录列表
   */
  getAssistanceRecords(params) {
    return request.get('/youth-assistance/records', { params });
  },

  /**
   * @description 获取青年帮扶基金主页
   * @returns {Promise<object>} - 主页数据，包括统计信息、服务模块和最近案例
   */
  getHomePage() {
    return request.get('/youth-assistance/home');
  },

  /**
   * @description 获取指定信用修复申请的详细信息
   * @param {number|string} applicationId - 申请ID
   * @returns {Promise<object>} - 申请详细信息
   */
  getCreditRepairApplicationDetail(applicationId) {
    return request.get(`/youth-assistance/credit/repair/${applicationId}`);
  },

  /**
   * @description 获取当前用户的信用记录信息
   * @returns {Promise<object>} - 信用记录信息
   */
  getCreditRecord() {
    return request.get('/youth-assistance/credit/record');
  },

  /**
   * @description 获取指定帮扶申请的详细信息
   * @param {number|string} applicationId - 申请ID
   * @returns {Promise<object>} - 申请详细信息
   */
  getAssistanceApplicationDetail(applicationId) {
    return request.get(`/youth-assistance/applications/${applicationId}`);
  },

  /**
   * @description 获取心理测试列表
   * @param {object} params - 查询参数
   * @param {string} [params.category] - 测试分类
   * @param {string} [params.difficulty] - 难度级别
   * @returns {Promise<object>} - 心理测试列表
   */
  getPsychologicalTests(params = {}) {
    return request.get('/youth-assistance/psychological-tests', { params });
  },

  /**
   * @description 获取心理测试详情
   * @param {number|string} testId - 测试ID
   * @returns {Promise<object>} - 测试详情，包含问题列表
   */
  getPsychologicalTestDetail(testId) {
    return request.get(`/youth-assistance/psychological-tests/${testId}`);
  },

  /**
   * @description 提交心理测试结果
   * @param {object} data - 测试结果数据
   * @param {number|string} data.testId - 测试ID
   * @param {array} data.answers - 答案数组
   * @param {number} data.duration - 测试用时（秒）
   * @param {object} [data.metadata] - 额外元数据
   * @returns {Promise<object>} - 测试结果分析
   */
  submitPsychologicalTestResult(data) {
    return request.post('/youth-assistance/psychological-tests/submit', data);
  },

  /**
   * @description 获取用户心理测试历史记录
   * @param {object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<object>} - 测试历史记录
   */
  getPsychologicalTestHistory(params = {}) {
    return request.get('/youth-assistance/psychological-tests/history', { params });
  },
};

export default youthAssistanceApi;