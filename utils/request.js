/**
 * 网络请求工具
 * 基于 luch-request 封装
 * 
 * 注意：推荐使用新的API管理系统 @/api
 * 该文件保留用于兼容性，新功能请使用 @/api/request.js
 */
import { API_CONFIG } from '@/config/index'

// 请求拦截器
const requestInterceptor = (config) => {
	// 获取token
	const token = uni.getStorageSync('token')
	if (token) {
		config.header = {
			...config.header,
			'Authorization': `Bearer ${token}`
		}
	}
	return config
}

// 响应拦截器
const responseInterceptor = (response) => {
	const { statusCode, data } = response
	console.log('响应拦截器：', response)
	// 请求成功
	if (statusCode === 200) {
		return data.data
	}
	// 请求失败
	else {
		uni.showToast({
			title: '网络错误，请稍后重试',
			icon: 'none'
		})
		return Promise.reject(response)
	}
}

// 统一的请求方法
const request = (options) => {
	// 处理请求配置
	const config = requestInterceptor({
		url: `${API_CONFIG.BASE_URL}${options.url}`,
		method: options.method || 'GET',
		data: options.data,
		header: {
			...API_CONFIG.HEADERS,
			...options.header
		},
		timeout: API_CONFIG.TIMEOUT
	})
	
	// 返回Promise
	return new Promise((resolve, reject) => {
		uni.request({
			...config,
			success: (res) => {
				try {
					const data = responseInterceptor(res)
					resolve(data)
				} catch (error) {
					reject(error)
				}
			},
			fail: (error) => {
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none'
				})
				reject(error)
			}
		})
	})
}

// 导出请求方法
export default request

// 导出常用的请求方法
export const get = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'GET',
		data,
		...options
	})
}

export const post = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'POST',
		data,
		...options
	})
}

export const put = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'PUT',
		data,
		...options
	})
}

export const del = (url, data = {}, options = {}) => {
	return request({
		url,
		method: 'DELETE',
		data,
		...options
	})
}