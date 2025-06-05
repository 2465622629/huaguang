/**
 * 用户认证相关API
 * 包含登录、注册、验证码等功能
 */

import { get, post } from '../request.js'

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @param {string} data.loginAccount 登录账号（用户名/手机号/邮箱）
 * @param {string} data.password 密码
 * @param {boolean} [data.rememberMe] 是否记住密码
 * @returns {Promise} 登录结果
 */
export const login = (data) => {
  return post('/auth/login', data)
}

/**
 * 用户注册
 * @param {Object} data 注册数据
 * @param {string} data.realName 真实姓名
 * @param {string} [data.nickname] 昵称
 * @param {string} data.email 邮箱
 * @param {string} [data.birthDate] 出生日期
 * @param {string} data.phone 手机号
 * @param {string} data.password 密码
 * @param {string} [data.inviteCode] 邀请码
 * @param {string} data.userType 用户类型
 * @returns {Promise} 注册结果
 */
export const register = (data) => {
  return post('/auth/register', data)
}

/**
 * 用户登出
 * @returns {Promise} 登出结果
 */
export const logout = () => {
  return post('/auth/logout')
}

/**
 * 发送短信验证码
 * @param {Object} data 验证码数据
 * @param {string} data.phone 手机号
 * @param {string} [data.type] 验证码类型：register-注册，login-登录，bind-绑定，reset_password-重置密码
 * @returns {Promise} 发送结果
 */
export const sendSmsCode = (data) => {
  return post('/auth/send-sms', data)
}

/**
 * 验证短信验证码
 * @param {Object} data 验证数据
 * @param {string} data.phone 手机号
 * @param {string} data.code 验证码
 * @returns {Promise} 验证结果
 */
export const verifySmsCode = (data) => {
  return post('/auth/verify-sms', data)
}

/**
 * 律师注册
 * @param {Object} data 律师注册数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {string} data.phone 手机号
 * @param {string} data.smsCode 短信验证码
 * @param {string} data.realName 真实姓名
 * @param {string} data.licenseNumber 执业证号
 * @param {string} data.lawFirm 律师事务所
 * @param {Array} data.specialties 专业领域
 * @param {Array} data.certificates 资质证书
 * @returns {Promise} 注册结果
 */
export const lawyerRegister = (data) => {
  return post('/lawyer/register', data)
}

/**
 * 心理师注册
 * @param {Object} data 心理师注册数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {string} data.phone 手机号
 * @param {string} data.smsCode 短信验证码
 * @param {string} data.realName 真实姓名
 * @param {string} data.licenseNumber 执业证号
 * @param {string} data.institution 执业机构
 * @param {Array} data.specialties 专业领域
 * @param {Array} data.certificates 资质证书
 * @returns {Promise} 注册结果
 */
export const psychologistRegister = (data) => {
  return post('/psychologist/register', data)
}

/**
 * 企业注册
 * @param {Object} data 企业注册数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {string} data.phone 手机号
 * @param {string} data.smsCode 短信验证码
 * @param {string} data.companyName 企业名称
 * @param {string} data.businessLicense 营业执照号
 * @param {string} data.legalPerson 法人代表
 * @param {string} data.contactPerson 联系人
 * @param {string} data.industry 行业类型
 * @returns {Promise} 注册结果
 */
export const enterpriseRegister = (data) => {
  return post('/enterprise/register', data)
}

// 导出所有认证相关API
export default {
  login,
  register,
  logout,
  sendSmsCode,
  verifySmsCode,
  lawyerRegister,
  psychologistRegister,
  enterpriseRegister
}