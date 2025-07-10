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
				<!-- 当前密码输入框 -->
				<view class="input-item">
					<uv-input
						v-model="formData.currentPassword"
						type="text"
						:password="!showCurrentPassword"
						placeholder="当前密码"
						placeholderStyle="color: #8A8A8E"
						:suffixIcon="showCurrentPassword ? 'eye' : 'eye-off'"
						suffixIconStyle="color: #8A8A8E; fontSize: 20px"
						border="none"
						shape="square"
						:customStyle="{
							backgroundColor: '#F2F2F7',
							borderRadius: '8px',
							height: '44px',
							flex: '1',
							padding: '0 12px'
						}"
						@click-suffix-icon="toggleCurrentPassword"
					/>
				</view>
				
				<!-- 新密码输入框 -->
				<view class="input-item">
					<uv-input
						v-model="formData.newPassword"
						type="text"
						:password="!showNewPassword"
						placeholder="新密码"
						placeholderStyle="color: #8A8A8E"
						:suffixIcon="showNewPassword ? 'eye' : 'eye-off'"
						suffixIconStyle="color: #8A8A8E; fontSize: 20px"
						border="none"
						shape="square"
						:customStyle="{
							backgroundColor: '#F2F2F7',
							borderRadius: '8px',
							height: '44px',
							flex: '1',
							padding: '0 12px'
						}"
						@click-suffix-icon="toggleNewPassword"
					/>
				</view>
				
				<!-- 确认新密码输入框 -->
				<view class="input-item">
					<uv-input
						v-model="formData.confirmPassword"
						type="text"
						:password="!showConfirmPassword"
						placeholder="确认新密码"
						placeholderStyle="color: #8A8A8E"
						:suffixIcon="showConfirmPassword ? 'eye' : 'eye-off'"
						suffixIconStyle="color: #8A8A8E; fontSize: 20px"
						border="none"
						shape="square"
						:customStyle="{
							backgroundColor: '#F2F2F7',
							borderRadius: '8px',
							height: '44px',
							flex: '1',
							padding: '0 12px'
						}"
						@click-suffix-icon="toggleConfirmPassword"
					/>
				</view>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-button">
				<uv-button
					:text="isLoading ? '修改中...' : '点击修改'"
					type="primary"
					shape="circle"
					size="large"
					:disabled="isLoading"
					:loading="isLoading"
					:customStyle="{
						backgroundColor: isLoading ? '#CCCCCC' : '#007AFF',
						borderRadius: '25px',
						height: '50px',
						width: '280px'
					}"
					@click="handleChangePassword"
				/>
			</view>
		</view>
	</view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import { changePassword } from '@/api/modules/user.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
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
			// 加载状态
			isLoading: false
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
		
		// 处理修改密码
		async handleChangePassword() {
			// 防止重复提交
			if (this.isLoading) {
				return
			}
			
			// 表单验证
			if (!this.validateForm()) {
				return
			}
			
			this.isLoading = true
			
			try {
				// 调用API修改密码
				await this.callApiWithRetry()
				
				// 修改成功
				uni.showToast({
					title: '密码修改成功',
					icon: 'success',
					duration: 2000
				})
				
				// 清除表单数据
				this.clearForm()
				
				// 延迟返回上一页
				setTimeout(() => {
					uni.navigateBack()
				}, 2000)
				
			} catch (error) {
				console.error('修改密码失败：', error)
				this.handleChangeError(error)
			} finally {
				this.isLoading = false
			}
		},
		
		// 表单验证
		validateForm() {
			if (!this.formData.currentPassword) {
				uni.showToast({
					title: '请输入当前密码',
					icon: 'none'
				})
				return false
			}
			
			if (!this.formData.newPassword) {
				uni.showToast({
					title: '请输入新密码',
					icon: 'none'
				})
				return false
			}
			
			if (!this.formData.confirmPassword) {
				uni.showToast({
					title: '请确认新密码',
					icon: 'none'
				})
				return false
			}
			
			if (this.formData.newPassword !== this.formData.confirmPassword) {
				uni.showToast({
					title: '两次密码输入不一致',
					icon: 'none'
				})
				return false
			}
			
			// 密码强度验证
			if (this.formData.newPassword.length < 6) {
				uni.showToast({
					title: '新密码长度不能少于6位',
					icon: 'none'
				})
				return false
			}
			
			if (this.formData.currentPassword === this.formData.newPassword) {
				uni.showToast({
					title: '新密码不能与当前密码相同',
					icon: 'none'
				})
				return false
			}
			
			return true
		},
		
		// 智能API调用重试机制
		async callApiWithRetry(maxRetries = 3) {
			let lastError = null
			
			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					console.log(`修改密码API调用 - 第${attempt}次尝试`)
					
					const response = await changePassword({
						oldPassword: this.formData.currentPassword,
						newPassword: this.formData.newPassword
					})
					
					console.log('密码修改成功：', response)
					return response
					
				} catch (error) {
					console.error(`第${attempt}次API调用失败：`, error)
					lastError = error
					
					// 如果不是最后一次尝试，等待后重试
					if (attempt < maxRetries) {
						const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000) + Math.random() * 1000
						console.log(`等待${Math.round(delay)}ms后重试...`)
						await new Promise(resolve => setTimeout(resolve, delay))
					}
				}
			}
			
			throw lastError
		},
		
		// 错误处理
		handleChangeError(error) {
			let errorMessage = '密码修改失败，请稍后重试'
			
			if (error && error.message) {
				// 根据错误类型提供具体提示
				if (error.message.includes('当前密码错误') || error.message.includes('password incorrect')) {
					errorMessage = '当前密码输入错误，请重新输入'
				} else if (error.message.includes('密码格式') || error.message.includes('password format')) {
					errorMessage = '新密码格式不符合要求'
				} else if (error.message.includes('网络') || error.message.includes('network')) {
					errorMessage = '网络连接异常，请检查网络后重试'
				} else if (error.message.includes('权限') || error.message.includes('permission')) {
					errorMessage = '权限不足，请重新登录后重试'
				} else if (error.message.includes('频繁') || error.message.includes('frequent')) {
					errorMessage = '操作过于频繁，请稍后再试'
				} else if (error.message.includes('服务器') || error.message.includes('server')) {
					errorMessage = '服务器繁忙，请稍后重试'
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
			this.showCurrentPassword = false
			this.showNewPassword = false
			this.showConfirmPassword = false
		}
	},
	computed: {
		backgroundStyle() {
			return {
				backgroundImage: `url('${staticBaseUrl}/bg10.png')`,
				backgroundSize: '100% 100%',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center center'
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.change-password-page {
	min-height: 100vh;
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
		}
	}
	
	.action-button {
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
</style> 