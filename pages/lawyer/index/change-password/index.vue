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
					text="点击修改"
					type="primary"
					shape="circle"
					size="large"
					:customStyle="{
						backgroundColor: '#007AFF',
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
			showConfirmPassword: false
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
		handleChangePassword() {
			// 表单验证
			if (!this.formData.currentPassword) {
				uni.showToast({
					title: '请输入当前密码',
					icon: 'none'
				})
				return
			}
			
			if (!this.formData.newPassword) {
				uni.showToast({
					title: '请输入新密码',
					icon: 'none'
				})
				return
			}
			
			if (!this.formData.confirmPassword) {
				uni.showToast({
					title: '请确认新密码',
					icon: 'none'
				})
				return
			}
			
			if (this.formData.newPassword !== this.formData.confirmPassword) {
				uni.showToast({
					title: '两次密码输入不一致',
					icon: 'none'
				})
				return
			}
			
			// 这里可以调用API进行密码修改
			console.log('修改密码数据：', this.formData)
			
			uni.showToast({
				title: '密码修改成功',
				icon: 'success'
			})
			
			// 延迟返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
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