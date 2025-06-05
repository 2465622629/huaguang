<template>
	<view class="login-container">
		<view class="card-container">
			<view class="card-title">
				<text>登录</text>
			</view>
			
			<view class="register-tip">
				<text>还没有账户？</text>
				<text class="register-link" @click="goToRegister">注册</text>
			</view>
			<view class="input-group">
				<uv-text class="input-label" text="电子邮箱/手机号码" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="email"
					type="text"
					placeholder="请输入电子邮箱/手机号码"
					border="none"
					:custom-style="inputStyle"
				/>
				<uv-text class="input-label" text="密码" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="password"
					type="password"
					placeholder="请输入密码"
					border="none"
					:custom-style="inputStyle"
				/>
				<view class="password-options">
					<view class="left-option">
						<checkbox :checked="rememberPassword" @tap="toggleRememberPassword" />
						<text class="remember-text">记住密码</text>
					</view>
					<view class="right-option">
						<text class="forgot-password" @click="forgotPassword">忘记密码？</text>
					</view>
				</view>
				<view class="login-button">
					<uv-button text="登录" color="#4893FF" @click="handleLogin" :custom-style="{ fontSize: '25rpx' }" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { login } from '@/api/modules/auth.js'
	
	export default {
		data() {
			return {
				email: '',
				password: '',
				rememberPassword: false,
				inputStyle: {
					background: '#F5F5F5',
					borderRadius: '8px',
					padding: '0 12px',
					height: '44px'
				}
			}
		},
		onLoad() {
			// 检查是否有记住的密码
			this.checkRememberedPassword()
		},
		methods: {
			// 跳转到注册页面
			goToRegister() {
				uni.$uv.route({
					url: '/pages/register/register'
				})
			},
			// 检查记住的密码
			checkRememberedPassword() {
				try {
					const rememberedData = uni.getStorageSync('rememberedLogin')
					console.log('记住的密码数据：', rememberedData)
					if (rememberedData) {
						const data = JSON.parse(rememberedData)
						this.email = data.email
						this.password = data.password
						this.rememberPassword = true
					}
				} catch (e) {
					console.error('读取记住的密码失败：', e)
				}
			},
			// 切换记住密码状态
			toggleRememberPassword() {
				this.rememberPassword = !this.rememberPassword
			},
			// 处理登录
			async handleLogin() {
				if (!this.email || !this.password) {
					uni.showToast({
						title: '请输入账号和密码',
						icon: 'none'
					})
					return
				}
				
				try {
					// 显示加载中
					uni.showLoading({
						title: '登录中...'
					})
					console.log('登录中...')
				// 调用登录接口
				const data = await login({
					loginAccount: this.email,
					password: this.password,
					rememberMe: this.rememberPassword
				})
					console.log('登录成功：', data)
					console.log('是否记住密码：', this.rememberPassword)
					
					// 检查返回数据的结构
					console.log('API返回数据结构：', JSON.stringify(data, null, 2))
					
					// 处理记住密码
					if (this.rememberPassword) {
						const loginData = {
							email: this.email,
							password: this.password
						}
						uni.setStorageSync('rememberedLogin', JSON.stringify(loginData))
						console.log('保存记住的密码：', loginData)
					} else {
						uni.removeStorageSync('rememberedLogin')
						console.log('清除记住的密码')
					}

					// 保存用户信息和token - 适配实际API返回结构
					if (data && data.accessToken) {
						uni.setStorageSync('token', data.accessToken)
						console.log('Token存储成功：', data.accessToken)
					} else {
						console.error('AccessToken不存在于返回数据中：', data)
					}
					
					// 构建用户信息对象
					if (data && data.userId && data.username) {
						const userInfo = {
							userId: data.userId,
							username: data.username,
							userType: data.userType || 'user'
						}
						uni.setStorageSync('userInfo', userInfo)
						console.log('用户信息存储成功：', userInfo)
					} else {
						console.error('用户基本信息不完整：', data)
					}
					
					if (data && data.tokenExpireTime) {
						uni.setStorageSync('tokenExpireTime', data.tokenExpireTime)
						console.log('Token过期时间存储成功：', data.tokenExpireTime)
					}
					
					if (data && data.userId) {
						uni.setStorageSync('userId', data.userId)
						console.log('用户ID存储成功：', data.userId)
					}
					
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})
					
					// 直接跳转到用户端首页
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/user/index/index'
						})
					}, 1500)
				} catch (error) {
					// 错误已经在请求拦截器中处理
				} finally {
					uni.hideLoading()
				}
			},
			forgotPassword() {
				// 跳转到忘记密码页面
				uni.navigateTo({
					url: '/pages/forgot-password/forgot-password'
				})
			}
		}
	}
</script>

<style>
.custom-navbar {
	width: 100%;
	height: 44px;
	padding-top: var(--status-bar-height, 20px);
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 10;
}
.navbar-title {
	font-size: 18px;
	font-weight: bold;
	color: #333;
}
.login-container {
	width: 100%;
	height: 100vh;
	background: linear-gradient(180deg, #D3E5FF 0%, #4893FF 56.16%, #D3E5FF 100%);
	padding-top: 44px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.card-container {
	width: 80%;
	max-width: 350px;
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 4px 24px rgba(0,0,0,0.08);
	padding: 32px 24px;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.card-title {
	font-size: 24px;
	font-weight: bold;
	color: #333;
	/* margin-bottom: 24px; */
}
.input-group {
	margin-top: 24px;
	width: 100%;
}
.input-label {
	margin-bottom: 8px;
	display: block;
}
.input-item {
	margin-bottom: 16px;
}
.password-options {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8px;
	width: 100%;
}
.left-option {
	flex: 1;
}
.right-option {
	margin-left: auto;
}
.register-tip {
	margin-top: 16px;
	font-size: 14px;
	color: #666;
	display: flex;
	align-items: center;
}
.login-button {
	margin-top: 24px;
	width: 100%;
}
.register-link {
	color: #4893FF;
	font-size: 14px;
	margin-left: 10px;
}
.remember-text {
	margin-left: 5px;
}
.forgot-password {
	color: #4893FF;
	font-size: 14px;
	margin-left: 10px;
}
</style>
