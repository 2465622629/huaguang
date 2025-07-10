<template>
	<view class="about-page" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="back-button" @click="goBack">
				<uv-icon name="arrow-left" color="#2979FF" size="32"></uv-icon>
				<text class="back-text">返回</text>
			</view>
		</view>

		<!-- 滚动容器 -->
		<scroll-view class="scroll-container" scroll-y :style="{ height: scrollHeight + 'px' }" enable-flex>
			<!-- 平台描述卡片 -->
			<view class="description-card">
				<text class="description-text">{{ appInfo.description }}</text>
			</view>

			<!-- 版本信息与协议卡片 -->
			<view class="info-card">
				<view class="info-item">
					<text class="info-text">版本号 {{ appInfo.version }}</text>
				</view>
				<view class="divider"></view>
				<view class="info-item">
					<text class="info-text">更新时间: {{ appInfo.updateTime }}</text>
				</view>
				<view class="divider"></view>
				<view class="info-item clickable" @click="openUserAgreement" hover-class="info-item-hover">
					<text class="info-text">用户协议</text>
					<text class="arrow-icon">›</text>
				</view>
				<view class="divider"></view>
				<view class="info-item clickable" @click="openPrivacyPolicy" hover-class="info-item-hover">
					<text class="info-text">隐私协议</text>
					<text class="arrow-icon">›</text>
				</view>
			</view>

			<!-- 联系我们卡片 -->
			<view class="contact-card">
				<text class="card-title">联系我们</text>
				<view class="contact-item" @click="copyContact('email')" hover-class="contact-item-hover">
					<text class="contact-text">客服邮箱: {{ contactInfo.email }}</text>
					<text class="copy-hint">点击复制</text>
				</view>
				<view class="contact-item" @click="copyContact('phone')" hover-class="contact-item-hover">
					<text class="contact-text">客服电话: {{ contactInfo.phone }} (工作时间: {{ contactInfo.workTime }})</text>
					<text class="copy-hint">点击复制</text>
				</view>
			</view>

			<!-- 公司信息卡片 -->
			<view class="company-card">
				<text class="card-title">公司信息</text>
				<view class="company-item">
					<text class="company-text">公司名称: {{ companyInfo.name }}</text>
				</view>
				<view class="company-item">
					<text class="company-text">公司地址: {{ companyInfo.address }}</text>
				</view>
			</view>

			<!-- 页脚版权信息 -->
			<view class="footer">
				<text class="copyright-text">© 2024 {{ companyInfo.name }}版权所有 保留所有权利。</text>
			</view>
			
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import { getCurrentUser, getUserSettings } from '@/api/modules/user.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			backgroundImage: staticBaseUrl + '/bg10.png',
			appInfo: {
				version: 'v1.2.3',
				updateTime: '2025年12月1日',
				description: '本平台致力于为用户提供法律咨询、心理支持、职业帮扶等一体化服务，构建一个温暖、有保障的互助网络。'
			},
			contactInfo: {
				email: 'support@huaguang.com',
				phone: '400-888-8888',
				workTime: '9:00-18:00'
			},
			companyInfo: {
				name: '华光科技有限公司',
				address: '北京市海淀区中关村软件园'
			},
			loading: false,
			retryCount: 0,
			maxRetries: 3
		}
	},
	onLoad() {
		this.initPage();
		this.loadAboutInfo();
	},
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			// 计算滚动容器高度：屏幕高度 - 状态栏高度 - 导航栏高度(约44px)
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44;
		},

		// 加载关于页面信息
		async loadAboutInfo() {
			if (this.loading) return;
			
			this.loading = true;
			
			try {
				console.log('[关于页面] 开始加载应用信息');
				
				// 并行加载多个数据源以提高效率
				const loadPromises = [
					this.loadAppInfoFromSettings(),
					this.loadSupplementaryInfo()
				];
				
				// 使用Promise.allSettled确保即使部分失败也能继续
				const results = await Promise.allSettled(loadPromises);
				
				// 检查加载结果
				const settingsResult = results[0];
				const supplementaryResult = results[1];
				
				if (settingsResult.status === 'fulfilled') {
					console.log('[关于页面] 用户设置信息加载成功');
				} else {
					console.warn('[关于页面] 用户设置信息加载失败:', settingsResult.reason);
				}
				
				if (supplementaryResult.status === 'fulfilled') {
					console.log('[关于页面] 补充信息加载成功');
				} else {
					console.warn('[关于页面] 补充信息加载失败:', supplementaryResult.reason);
				}
				
				console.log('[关于页面] 应用信息加载完成');
				this.retryCount = 0;
				
			} catch (error) {
				console.error('[关于页面] 加载应用信息失败:', error);
				await this.handleLoadError(error);
			} finally {
				this.loading = false;
			}
		},
		
		// 从用户设置中加载应用信息
		async loadAppInfoFromSettings() {
			let retryCount = 0;
			const maxRetries = 3;
			
			while (retryCount < maxRetries) {
				try {
					const response = await this.apiWithRetry(() => getUserSettings());
					const settings = response.data || response;
					
					// 从设置中提取应用信息，添加数据验证
					if (settings.appVersion && typeof settings.appVersion === 'string') {
						this.appInfo.version = settings.appVersion;
					}
					
					if (settings.lastUpdateTime) {
						this.appInfo.updateTime = this.formatDate(settings.lastUpdateTime);
					}
					
					if (settings.appDescription && typeof settings.appDescription === 'string') {
						this.appInfo.description = settings.appDescription;
					}
					
					// 联系信息验证
					if (settings.contactEmail && this.isValidEmail(settings.contactEmail)) {
						this.contactInfo.email = settings.contactEmail;
					}
					
					if (settings.contactPhone && typeof settings.contactPhone === 'string') {
						this.contactInfo.phone = settings.contactPhone;
					}
					
					if (settings.workTime && typeof settings.workTime === 'string') {
						this.contactInfo.workTime = settings.workTime;
					}
					
					console.log('[关于页面] 从用户设置加载应用信息成功');
					return; // 成功则退出重试循环
					
				} catch (error) {
					retryCount++;
					console.warn(`[关于页面] 从用户设置加载应用信息失败 (第${retryCount}次):`, error);
					
					if (retryCount >= maxRetries) {
						console.warn('[关于页面] 用户设置API达到最大重试次数，使用默认值');
						return;
					}
					
					// 指数退避延迟
					await this.delay(1000 * Math.pow(2, retryCount - 1));
				}
			}
		},
		
		// 加载补充信息
		async loadSupplementaryInfo() {
			let retryCount = 0;
			const maxRetries = 3;
			
			while (retryCount < maxRetries) {
				try {
					const response = await this.apiWithRetry(() => getCurrentUser());
					const userData = response.data || response;
					
					// 从用户数据中提取补充信息，添加数据验证
					if (userData.companyName && typeof userData.companyName === 'string') {
						this.companyInfo.name = userData.companyName;
					}
					
					if (userData.companyAddress && typeof userData.companyAddress === 'string') {
						this.companyInfo.address = userData.companyAddress;
					}
					
					// 尝试从用户数据中获取更多应用信息作为备用
					if (!this.appInfo.version.startsWith('v') && userData.appVersion) {
						this.appInfo.version = userData.appVersion;
					}
					
					if (userData.systemDescription && !this.appInfo.description.includes('法律咨询')) {
						this.appInfo.description = userData.systemDescription;
					}
					
					// 备用联系信息
					if (!this.contactInfo.email.includes('@') && userData.supportEmail) {
						this.contactInfo.email = userData.supportEmail;
					}
					
					if (this.contactInfo.phone === '400-888-8888' && userData.supportPhone) {
						this.contactInfo.phone = userData.supportPhone;
					}
					
					console.log('[关于页面] 补充信息加载成功');
					return; // 成功则退出重试循环
					
				} catch (error) {
					retryCount++;
					console.warn(`[关于页面] 加载补充信息失败 (第${retryCount}次):`, error);
					
					if (retryCount >= maxRetries) {
						console.warn('[关于页面] 用户信息API达到最大重试次数，使用默认值');
						return;
					}
					
					// 指数退避延迟
					await this.delay(1000 * Math.pow(2, retryCount - 1));
				}
			}
		},
		
		// 格式化日期
		formatDate(dateString) {
			if (!dateString) {
				return '2025年12月1日'; // 默认值
			}
			
			try {
				const date = new Date(dateString);
				if (isNaN(date.getTime())) {
					console.warn('[关于页面] 无效日期格式:', dateString);
					return dateString;
				}
				
				const year = date.getFullYear();
				const month = date.getMonth() + 1;
				const day = date.getDate();
				
				return `${year}年${month}月${day}日`;
			} catch (error) {
				console.warn('[关于页面] 日期格式化失败:', error);
				return dateString || '2025年12月1日';
			}
		},
		
		// 处理加载错误
		async handleLoadError(error) {
			this.retryCount++;
			
			let errorMsg = '加载失败';
			if (error.code === 401) {
				errorMsg = '登录已过期，请重新登录';
			} else if (error.code === 403) {
				errorMsg = '权限不足，无法访问';
			} else if (error.code === 500) {
				errorMsg = '服务器错误，请稍后重试';
			} else if (error.message) {
				errorMsg = error.message;
			}
			
			if (this.retryCount < this.maxRetries) {
				// 指数退避自动重试
				const delay = 1000 * Math.pow(2, this.retryCount - 1);
				console.log(`[关于页面] 第${this.retryCount}次重试，延迟${delay}ms`);
				await this.delay(delay);
				await this.loadAboutInfo();
			} else {
				// 显示错误提示，但不影响页面基本功能
				console.warn(`[关于页面] ${errorMsg}，使用默认信息`);
			}
		},
		
		// API调用重试包装器
		async apiWithRetry(apiCall, maxRetries = 3) {
			let retryCount = 0;
			
			while (retryCount < maxRetries) {
				try {
					return await apiCall();
				} catch (error) {
					retryCount++;
					if (retryCount >= maxRetries) {
						throw error;
					}
					
					// 指数退避延迟
					const delay = 1000 * Math.pow(2, retryCount - 1);
					console.log(`[关于页面] API重试 ${retryCount}/${maxRetries}，延迟${delay}ms`);
					await this.delay(delay);
				}
			}
		},
		
		// 延迟函数
		delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},
		
		// 邮箱格式验证
		isValidEmail(email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(email);
		},

		// 返回上一页
		goBack() {
			uni.navigateBack({
				delta: 1
			});
		},

		// 打开用户协议
		openUserAgreement() {
			console.log('[关于页面] 打开用户协议');
			
			// 尝试打开内置协议页面
			const agreementUrl = '/pages/common/agreement/index?type=user';
			
			uni.navigateTo({
				url: agreementUrl,
				fail: () => {
					// 如果页面不存在，显示网页版协议
					this.openWebAgreement('user');
				}
			});
		},

		// 打开隐私协议
		openPrivacyPolicy() {
			console.log('[关于页面] 打开隐私协议');
			
			// 尝试打开内置协议页面
			const privacyUrl = '/pages/common/agreement/index?type=privacy';
			
			uni.navigateTo({
				url: privacyUrl,
				fail: () => {
					// 如果页面不存在，显示网页版协议
					this.openWebAgreement('privacy');
				}
			});
		},
		
		// 打开网页版协议
		openWebAgreement(type) {
			const urls = {
				user: 'https://www.huaguang.com/agreement/user.html',
				privacy: 'https://www.huaguang.com/agreement/privacy.html'
			};
			
			const url = urls[type];
			if (!url) {
				uni.showToast({
					title: '协议链接配置错误',
					icon: 'none'
				});
				return;
			}
			
			// 使用webview打开协议页面
			uni.navigateTo({
				url: `/pages/common/webview/index?url=${encodeURIComponent(url)}&title=${type === 'user' ? '用户协议' : '隐私协议'}`,
				fail: () => {
					// 如果webview页面也不存在，复制链接到剪贴板
					uni.setClipboardData({
						data: url,
						success: () => {
							uni.showToast({
								title: '协议链接已复制到剪贴板',
								icon: 'success'
							});
						},
						fail: () => {
							uni.showToast({
								title: '协议功能暂时不可用',
								icon: 'none'
							});
						}
					});
				}
			});
		},
		
		// 复制联系方式
		copyContact(type) {
			let text = '';
			let label = '';
			
			if (type === 'email') {
				text = this.contactInfo.email;
				label = '邮箱';
			} else if (type === 'phone') {
				text = this.contactInfo.phone;
				label = '电话';
			}
			
			if (!text) {
				uni.showToast({
					title: `${label}信息不可用`,
					icon: 'none'
				});
				return;
			}
			
			// 数据验证
			if (type === 'email' && !this.isValidEmail(text)) {
				uni.showToast({
					title: '邮箱格式无效',
					icon: 'none'
				});
				return;
			}
			
			uni.setClipboardData({
				data: text,
				success: () => {
					uni.showToast({
						title: `${label}已复制`,
						icon: 'success'
					});
					console.log(`[关于页面] ${label}复制成功:`, text);
				},
				fail: (error) => {
					console.error(`[关于页面] ${label}复制失败:`, error);
					uni.showToast({
						title: '复制失败，请重试',
						icon: 'none'
					});
				}
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.about-page {
	width: 100%;
	height: 100vh;
	background-repeat: no-repeat;
	background-position: center center;
	background-size: cover;
}

.status-bar {
	width: 100%;
	background: transparent;
}

.nav-bar {
	width: 100%;
	height: 44px;
	display: flex;
	align-items: center;
	padding: 0 15px;
	box-sizing: border-box;
}

.back-button {
	display: flex;
	align-items: center;
	padding: 5px 10px;
	border-radius: 8px;
	transition: all 0.3s ease;
}

.back-button-hover {
	background-color: rgba(0, 122, 255, 0.1);
}

.back-icon {
	font-size: 24px;
	color: #007AFF;
	margin-right: 2px;
	font-weight: bold;
}

.back-text {
	font-size: 17px;
	color: #007AFF;
}

.scroll-container {
	width: 100%;
	padding: 52rpx 5% 12rpx 5%;
	box-sizing: border-box;
}

/* 平台描述卡片 */
.description-card {
	background: #FFFFFF;
	border-radius: 10px;
	padding: 12px 15px;
	margin-bottom: 15px;
}

.description-text {
	font-size: 14px;
	color: #333333;
	line-height: 1.5;
}

/* 版本信息与协议卡片 */
.info-card {
	background: #FFFFFF;
	border-radius: 10px;
	padding: 0 15px;
	margin-bottom: 15px;
}

.info-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15px 0;
	position: relative;
}

.info-item.clickable {
	transition: all 0.3s ease;
}

.info-item-hover {
	background-color: #F8F8F8;
	margin: 0 -15px;
	padding-left: 15px;
	padding-right: 15px;
	border-radius: 8px;
}

.info-text {
	font-size: 15px;
	color: #333333;
}

.arrow-icon {
	font-size: 18px;
	color: #CCCCCC;
	font-weight: bold;
}

.divider {
	height: 1px;
	background-color: #EEEEEE;
	margin: 0;
}

/* 联系我们卡片 */
.contact-card {
	background: #FFFFFF;
	border-radius: 10px;
	padding: 15px;
	margin-bottom: 15px;
}

.card-title {
	display: block;
	font-size: 16px;
	color: #333333;
	margin-bottom: 8px;
}

.contact-item {
	margin-bottom: 8px;
	padding: 8px;
	border-radius: 6px;
	transition: all 0.3s ease;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.contact-item:last-child {
	margin-bottom: 0;
}

.contact-item-hover {
	background-color: #F0F8FF;
}

.contact-text {
	font-size: 14px;
	color: #555555;
	line-height: 1.4;
	flex: 1;
}

.copy-hint {
	font-size: 12px;
	color: #007AFF;
	opacity: 0.7;
}

/* 公司信息卡片 */
.company-card {
	background: #FFFFFF;
	border-radius: 10px;
	padding: 15px;
	margin-bottom: 25px;
}

.company-item {
	margin-bottom: 8px;
}

.company-item:last-child {
	margin-bottom: 0;
}

.company-text {
	font-size: 14px;
	color: #555555;
	line-height: 1.4;
}

/* 页脚版权信息 */
.footer {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 25px 0;
}

.copyright-text {
	font-size: 12px;
	color: #888888;
	text-align: center;
}

/* 加载状态 */
.loading-container {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20px;
	margin-top: 20px;
}

.loading-text {
	font-size: 14px;
	color: #666666;
}
</style>