/**
 * @file 统计与数据模块 API
 * @description 包含统计与数据相关的所有接口，如统计趋势、平台数据、数据导出、实时统计等。
 */

import request from '../request';

const statisticsApi = {
  /**
   * @description 获取统计趋势数据
   * @param {object} data - 查询参数
   * @param {string} data.startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} data.endDate - 结束日期 (YYYY-MM-DD)
   * @param {string} data.statisticsType - 统计类型 (daily|weekly|monthly|yearly)
   * @param {number} [data.page=1] - 页码
   * @param {number} [data.size=10] - 每页大小
   * @returns {Promise<object>} - 统计趋势数据列表
   */
  getStatisticsTrend(data) {
    return request.post('/user/statistics/trend', data);
  },

  /**
   * @description 分页查询平台统计数据
   * @param {object} data - 查询参数
   * @param {string} [data.startDate] - 开始日期 (YYYY-MM-DD)
   * @param {string} [data.endDate] - 结束日期 (YYYY-MM-DD)
   * @param {string} [data.statisticsType] - 统计类型 (daily|weekly|monthly|yearly)
   * @param {number} [data.page=1] - 页码
   * @param {number} [data.size=10] - 每页大小
   * @returns {Promise<object>} - 平台统计数据分页结果
   */
  getPlatformStatisticsPage(data) {
    return request.post('/user/statistics/platform/page', data);
  },

  /**
   * @description 导出统计数据
   * @param {object} data - 导出参数
   * @param {string} data.exportType - 导出类型 (excel|csv|pdf)
   * @param {object} data.queryParams - 查询参数
   * @param {string} data.queryParams.startDate - 开始日期
   * @param {string} data.queryParams.endDate - 结束日期
   * @param {string} data.queryParams.statisticsType - 统计类型
   * @param {number} [data.queryParams.page] - 页码
   * @param {number} [data.queryParams.size] - 每页大小
   * @param {string[]} [data.includeFields] - 包含字段
   * @param {string} [data.fileName] - 文件名
   * @returns {Promise<object>} - 导出结果（文件下载链接）
   */
  exportStatisticsData(data) {
    return request.post('/user/statistics/export', data);
  },

  /**
   * @description 更新平台统计数据（管理员功能）
   * @param {string} [statisticsDate] - 统计日期 (YYYY-MM-DD)
   * @returns {Promise<object>} - 更新结果
   */
  updatePlatformStatistics(statisticsDate) {
    const params = statisticsDate ? { statisticsDate } : {};
    return request.post('/user/statistics/admin/update', null, { params });
  },

  /**
   * @description 获取青年帮扶基金统计页面
   * @returns {Promise<object>} - 青年帮扶基金统计页面完整数据
   */
  getYouthAssistanceStatistics() {
    return request.get('/user/statistics/youth-assistance');
  },

  /**
   * @description 获取服务模块统计
   * @returns {Promise<object>} - 各服务模块的统计卡片数据
   */
  getServiceModuleCards() {
    return request.get('/user/statistics/service-modules');
  },

  /**
   * @description 获取实时统计数据
   * @returns {Promise<object>} - 平台实时统计数据
   */
  getRealTimeStatistics() {
    return request.get('/user/statistics/real-time');
  },

  /**
   * @description 获取平台统计概览
   * @returns {Promise<object>} - 平台整体统计数据概览
   */
  getPlatformStatisticsOverview() {
    return request.get('/user/statistics/platform-overview');
  },

  /**
   * @description 获取心理咨询统计数据
   * @returns {Promise<object>} - 心理咨询相关的统计数据
   */
  getPsychologicalConsultationStats() {
    return request.get('/user/statistics/page/youth-assistance/psychological');
  },

  /**
   * @description 获取青年帮扶基金统计页面数据
   * @returns {Promise<object>} - 青年帮扶基金统计页面的数据接口
   */
  getYouthAssistancePageData() {
    return request.get('/user/statistics/page/youth-assistance/data');
  }
};

export default statisticsApi;