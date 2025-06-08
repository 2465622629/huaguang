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
			isGettingCode: false
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
		backgroundStyle() {
			return {
				background: `url('${staticBaseUrl}/bg10.png') no-repeat center center`
			}
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
		
		// 验证手机号格式
		validatePhone(phone) {
			const phoneReg = /^1[3-9]\d{9}$/
			return phoneReg.test(phone)
		},
		
		// 获取验证码
		getVerifyCode() {
			// 防止重复点击
			if (this.countdown > 0 || this.isGettingCode) {
				return
			}
			
			// 验证手机号
			if (!this.formData.phone) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				})
				return
			}
			
			if (!this.validatePhone(this.formData.phone)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				})
				return
			}
			
			// 开始获取验证码
			this.isGettingCode = true
			
			// 这里可以调用API获取验证码
			console.log('获取验证码，手机号：', this.formData.phone)
			
			// 模拟API调用
			setTimeout(() => {
				this.isGettingCode = false
				this.startCountdown()
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				})
			}, 1000)
		},
		
		// 开始倒计时
		startCountdown() {
			this.countdown = 60
			const timer = setInterval(() => {
				this.countdown--
				if (this.countdown <= 0) {
					clearInterval(timer)
				}
			}, 1000)
		},
		
		// 处理绑定
		handleBinding() {
			// 表单验证
			if (!this.formData.phone) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				})
				return
			}
			
			if (!this.validatePhone(this.formData.phone)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				})
				return
			}
			
			if (!this.formData.verifyCode) {
				uni.showToast({
					title: '请输入验证码',
					icon: 'none'
				})
				return
			}
			
			// 这里可以调用API进行绑定
			console.log('绑定数据：', this.formData)
			
			uni.showToast({
				title: '绑定成功',
				icon: 'success'
			})
			
			// 延迟返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
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