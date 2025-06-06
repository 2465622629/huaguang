/**
 * API统一管理入口
 * 集中管理所有API接口
 */

// 导入配置和请求工具
import config from './config.js'
import request from './request.js'

// 导入拦截器
import requestInterceptors from './interceptors/request.js'
import responseInterceptors from './interceptors/response.js'

// 导入各业务模块API
import authApi from './modules/auth.js'
import userApi from './modules/user.js'
import lawyerApi from './modules/lawyer.js'
import psychologistApi from './modules/psychologist.js'
import chatApi from './modules/chat.js'
import enterpriseApi from './modules/enterprise.js'
import commonApi from './modules/common.js'
import homeApi from './modules/home.js'
import recruitmentApi from './modules/recruitment.js'
import searchApi from './modules/search.js'
import navigationApi from './modules/navigation.js'
import personalCenterApi from './modules/personal-center.js'
import youthAssistanceApi from './modules/youth-assistance.js'
import statisticsApi from './modules/statistics.js'
import skillTrainingApi from './modules/skill-training.js'
import applicationRecordApi from './modules/application-record.js'
import legalServiceApi from './modules/legal-service.js'
import aboutApi from './modules/about.js'
import adminUserApi from './modules/admin-user.js'
import adminOrderApi from './modules/admin-order.js'
import adminContentApi from './modules/admin-content.js'
import lawyerWorkspaceApi from './modules/lawyer-workspace.js'
import fileManagementApi from './modules/file-management.js'

// 统一导出所有API
export {
  config,
  request,
  requestInterceptors,
  responseInterceptors,
  authApi,
  userApi,
  lawyerApi,
  psychologistApi,
  chatApi,
  enterpriseApi,
  commonApi,
  homeApi,
  recruitmentApi,
  searchApi,
  navigationApi,
  personalCenterApi,
  youthAssistanceApi,
  statisticsApi,
  skillTrainingApi,
  applicationRecordApi,
  legalServiceApi,
  aboutApi,
  adminUserApi,
  adminOrderApi,
  adminContentApi,
  lawyerWorkspaceApi,
  fileManagementApi
}

// 默认导出
export default {
  config,
  request,
  interceptors: {
    request: requestInterceptors,
    response: responseInterceptors
  },
  auth: authApi,
  user: userApi,
  lawyer: lawyerApi,
  psychologist: psychologistApi,
  chat: chatApi,
  enterprise: enterpriseApi,
  common: commonApi,
  home: homeApi,
  recruitment: recruitmentApi,
  search: searchApi,
  navigation: navigationApi,
  personalCenter: personalCenterApi,
  youthAssistance: youthAssistanceApi,
  statistics: statisticsApi,
  skillTraining: skillTrainingApi,
  applicationRecord: applicationRecordApi,
  legalService: legalServiceApi,
  about: aboutApi,
  adminUser: adminUserApi,
  adminOrder: adminOrderApi,
  adminContent: adminContentApi,
  lawyerWorkspace: lawyerWorkspaceApi,
  fileManagement: fileManagementApi
}