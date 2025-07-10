<template>
	<view class="security-page" :style="{ background: 'url(' + config.staticBaseUrl + '/bg10.png) no-repeat center center / cover' }">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<uv-icon :name="config.staticBaseUrl + '/icons/back.png'" color="#2979FF" size="32"></uv-icon>
				<text class="nav-back-text">返回</text>
			</view>
		</view>
		
		<!-- 滚动容器 -->
		<scroll-view 
			class="scroll-container" 
			scroll-y 
			:style="{ height: scrollHeight + 'px' }"
			enable-flex
		>
			<!-- 主内容卡片 -->
			<view class="main-card">
				<!-- 绑定手机号 -->
				<view class="list-item" @click="handlePhoneClick" hover-class="list-item-hover">
					<text class="item-label">绑定手机号</text>
					<view class="item-right">
						<text class="item-value">{{ phoneNumber || '未绑定' }}</text>
						<text class="arrow-icon">›</text>
					</view>
				</view>
				
				<!-- 分割线 -->
				<view class="divider"></view>
				
				<!-- 登录密码 -->
				<view class="list-item" @click="handlePasswordClick" hover-class="list-item-hover">
					<text class="item-label">登录密码</text>
					<view class="item-right">
						<text class="item-value">已设置</text>
						<text class="arrow-icon">›</text>
					</view>
				</view>
			</view>
			
			<!-- 提示文本 -->
			<view class="hint-text">
				<text>为您的账号安全，请及时更新联系方式并设置强密码。</text>
			</view>
			
			<!-- 退出登录按钮 -->
			<view class="logout-button" @click="handleLogout" hover-class="logout-button-hover">
				<text class="logout-text">退出登录</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import config from '@/config/index.js'
import { getCurrentUser, changePassword, bindPhone, logout } from '@/api/modules/user.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			config: config,
			loading: false,
			phoneNumber: '',
			hasPhone: false,
			passwordStatus: '已设置',
			userInfo: {}
		}
	},
	onLoad() {
		this.initPage();
		this.loadUserInfo();
	},
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			// 计算滚动区域高度：屏幕高度 - 状态栏 - 导航栏
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 60;
		},

		// 加载用户信息
		async loadUserInfo() {
			if (this.loading) return;
			
			this.loading = true;
			let retryCount = 0;
			const maxRetries = 3;
			
			while (retryCount < maxRetries) {
				try {
					console.log(`[安全设置] 第${retryCount + 1}次尝试加载用户信息`);
					const response = await getCurrentUser();
					const userData = response.data || response;
					
					this.userInfo = userData;
					
					// 处理手机号显示
					if (userData.phone) {
						this.hasPhone = true;
						// 脱敏显示手机号
						const phone = userData.phone;
						this.phoneNumber = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
					} else {
						this.hasPhone = false;
						this.phoneNumber = '';
					}
					
					// 检查是否设置了密码 - 修复布尔值判断逻辑
					if (userData.hasPassword === true || userData.hasPassword === 'true' || userData.hasPassword === 1) {
						this.passwordStatus = '已设置';
					} else if (userData.hasPassword === false || userData.hasPassword === 'false' || userData.hasPassword === 0) {
						this.passwordStatus = '未设置';
					} else {
						// 默认认为已设置密码（安全考虑）
						this.passwordStatus = '已设置';
					}
					
					console.log('[安全设置] 用户安全信息加载成功:', userData);
					break; // 成功后跳出重试循环
					
				} catch (error) {
					retryCount++;
					console.error(`[安全设置] 第${retryCount}次获取用户信息失败:`, error);
					
					if (retryCount >= maxRetries) {
						// 最后一次重试失败，显示错误提示
						const errorMsg = this.getErrorMessage(error);
						uni.showToast({
							title: errorMsg,
							icon: 'none',
							duration: 3000
						});
						
						// 增强的默认值保护机制
						this.setDefaultSecurityValues();
						break;
					} else {
						// 增强的指数退避重试策略
						const baseDelay = 1000;
						const maxDelay = 8000;
						const jitter = Math.random() * 0.1; // 添加随机抖动避免雷群效应
						const delay = Math.min(baseDelay * Math.pow(2, retryCount - 1) * (1 + jitter), maxDelay);
						console.log(`[安全设置] 等待${delay}ms后进行第${retryCount + 1}次重试`);
						await new Promise(resolve => setTimeout(resolve, delay));
					}
				}
			}
			
			this.loading = false;
		},
		
		// 设置默认安全值 - 防止API失败时页面显示异常
		setDefaultSecurityValues() {
			try {
				// 从本地存储尝试获取缓存的用户信息
				const cachedUserInfo = uni.getStorageSync('userInfo');
				
				if (cachedUserInfo && typeof cachedUserInfo === 'object') {
					console.log('[安全设置] 使用缓存的用户信息作为默认值');
					
					// 处理手机号
					if (cachedUserInfo.phone) {
						this.hasPhone = true;
						const phone = cachedUserInfo.phone;
						this.phoneNumber = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
					} else {
						this.hasPhone = false;
						this.phoneNumber = '';
					}
					
					// 处理密码状态
					if (cachedUserInfo.hasPassword === true || cachedUserInfo.hasPassword === 'true' || cachedUserInfo.hasPassword === 1) {
						this.passwordStatus = '已设置';
					} else if (cachedUserInfo.hasPassword === false || cachedUserInfo.hasPassword === 'false' || cachedUserInfo.hasPassword === 0) {
						this.passwordStatus = '未设置';
					} else {
						this.passwordStatus = '已设置'; // 默认安全值
					}
					
					this.userInfo = cachedUserInfo;
				} else {
					console.log('[安全设置] 无缓存信息，使用系统默认值');
					
					// 设置系统默认值
					this.hasPhone = false;
					this.phoneNumber = '';
					this.passwordStatus = '已设置'; // 出于安全考虑，默认认为已设置密码
					this.userInfo = {};
				}
				
				console.log('[安全设置] 默认安全值设置完成');
			} catch (error) {
				console.error('[安全设置] 设置默认安全值失败:', error);
				
				// 最后的兜底方案
				this.hasPhone = false;
				this.phoneNumber = '';
				this.passwordStatus = '已设置';
				this.userInfo = {};
			}
		},
		
		// 获取错误信息 - 增强版本
		getErrorMessage(error) {
			// 网络相关错误
			if (error.code === 'NETWORK_ERROR' || error.message?.includes('网络')) {
				return '网络连接异常，请检查网络后重试';
			}
			
			// HTTP状态码错误
			if (error.code === 401 || error.status === 401) {
				return '登录已过期，请重新登录';
			} else if (error.code === 403 || error.status === 403) {
				return '权限不足，无法访问安全设置';
			} else if (error.code === 404 || error.status === 404) {
				return '服务暂时不可用，请稍后重试';
			} else if (error.code === 429 || error.status === 429) {
				return '操作过于频繁，请稍后再试';
			} else if (error.code === 500 || error.status === 500) {
				return '服务器内部错误，请稍后重试';
			} else if (error.code === 502 || error.status === 502) {
				return '服务器维护中，请稍后重试';
			} else if (error.code === 503 || error.status === 503) {
				return '服务暂时不可用，请稍后重试';
			}
			
			// 业务逻辑错误
			if (error.code === 'PHONE_ALREADY_BOUND') {
				return '该手机号已被其他账号绑定';
			} else if (error.code === 'INVALID_SMS_CODE') {
				return '验证码错误或已过期';
			} else if (error.code === 'PASSWORD_TOO_WEAK') {
				return '密码强度不够，请设置更复杂的密码';
			} else if (error.code === 'OLD_PASSWORD_INCORRECT') {
				return '当前密码输入错误';
			} else if (error.code === 'PHONE_NOT_BOUND') {
				return '手机号未绑定，无法执行此操作';
			}
			
			// 超时错误
			if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
				return '请求超时，请检查网络后重试';
			}
			
			// 自定义错误信息
			if (error.message && typeof error.message === 'string') {
				return error.message;
			}
			
			// 默认错误信息
			return '操作失败，请稍后重试';
		},
		
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 处理手机号点击
		handlePhoneClick() {
			if (this.hasPhone) {
				// 已绑定手机号，显示更换选项
				uni.showActionSheet({
					itemList: ['更换手机号', '解绑手机号'],
					success: (res) => {
						if (res.tapIndex === 0) {
							this.showBindPhoneModal();
						} else if (res.tapIndex === 1) {
							this.unbindPhone();
						}
					}
				});
			} else {
				// 未绑定，直接显示绑定界面
				this.showBindPhoneModal();
			}
		},

		// 显示绑定手机号弹窗
		showBindPhoneModal() {
			// 显示手机号输入弹窗
			uni.showModal({
				title: '绑定手机号',
				content: '请输入手机号',
				editable: true,
				placeholderText: '请输入11位手机号',
				success: (res) => {
					if (res.confirm && res.content) {
						const phone = res.content.trim();
						if (this.validatePhone(phone)) {
							this.sendSmsCode(phone);
						} else {
							uni.showToast({
								title: '请输入正确的手机号',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		
		// 验证手机号格式
		validatePhone(phone) {
			const phoneRegex = /^1[3-9]\d{9}$/;
			return phoneRegex.test(phone);
		},
		
		// 发送短信验证码
		async sendSmsCode(phone) {
			try {
				uni.showLoading({ title: '发送验证码中...' });
				
				// 这里应该调用发送验证码的API
				// await sendSmsCode({ phone, type: 'bind' });
				
				uni.hideLoading();
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				});
				
				// 显示验证码输入弹窗
				this.showSmsCodeModal(phone);
				
			} catch (error) {
				uni.hideLoading();
				console.error('[安全设置] 发送验证码失败:', error);
				uni.showToast({
					title: '发送验证码失败',
					icon: 'none'
				});
			}
		},
		
		// 显示验证码输入弹窗
		showSmsCodeModal(phone) {
			uni.showModal({
				title: '输入验证码',
				content: `验证码已发送至 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`,
				editable: true,
				placeholderText: '请输入6位验证码',
				success: (res) => {
					if (res.confirm && res.content) {
						const smsCode = res.content.trim();
						if (smsCode.length === 6) {
							this.requestBindPhone(phone, smsCode);
						} else {
							uni.showToast({
								title: '请输入6位验证码',
								icon: 'none'
							});
						}
					}
				}
			});
		},

		// 请求绑定手机号
		async requestBindPhone(phone, smsCode) {
			let retryCount = 0;
			const maxRetries = 3;
			
			while (retryCount < maxRetries) {
				try {
					uni.showLoading({ title: '绑定中...' });
					
					const response = await bindPhone({
						phone: phone,
						smsCode: smsCode
					});
					
					uni.hideLoading();
					uni.showToast({
						title: '绑定成功',
						icon: 'success'
					});
					
					console.log('[安全设置] 手机号绑定成功:', response);
					
					// 重新加载用户信息
					setTimeout(() => {
						this.loadUserInfo();
					}, 1500);
					
					break; // 成功后跳出重试循环
					
				} catch (error) {
					retryCount++;
					uni.hideLoading();
					console.error(`[安全设置] 第${retryCount}次绑定手机号失败:`, error);
					
					if (retryCount >= maxRetries) {
						const errorMsg = this.getErrorMessage(error);
						uni.showToast({
							title: errorMsg,
							icon: 'none',
							duration: 3000
						});
						break;
					} else {
						// 指数退避重试策略
						const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 3000);
						await new Promise(resolve => setTimeout(resolve, delay));
					}
				}
			}
		},

		// 解绑手机号
		unbindPhone() {
			uni.showModal({
				title: '确认解绑',
				content: '解绑后将无法通过手机号找回密码，确定要解绑吗？',
				confirmColor: '#FF5A5F',
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({ title: '解绑中...' });
							
							// 使用绑定接口，传入空手机号实现解绑
							await bindPhone({
								phone: '',
								smsCode: '',
								action: 'unbind'
							});
							
							uni.hideLoading();
							uni.showToast({
								title: '解绑成功',
								icon: 'success'
							});
							
							console.log('[安全设置] 手机号解绑成功');
							
							// 重新加载用户信息
							setTimeout(() => {
								this.loadUserInfo();
							}, 1500);
							
						} catch (error) {
							uni.hideLoading();
							console.error('[安全设置] 解绑手机号失败:', error);
							
							const errorMsg = this.getErrorMessage(error);
							uni.showToast({
								title: errorMsg,
								icon: 'none'
							});
						}
					}
				}
			});
		},
		
		// 处理密码点击
		handlePasswordClick() {
			// 显示修改密码弹窗
			this.showChangePasswordModal();
		},

		// 显示修改密码弹窗
		showChangePasswordModal() {
			// 显示旧密码输入弹窗
			uni.showModal({
				title: '修改密码',
				content: '请输入当前密码',
				editable: true,
				placeholderText: '请输入当前密码',
				success: (res) => {
					if (res.confirm && res.content) {
						const oldPassword = res.content.trim();
						if (oldPassword.length >= 6) {
							this.showNewPasswordModal(oldPassword);
						} else {
							uni.showToast({
								title: '密码长度至少6位',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		
		// 显示新密码输入弹窗
		showNewPasswordModal(oldPassword) {
			uni.showModal({
				title: '设置新密码',
				content: '请输入新密码（至少6位，建议包含字母和数字）',
				editable: true,
				placeholderText: '请输入新密码',
				success: (res) => {
					if (res.confirm && res.content) {
						const newPassword = res.content.trim();
						if (this.validatePassword(newPassword)) {
							this.showConfirmPasswordModal(oldPassword, newPassword);
						} else {
							uni.showToast({
								title: '密码格式不符合要求',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		
		// 显示确认新密码弹窗
		showConfirmPasswordModal(oldPassword, newPassword) {
			uni.showModal({
				title: '确认新密码',
				content: '请再次输入新密码',
				editable: true,
				placeholderText: '请再次输入新密码',
				success: (res) => {
					if (res.confirm && res.content) {
						const confirmPassword = res.content.trim();
						if (confirmPassword === newPassword) {
							this.requestChangePassword(oldPassword, newPassword);
						} else {
							uni.showToast({
								title: '两次输入的密码不一致',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		
		// 验证密码强度
		validatePassword(password) {
			// 至少6位，包含字母和数字
			const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
			return password.length >= 6 && passwordRegex.test(password);
		},

		// 请求修改密码
		async requestChangePassword(oldPassword, newPassword) {
			let retryCount = 0;
			const maxRetries = 3;
			
			while (retryCount < maxRetries) {
				try {
					uni.showLoading({ title: '修改密码中...' });
					
					const response = await changePassword({
						oldPassword: oldPassword,
						newPassword: newPassword
					});
					
					uni.hideLoading();
					uni.showToast({
						title: '密码修改成功',
						icon: 'success'
					});
					
					console.log('[安全设置] 密码修改成功:', response);
					
					// 更新密码状态
					this.passwordStatus = '已设置';
					
					break; // 成功后跳出重试循环
					
				} catch (error) {
					retryCount++;
					uni.hideLoading();
					console.error(`[安全设置] 第${retryCount}次修改密码失败:`, error);
					
					if (retryCount >= maxRetries) {
						const errorMsg = this.getErrorMessage(error);
						uni.showToast({
							title: errorMsg,
							icon: 'none',
							duration: 3000
						});
						break;
					} else {
						// 指数退避重试策略
						const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 3000);
						await new Promise(resolve => setTimeout(resolve, delay));
					}
				}
			}
		},
		
		// 处理退出登录
		async handleLogout() {
			uni.showModal({
				title: '退出登录',
				content: '确定要退出登录吗？',
				confirmColor: '#FF5A5F',
				success: async (res) => {
					if (res.confirm) {
						let retryCount = 0;
						const maxRetries = 2; // 退出登录重试次数较少
						
						while (retryCount < maxRetries) {
							try {
								uni.showLoading({ title: '退出登录中...' });
								
								// 调用退出登录API
								await logout();
								
								// 清除本地存储的用户信息
								this.clearUserData();
								
								uni.hideLoading();
								uni.showToast({
									title: '退出登录成功',
									icon: 'success'
								});
								
								console.log('[安全设置] 退出登录成功');
								
								// 延迟跳转到登录页
								setTimeout(() => {
									uni.reLaunch({
										url: '/pages/login/login'
									});
								}, 1500);
								
								break; // 成功后跳出重试循环
								
							} catch (error) {
								retryCount++;
								uni.hideLoading();
								console.error(`[安全设置] 第${retryCount}次退出登录失败:`, error);
								
								if (retryCount >= maxRetries) {
									// 即使API调用失败，也要清除本地数据并跳转
									console.log('[安全设置] API退出失败，执行本地退出');
									this.clearUserData();
									
									uni.showToast({
										title: '已退出登录',
										icon: 'success'
									});
									
									setTimeout(() => {
										uni.reLaunch({
											url: '/pages/login/login'
										});
									}, 1500);
									break;
								} else {
									// 短暂延迟后重试
									await new Promise(resolve => setTimeout(resolve, 1000));
								}
							}
						}
					}
				}
			});
		},
		
		// 清除用户数据 - 增强版本
		clearUserData() {
			try {
				// 清除核心用户信息
				const coreKeys = [
					'token',
					'userInfo',
					'userSettings',
					'commissionInfo',
					'loginInfo',
					'authInfo',
					'refreshToken',
					'deviceToken'
				];
				
				let clearedCoreCount = 0;
				coreKeys.forEach(key => {
					try {
						uni.removeStorageSync(key);
						clearedCoreCount++;
						console.log(`[安全设置] 已清除核心数据: ${key}`);
					} catch (error) {
						console.warn(`[安全设置] 清除核心数据${key}失败:`, error);
					}
				});
				
				// 清除缓存和临时数据
				const keys = uni.getStorageInfoSync().keys;
				const cachePatterns = [
					'user_',
					'cache_',
					'favorite_',
					'history_',
					'api_cache_',
					'request_cache_',
					'response_cache_',
					'video_cache_',
					'image_cache_',
					'data_cache_',
					'temp_',
					'session_',
					'invite_',
					'team_',
					'commission_'
				];
				
				let clearedCacheCount = 0;
				keys.forEach(key => {
					if (cachePatterns.some(pattern => key.startsWith(pattern))) {
						try {
							uni.removeStorageSync(key);
							clearedCacheCount++;
							console.log(`[安全设置] 已清除缓存数据: ${key}`);
						} catch (error) {
							console.warn(`[安全设置] 清除缓存数据${key}失败:`, error);
						}
					}
				});
				
				console.log(`[安全设置] 用户数据清除完成 - 核心数据:${clearedCoreCount}项，缓存数据:${clearedCacheCount}项`);
			} catch (error) {
				console.error('[安全设置] 清除用户数据失败:', error);
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.security-page {
	width: 100%;
	height: 100vh;
}

.status-bar {
	width: 100%;
	background: transparent;
}

.nav-bar {
	height: 60px;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
}

.nav-back {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.nav-back-icon {
	font-size: 36rpx;
	color: #007AFF;
	margin-right: 8rpx;
	font-weight: normal;
	line-height: 1;
}

.nav-back-text {
	font-size: 32rpx;
	color: #007AFF;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.scroll-container {
	width: 100%;
	padding: 0 30rpx;
	box-sizing: border-box;
}

.main-card {
	background: #FFFFFF;
	border-radius: 24rpx;
	margin-top: 40rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
}

.list-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 40rpx;
	min-height: 88rpx;
	box-sizing: border-box;
}

.list-item-hover {
	background-color: #F8F8F8;
}

.item-label {
	font-size: 30rpx;
	color: #333333;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.item-right {
	display: flex;
	align-items: center;
}

.item-value {
	font-size: 30rpx;
	color: #888888;
	margin-right: 16rpx;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.arrow-icon {
	font-size: 32rpx;
	color: #CCCCCC;
	line-height: 1;
}

.divider {
	height: 1px;
	background-color: #EFEFEF;
	margin: 0 40rpx;
}

.hint-text {
	margin-top: 24rpx;
	padding: 0 40rpx;
}

.hint-text text {
	font-size: 24rpx;
	color: #666666;
	line-height: 1.5;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.logout-button {
	margin-top: 60rpx;
	margin-bottom: 40rpx;
	background: #FF5A5F;
	border-radius: 88rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 40rpx;
	margin-right: 40rpx;
}

.logout-button-hover {
	background: #E54A4F;
}

.logout-text {
	font-size: 32rpx;
	color: #FFFFFF;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}
</style> 