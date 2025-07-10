<template>
	<view class="change-password-page" :style="backgroundStyle">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{height: statusBarHeight + 'px'}"></view>
		
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<uv-icon name="arrow-left" size="18" color="#007AFF"></uv-icon>
				<text class="nav-back-text">返回</text>
			</view>
		</view>
		
		<!-- 主内容区域 -->
		<view class="main-content">
			<!-- 表单卡片 -->
			<view class="form-card">
				<!-- 手机号输入框 -->
				<view class="input-item">
					<uv-input
						v-model="formData.phone"
						type="number"
						placeholder="请输入手机号"
						placeholderStyle="color: #8A8A8E"
						border="none"
						shape="square"
						:customStyle="{
							backgroundColor: '#F2F2F7',
							borderRadius: '8px',
							height: '44px',
							flex: '1',
							padding: '0 12px'
						}"
					/>
				</view>
				
				<!-- 验证码输入框 -->
				<view class="input-item">
					<view class="verify-code-wrapper">
						<uv-input
							v-model="formData.verifyCode"
							type="text"
							placeholder="请输入短信验证码"
							placeholderStyle="color: #8A8A8E"
							border="none"
							shape="square"
							:customStyle="{
								backgroundColor: '#F2F2F7',
								borderRadius: '8px',
								height: '44px',
								flex: '1',
								padding: '0 12px'
							}"
						/>
						<view class="verify-code-btn" @click="getVerifyCode">
							<text class="verify-code-text">{{ countdownText }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-button">
				<uv-button
					text="点击换绑"
					type="primary"
					shape="circle"
					size="large"
					:customStyle="{
						backgroundColor: '#5291ff',
						borderRadius: '25px',
						height: '50px',
						width: '280px'
					}"
					@click="handleBinding"
				/>
			</view>
		</view>
	</view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import { bindPhone, sendSmsCode, verifySmsCode } from '@/api/modules/user.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			// 表单数据
			formData: {
				phone: '',
				verifyCode: ''
			},
			// 验证码倒计时
			countdown: 0,
			isGettingCode: false,
			
			// 企业级状态管理
			isLoading: false,
			isBinding: false,
			
			// 智能缓存和重试
			cacheKey: 'lawyer_phone_binding',
			retryConfig: {
				maxRetries: 3,
				baseDelay: 1000,
				maxDelay: 8000,
				backoffFactor: 2
			},
			
			// 错误处理
			errorState: {
				hasError: false,
				errorType: '',
				errorMessage: '',
				canRetry: false
			}
		}
	},
	computed: {
		// 倒计时文本
		countdownText() {
			if (this.countdown > 0) {
				return `${this.countdown}秒后重新获取`
			}
			return this.isGettingCode ? '获取中...' : '获取验证码'
		},
		
		// 是否可以获取验证码
		canGetCode() {
			return !this.isGettingCode && this.countdown <= 0 && this.validatePhone(this.formData.phone)
		},
		
		// 是否可以提交绑定
		canSubmit() {
			return !this.isBinding && 
				   this.validatePhone(this.formData.phone) && 
				   this.formData.verifyCode.length === 6
		},
		
		backgroundStyle() {
			return {
				        background: 'url(' + staticBaseUrl + '/bg10.png) no-repeat center center'
			}
		}
	},
	onLoad() {
		// 获取状态栏高度
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 0
		
		// 尝试从缓存恢复数据
		this.restoreFromCache()
	},
	onUnload() {
		// 清理定时器
		this.clearCountdownTimer()
		
		// 缓存当前输入
		this.saveToCache()
	},
	methods: {
		// 返回上一页
		goBack() {
			this.saveToCache()
			uni.navigateBack()
		},
		
		// 验证手机号格式
		validatePhone(phone) {
			if (!phone) return false
			const phoneReg = /^1[3-9]\d{9}$/
			return phoneReg.test(phone.trim())
		},
		
		// 获取验证码
		async getVerifyCode() {
			// 防止重复点击和基础验证
			if (!this.canGetCode) {
				if (!this.formData.phone) {
					this.showError('请输入手机号')
				} else if (!this.validatePhone(this.formData.phone)) {
					this.showError('请输入正确的手机号')
				} else if (this.countdown > 0) {
					this.showError(`请等待${this.countdown}秒后重试`)
				}
				return
			}
			
			try {
				this.isGettingCode = true
				this.clearError()
				
				console.log('律师绑定 - 获取验证码，手机号：', this.formData.phone)
				
				// 使用智能重试机制发送验证码
				const response = await this.callApiWithRetry(async () => {
					return await sendSmsCode({
						phone: this.formData.phone.trim(),
						type: 'bind',
						scene: 'lawyer_binding'
					})
				})
				
				if (response && (response.code === 200 || response.success)) {
					// 启动倒计时
					this.startCountdown()
					
					uni.showToast({
						title: '验证码已发送',
						icon: 'success'
					})
					
					console.log('律师绑定 - 验证码发送成功')
				} else {
					throw new Error(response?.message || '发送验证码失败')
				}
				
			} catch (error) {
				console.error('律师绑定 - 获取验证码失败:', error)
				this.handleApiError(error)
			} finally {
				this.isGettingCode = false
			}
		},
		
		// 开始倒计时
		startCountdown() {
			this.countdown = 60
			this.countdownTimer = setInterval(() => {
				this.countdown--
				if (this.countdown <= 0) {
					this.clearCountdownTimer()
				}
			}, 1000)
		},
		
		// 清理倒计时定时器
		clearCountdownTimer() {
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer)
				this.countdownTimer = null
			}
		},
		
		// 处理绑定
		async handleBinding() {
			// 基础表单验证
			if (!this.canSubmit) {
				if (!this.formData.phone) {
					this.showError('请输入手机号')
				} else if (!this.validatePhone(this.formData.phone)) {
					this.showError('请输入正确的手机号')
				} else if (!this.formData.verifyCode) {
					this.showError('请输入验证码')
				} else if (this.formData.verifyCode.length !== 6) {
					this.showError('请输入6位验证码')
				}
				return
			}
			
			try {
				this.isBinding = true
				this.clearError()
				
				console.log('律师绑定 - 开始绑定手机号:', {
					phone: this.formData.phone,
					codeLength: this.formData.verifyCode.length
				})
				
				// 先验证短信验证码（可选步骤，提前验证）
				try {
					await this.callApiWithRetry(async () => {
						return await verifySmsCode({
							phone: this.formData.phone.trim(),
							code: this.formData.verifyCode.trim(),
							type: 'bind'
						})
					})
					console.log('律师绑定 - 验证码验证成功')
				} catch (verifyError) {
					console.warn('律师绑定 - 验证码预验证失败，继续尝试绑定:', verifyError)
				}
				
				// 执行绑定操作
				const response = await this.callApiWithRetry(async () => {
					return await bindPhone({
						phone: this.formData.phone.trim(),
						smsCode: this.formData.verifyCode.trim(),
						action: 'bind',
						userType: 'lawyer'
					})
				})
				
				if (response && (response.code === 200 || response.success)) {
					uni.showToast({
						title: '绑定成功',
						icon: 'success',
						duration: 2000
					})
					
					console.log('律师绑定 - 手机号绑定成功:', response)
					
					// 清除缓存
					this.clearCache()
					
					// 延迟返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				} else {
					throw new Error(response?.message || '绑定失败')
				}
				
			} catch (error) {
				console.error('律师绑定 - 绑定手机号失败:', error)
				this.handleApiError(error)
			} finally {
				this.isBinding = false
			}
		},
		
		// 智能指数退避重试机制
		async callApiWithRetry(apiCall, retryCount = 0) {
			try {
				return await apiCall()
			} catch (error) {
				if (retryCount < this.retryConfig.maxRetries) {
					// 计算延迟时间：指数退避 + 随机抖动
					const exponentialDelay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount)
					const randomJitter = Math.random() * 1000 // 0-1秒随机抖动
					const delay = Math.min(exponentialDelay + randomJitter, this.retryConfig.maxDelay)
					
					console.log(`律师绑定 - API调用失败，${Math.round(delay)}ms后进行第${retryCount + 1}次重试`)
					await new Promise(resolve => setTimeout(resolve, delay))
					return this.callApiWithRetry(apiCall, retryCount + 1)
				}
				throw error
			}
		},
		
		// 企业级错误处理
		handleApiError(error) {
			let errorType = 'unknown'
			let errorMessage = '操作失败，请稍后重试'
			let canRetry = true

			if (error.code || error.status) {
				const code = error.code || error.status
				switch (code) {
					case 'NETWORK_ERROR':
					case 'TIMEOUT':
					case 'ERR_NETWORK':
						errorType = 'network'
						errorMessage = '网络连接异常，请检查网络设置'
						break
					case 401:
					case 'AUTH_ERROR':
					case 'UNAUTHORIZED':
						errorType = 'auth'
						errorMessage = '登录已过期，请重新登录'
						canRetry = false
						break
					case 403:
					case 'FORBIDDEN':
						errorType = 'permission'
						errorMessage = '权限不足'
						canRetry = false
						break
					case 429:
					case 'TOO_MANY_REQUESTS':
						errorType = 'rate_limit'
						errorMessage = '操作过于频繁，请稍后再试'
						break
					case 'PHONE_ALREADY_BOUND':
						errorType = 'business'
						errorMessage = '该手机号已被其他账号绑定'
						canRetry = false
						break
					case 'INVALID_SMS_CODE':
					case 'SMS_CODE_EXPIRED':
						errorType = 'business'
						errorMessage = '验证码错误或已过期，请重新获取'
						canRetry = false
						break
					case 'SMS_SEND_FAILED':
						errorType = 'business'
						errorMessage = '验证码发送失败，请稍后重试'
						break
					case 500:
					case 502:
					case 503:
					case 'SERVER_ERROR':
						errorType = 'server'
						errorMessage = '服务器繁忙，请稍后重试'
						break
					default:
						errorMessage = error.message || error.msg || errorMessage
				}
			} else if (error.message) {
				errorMessage = error.message
			}

			this.errorState = {
				hasError: true,
				errorType,
				errorMessage,
				canRetry
			}

			this.showError(errorMessage)
			return { errorType, errorMessage, canRetry }
		},
		
		// 显示错误信息
		showError(message) {
			uni.showToast({
				title: message,
				icon: 'none',
				duration: 3000
			})
		},
		
		// 清除错误状态
		clearError() {
			this.errorState = {
				hasError: false,
				errorType: '',
				errorMessage: '',
				canRetry: false
			}
		},
		
		// 智能缓存系统
		saveToCache() {
			try {
				const cacheData = {
					formData: this.formData,
					timestamp: Date.now()
				}
				uni.setStorageSync(this.cacheKey, JSON.stringify(cacheData))
			} catch (error) {
				console.warn('律师绑定 - 保存缓存失败:', error)
			}
		},
		
		restoreFromCache() {
			try {
				const cacheStr = uni.getStorageSync(this.cacheKey)
				if (cacheStr) {
					const cacheData = JSON.parse(cacheStr)
					const isExpired = Date.now() - cacheData.timestamp > 10 * 60 * 1000 // 10分钟过期
					
					if (!isExpired && cacheData.formData) {
						this.formData = { ...this.formData, ...cacheData.formData }
						console.log('律师绑定 - 恢复缓存数据:', this.formData)
					} else {
						this.clearCache()
					}
				}
			} catch (error) {
				console.warn('律师绑定 - 恢复缓存失败:', error)
				this.clearCache()
			}
		},
		
		clearCache() {
			try {
				uni.removeStorageSync(this.cacheKey)
			} catch (error) {
				console.warn('律师绑定 - 清除缓存失败:', error)
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.change-password-page {
	min-height: 100vh;

    background-size: 100% 100%;
}

.status-bar {
	width: 100%;
}

.nav-bar {
	height: 44px;
	display: flex;
	align-items: center;
	padding: 0 15px;
	
	.nav-back {
		display: flex;
		align-items: center;
		
		.nav-back-text {
			margin-left: 5px;
			font-size: 17px;
			color: #007AFF;
		}
	}
}

.main-content {
	padding: 20px 15px;
	
	.form-card {
		background-color: #FFFFFF;
		border-radius: 16px;
		padding: 20px;
		margin-bottom: 40px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
		
		.input-item {
			margin-bottom: 15px;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.verify-code-wrapper {
				display: flex;
				align-items: center;
				gap: 10px;
				
				.verify-code-btn {
					background-color: #5291ff;
					border-radius: 8px;
					padding: 12px 16px;
					min-width: 110px;
					
					.verify-code-text {
						color: #FFFFFF;
						font-size: 14px;
						text-align: center;
						display: block;
					}
				}
			}
		}
	}
	
	.action-button {
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
</style> 