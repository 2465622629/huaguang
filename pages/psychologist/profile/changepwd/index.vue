<template>
	<view class="change-password-page" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg11.png)' }">
		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{height: statusBarHeight + 'px'}"></view>
		
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<uv-icon name="arrow-left" size="18" color="#FF4646"></uv-icon>
				<text class="nav-back-text">返回</text>
			</view>
		</view>
		
		<!-- 主内容区域 -->
		<view class="main-content">
			<!-- 表单卡片 -->
			<view class="form-card">
				<!-- 当前密码输入框 -->
				<view class="input-item">
					<uv-input
						v-model="formData.currentPassword"
						type="password"
						:password="!showCurrentPassword"
						placeholder="当前密码"
						placeholderStyle="color: #8A8A8E"
						:suffixIcon="showCurrentPassword ? 'eye' : 'eye-off'"
						suffixIconStyle="color: #8A8A8E; fontSize: 20px"
						border="none"
						shape="square"
						:disabled="isLoading"
						:customStyle="{
							backgroundColor: '#F2F2F7',
							borderRadius: '8px',
							height: '44px'
						}"
						@click-suffix-icon="toggleCurrentPassword"
					/>
				</view>
				
				<!-- 新密码输入框 -->
				<view class="input-item">
					<uv-input
						v-model="formData.newPassword"
						type="password"
						:password="!showNewPassword"
						placeholder="新密码（6-20位）"
						placeholderStyle="color: #8A8A8E"
						:suffixIcon="showNewPassword ? 'eye' : 'eye-off'"
						suffixIconStyle="color: #8A8A8E; fontSize: 20px"
						border="none"
						shape="square"
						:disabled="isLoading"
						:customStyle="{
							backgroundColor: '#F2F2F7',
							borderRadius: '8px',
							height: '44px'
						}"
						@click-suffix-icon="toggleNewPassword"
						@input="validatePasswordStrength"
					/>
				</view>
				
				<!-- 密码强度提示 -->
				<view v-if="formData.newPassword && passwordStrength" class="password-strength">
					<text class="strength-label">密码强度：</text>
					<text :class="['strength-text', passwordStrength.level]">{{ passwordStrength.text }}</text>
				</view>
				
				<!-- 确认新密码输入框 -->
				<view class="input-item">
					<uv-input
						v-model="formData.confirmPassword"
						type="password"
						:password="!showConfirmPassword"
						placeholder="确认新密码"
						placeholderStyle="color: #8A8A8E"
						:suffixIcon="showConfirmPassword ? 'eye' : 'eye-off'"
						suffixIconStyle="color: #8A8A8E; fontSize: 20px"
						border="none"
						shape="square"
						:disabled="isLoading"
						:customStyle="{
							backgroundColor: '#F2F2F7',
							borderRadius: '8px',
							height: '44px'
						}"
						@click-suffix-icon="toggleConfirmPassword"
					/>
				</view>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-button">
				<uv-button
					text="点击修改"
					type="primary"
					shape="circle"
					size="large"
					:loading="isLoading"
					:disabled="isLoading || !isFormValid"
					:customStyle="{
						backgroundColor: '#ff5252',
						borderRadius: '25px',
						height: '50px',
						width: '280px',
                        borderColor: '#ff5252'
					}"
					@click="handleChangePassword"
				/>
			</view>
		</view>
	</view>
</template>

<script>
import config from '@/config/index.js'
import { changePassword } from '@/api/modules/user.js'

export default {
	data() {
		return {
			config,
			statusBarHeight: 0,
			isLoading: false,
			
			// 表单数据
			formData: {
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			},
			
			// 密码显示状态
			showCurrentPassword: false,
			showNewPassword: false,
			showConfirmPassword: false,
			
			// 密码强度验证
			passwordStrength: null,
			
			// 重试机制配置
			retryConfig: {
				maxRetries: 3,
				baseDelay: 1000,
				maxDelay: 8000
			}
		}
	},
	
	computed: {
		// 表单验证状态
		isFormValid() {
			return this.formData.currentPassword.length > 0 &&
				   this.formData.newPassword.length >= 6 &&
				   this.formData.confirmPassword.length > 0 &&
				   this.formData.newPassword === this.formData.confirmPassword &&
				   this.formData.currentPassword !== this.formData.newPassword
		}
	},
	
	onLoad() {
		// 获取状态栏高度
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 0
	},
	
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack()
		},
		
		// 切换当前密码显示状态
		toggleCurrentPassword() {
			this.showCurrentPassword = !this.showCurrentPassword
		},
		
		// 切换新密码显示状态
		toggleNewPassword() {
			this.showNewPassword = !this.showNewPassword
		},
		
		// 切换确认密码显示状态
		toggleConfirmPassword() {
			this.showConfirmPassword = !this.showConfirmPassword
		},
		
		// 验证密码强度
		validatePasswordStrength() {
			const password = this.formData.newPassword
			
			if (!password) {
				this.passwordStrength = null
				return
			}
			
			let score = 0
			const checks = {
				length: password.length >= 8,
				lowercase: /[a-z]/.test(password),
				uppercase: /[A-Z]/.test(password),
				number: /\d/.test(password),
				special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
			}
			
			score = Object.values(checks).filter(Boolean).length
			
			if (score <= 2) {
				this.passwordStrength = { level: 'weak', text: '弱' }
			} else if (score <= 3) {
				this.passwordStrength = { level: 'medium', text: '中等' }
			} else {
				this.passwordStrength = { level: 'strong', text: '强' }
			}
		},
		
		// 智能指数退避重试机制
		async executeWithRetry(apiCall, retryCount = 0) {
			try {
				return await apiCall()
			} catch (error) {
				if (retryCount < this.retryConfig.maxRetries) {
					const baseDelay = this.retryConfig.baseDelay * Math.pow(2, retryCount)
					const jitter = Math.random() * 0.3 * baseDelay
					const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelay)
					
					console.log(`[心理师密码修改] API调用失败，${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试:`, error.message)
					
					await new Promise(resolve => setTimeout(resolve, delay))
					return this.executeWithRetry(apiCall, retryCount + 1)
				}
				throw error
			}
		},
		
		// 表单验证
		validateForm() {
			const { currentPassword, newPassword, confirmPassword } = this.formData
			
			if (!currentPassword) {
				return { valid: false, message: '请输入当前密码' }
			}
			
			if (!newPassword) {
				return { valid: false, message: '请输入新密码' }
			}
			
			if (newPassword.length < 6) {
				return { valid: false, message: '新密码至少需要6位字符' }
			}
			
			if (newPassword.length > 20) {
				return { valid: false, message: '新密码不能超过20位字符' }
			}
			
			if (!confirmPassword) {
				return { valid: false, message: '请确认新密码' }
			}
			
			if (newPassword !== confirmPassword) {
				return { valid: false, message: '两次密码输入不一致' }
			}
			
			if (currentPassword === newPassword) {
				return { valid: false, message: '新密码不能与当前密码相同' }
			}
			
			return { valid: true }
		},
		
		// 处理API错误
		handleChangeError(error) {
			let errorMessage = '密码修改失败，请重试'
			
			if (error && error.response) {
				const { status, data } = error.response
				
				switch (status) {
					case 400:
						if (data && data.message) {
							errorMessage = data.message
						} else {
							errorMessage = '请求参数错误'
						}
						break
					case 401:
						errorMessage = '当前密码错误'
						break
					case 403:
						errorMessage = '无权限修改密码'
						break
					case 429:
						errorMessage = '操作过于频繁，请稍后再试'
						break
					case 500:
						errorMessage = '服务器内部错误，请稍后重试'
						break
					default:
						errorMessage = `网络错误 (${status})`
				}
			} else if (error && error.message) {
				if (error.message.includes('timeout')) {
					errorMessage = '请求超时，请检查网络连接'
				} else if (error.message.includes('Network')) {
					errorMessage = '网络连接失败，请检查网络设置'
				} else {
					errorMessage = error.message
				}
			}
			
			uni.showToast({
				title: errorMessage,
				icon: 'none',
				duration: 3000
			})
		},
		
		// 清除表单数据
		clearForm() {
			this.formData = {
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			}
			this.passwordStrength = null
		},
		
		// 处理修改密码 - 企业级API集成
		async handleChangePassword() {
			if (this.isLoading) {
				return
			}
			
			// 表单验证
			const validation = this.validateForm()
			if (!validation.valid) {
				uni.showToast({
					title: validation.message,
					icon: 'none'
				})
				return
			}
			
			try {
				this.isLoading = true
				
				console.log('[心理师密码修改] 开始修改密码...')
				
				// 显示加载状态
				uni.showLoading({
					title: '正在修改密码...'
				})
				
				// 调用密码修改API（带重试机制）
				const response = await this.executeWithRetry(() => changePassword({
					currentPassword: this.formData.currentPassword,
					newPassword: this.formData.newPassword,
					userType: 'psychologist' // 标识心理师用户类型
				}))
				
				uni.hideLoading()
				
				if (response && (response.code === 200 || response.success)) {
					console.log('[心理师密码修改] 密码修改成功')
					
					uni.showToast({
						title: '密码修改成功',
						icon: 'success',
						duration: 2000
					})
					
					// 清除敏感数据
					this.clearForm()
					
					// 延迟返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 2000)
				} else {
					throw new Error(response?.message || '密码修改失败')
				}
				
			} catch (error) {
				console.error('[心理师密码修改] 密码修改失败:', error)
				uni.hideLoading()
				this.handleChangeError(error)
			} finally {
				this.isLoading = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.change-password-page {
	min-height: 100vh;
	background-size: cover;
	background-position: center;
	display: flex;
	flex-direction: column;
}

.status-bar {
	background-color: transparent;
}

.nav-bar {
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	height: 88rpx;
	
	.nav-back {
		display: flex;
		align-items: center;
		cursor: pointer;
		
		.nav-back-text {
			font-size: 32rpx;
			color: #FF4646;
			margin-left: 10rpx;
		}
	}
}

.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 100rpx 40rpx 60rpx;
}

.form-card {
	width: 100%;
	max-width: 640rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
	margin-bottom: 80rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.input-item {
	margin-bottom: 40rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

.password-strength {
	margin-top: 16rpx;
	display: flex;
	align-items: center;
	
	.strength-label {
		font-size: 24rpx;
		color: #666666;
	}
	
	.strength-text {
		font-size: 24rpx;
		font-weight: bold;
		margin-left: 8rpx;
		
		&.weak {
			color: #FF4D4F;
		}
		
		&.medium {
			color: #FA8C16;
		}
		
		&.strong {
			color: #52C41A;
		}
	}
}

.action-button {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
}
</style> 