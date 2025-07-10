<template>
	<view class="register-container">
		<view class="back-button" @click="goToLogin">
			<uv-icon name="arrow-left" color="#333" size="40"></uv-icon>
		</view>
		<view class="card-container">
			<view class="card-title">
				<text>注册</text>
			</view>
			
			<view class="login-tip">
				<text>已有账户？</text>
				<text class="login-link" @click="goToLogin">登录</text>
			</view>
			<view class="input-group">
				<uv-text class="input-label" text="全名" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="fullName"
					type="text"
					placeholder="请输入您的全名"
					border="none"
					:custom-style="inputStyle"
				/>
				<uv-text class="input-label" text="电子邮件" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="email"
					type="text"
					placeholder="请输入您的电子邮件"
					border="none"
					:custom-style="inputStyle"
				/>
				<uv-text class="input-label" text="出生日期" size="25" color="#333" />
				<view class="input-item date-input" @click="openDatePicker">
					<text>{{ birthDate || '请选择您的出生日期' }}</text>
				</view>
				<uv-text class="input-label" text="手机号码" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="phone"
					type="number"
					placeholder="请输入您的手机号码"
					border="none"
					:custom-style="inputStyle"
				>
					<template v-slot:suffix>
						<uv-code
							ref="uCode"
							@change="codeChange"
							seconds="60"
							changeText="X秒后重新获取"
						></uv-code>
						<uv-button
							@click="getCode"
							:text="tips"
							type="success"
							size="mini"
							:custom-style="{ 
								fontSize: '14px',
								width: '120rpx',
								height: '44px',
								marginLeft: '10px'
							}"
						></uv-button>
					</template>
				</uv-input>
				<uv-text class="input-label" text="验证码" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="verifyCode"
					type="number"
					placeholder="请输入验证码"
					border="none"
					:custom-style="inputStyle"
				/>
				<uv-text class="input-label" text="设置密码" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="password"
					type="password"
					placeholder="请设置您的密码（8-20位，包含字母和数字）"
					border="none"
					:custom-style="inputStyle"
				/>
				<uv-text class="input-label" text="确认密码" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="confirmPassword"
					type="password"
					placeholder="请再次输入密码"
					border="none"
					:custom-style="inputStyle"
				/>
				<uv-text class="input-label" text="昵称" size="25" color="#333" />
				<uv-input
					class="input-item"
					v-model="nickname"
					type="text"
					placeholder="请输入您的昵称（选填）"
					border="none"
					:custom-style="inputStyle"
				/>
				<view class="register-button">
					<uv-button text="注册" color="#4893FF" @click="handleRegister" :custom-style="{ fontSize: '25rpx' }" />
				</view>
			</view>
		</view>
		<uv-datetime-picker 
			ref="datetimePicker" 
			v-model="dateValue" 
			mode="date" 
			@confirm="confirmDate"
			:minDate="0"
		></uv-datetime-picker>
	</view>
</template>

<script>
	import { register, sendSmsCode, verifySmsCode } from '@/api/modules/auth.js'
	import { toast } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
	
	export default {
		data() {
			return {
				fullName: '',
				email: '',
				birthDate: '',
				phone: '',
				password: '',
				confirmPassword: '',
				verifyCode: '',
				nickname: '',
				dateValue: Number(new Date()),
				tips: '获取验证码',
				inputStyle: {
					background: '#F5F5F5',
					borderRadius: '8px',
					padding: '0 12px',
					height: '44px'
				}
			}
		},
		computed: {
			isPhoneValid() {
				return /^1[3-9]\d{9}$/.test(this.phone)
			},
			isPasswordValid() {
				return /^(?=.*[a-zA-Z])(?=.*\d).{8,20}$/.test(this.password)
			}
		},
		methods: {
			// 跳转到登录页面
			goToLogin() {
				uni.$uv.route({
					url: '/pages/login/login'
				})
			},
			// 打开日期选择器
			openDatePicker() {
				this.$refs.datetimePicker.open()
			},
			// 确认日期选择
			confirmDate(e) {
				if (!e || !e.value) return;
				const date = new Date(e.value);
				if (isNaN(date.getTime())) return;
				
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				this.birthDate = `${year}-${month}-${day}`;
			},
			codeChange(text) {
				this.tips = text
			},
			
			async getCode() {
				if (!this.isPhoneValid) {
					uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					})
					return
				}
				
				try {
					// 调用发送短信验证码接口
					await sendSmsCode({
						phone: this.phone,
						type: 'register'
					})
					
					// 启动倒计时
					this.$refs.uCode.start()
					
					uni.showToast({
						title: '验证码已发送',
						icon: 'success'
					})
				} catch (error) {
					console.error('发送验证码失败：', error)
				}
			},
			// 处理注册
			async handleRegister() {
				if (!this.fullName || !this.email || !this.birthDate || !this.phone || !this.verifyCode || !this.password || !this.confirmPassword) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					})
					return
				}
				
				if (!this.isPhoneValid) {
					uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					})
					return
				}
				
				if (!this.isPasswordValid) {
					uni.showToast({
						title: '密码必须包含字母和数字，长度8-20位',
						icon: 'none'
					})
					return
				}
				
				if (this.password !== this.confirmPassword) {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'none'
					})
					return
				}
				
				try {
					// 显示加载中
					uni.showLoading({
						title: '验证中...'
					})
					
					// 先验证短信验证码
					await verifySmsCode({
						phone: this.phone,
						code: this.verifyCode
					})
					
					// 验证码验证成功后，更新加载提示
					uni.showLoading({
						title: '注册中...'
					})
					
					// 调用注册接口
					const response = await register({
						realName: this.fullName,
						nickname: this.nickname,
						email: this.email,
						birthDate: this.birthDate,
						phone: this.phone,
						password: this.password,
						smsCode: this.verifyCode, // 添加验证码参数
						userType: 'user' // 默认用户类型
					})
					
					console.log('注册响应：', response)
					
					uni.showToast({
						title: '注册成功',
						icon: 'success'
					})
					
					// 跳转到登录页面
					setTimeout(() => {
						uni.$uv.route({
							url: '/pages/login/login'
						})
					}, 1500)
				} catch (error) {
					console.error('注册失败：', error)
					// 根据错误类型显示不同的提示信息
					if (error.message && error.message.includes('验证码')) {
						uni.showToast({
							title: '验证码错误或已过期',
							icon: 'none'
						})
					} else if (error.message && error.message.includes('手机号')) {
						uni.showToast({
							title: '手机号已被注册',
							icon: 'none'
						})
					} else if (error.message && error.message.includes('邮箱')) {
						uni.showToast({
							title: '邮箱已被注册',
							icon: 'none'
						})
					} else {
						uni.showToast({
							title: error.message || '注册失败，请重试',
							icon: 'none'
						})
					}
				} finally {
					uni.hideLoading()
				}
			}
		}
	}
</script>

<style>
.register-container {
	width: 100%;
	min-height: 100vh;
	background: linear-gradient(180deg, #D3E5FF 0%, #4893FF 56.16%, #D3E5FF 100%);
	padding-top: 44px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
}
.back-button {
	position: absolute;
	left: 20px;
	top: 60px;
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
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
	margin-bottom: 20rpx;
}
.card-title {
	font-size: 24px;
	font-weight: bold;
	color: #333;
	margin-top: 50rpx;
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
.date-input {
	background: #F5F5F5;
	border-radius: 8px;
	padding: 0 12px;
	height: 44px;
	display: flex;
	align-items: center;
	color: #999;
}
.verify-code-group {
	display: flex;
	align-items: center;
	margin-bottom: 16px;
}
.verify-code-input {
	flex: 1;
}
.login-tip {
	margin-top: 16px;
	font-size: 14px;
	color: #666;
	display: flex;
	align-items: center;
}
.login-link {
	color: #4893FF;
	font-size: 14px;
	margin-left: 10px;
}
.register-button {
	margin-top: 24px;
	width: 100%;
}
</style>
