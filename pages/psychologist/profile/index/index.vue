<template>
	<view class="psychologist-profile-page" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg11.png)' }">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 滚动容器 -->
		<scroll-view 
			class="scroll-container" 
			scroll-y 
			:style="{ height: scrollHeight + 'px' }"
			enable-flex
			refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 加载状态 -->
			<view v-if="loading && !hasData" class="loading-container">
				<uv-loading-icon mode="flower" size="60"></uv-loading-icon>
				<text class="loading-text">正在加载个人信息...</text>
			</view>
			
			<!-- 错误状态 -->
			<view v-else-if="error && !hasData" class="error-container">
				<uv-icon name="wifi-off" size="120" color="#cccccc"></uv-icon>
				<text class="error-text">{{ error }}</text>
				<uv-button text="重试" type="primary" size="small" @click="loadProfileData" class="retry-button" />
			</view>
			
			<!-- 正常内容 -->
			<view v-else>
				<!-- 用户信息卡片 -->
				<view class="user-info-card">
					<view class="user-header">
						<view class="avatar-container">
							<image 
								v-if="profileInfo.avatar" 
								:src="profileInfo.avatar" 
								class="user-avatar" 
								mode="aspectFill"
								@error="onAvatarError"
							></image>
							<view v-else class="avatar-placeholder">
								<uv-icon name="account" size="60" color="#CCCCCC"></uv-icon>
							</view>
						</view>
						<view class="user-details">
							<text class="user-name">{{ profileInfo.name || '未设置姓名' }}</text>
							<text class="practice-number">执业编号: {{ profileInfo.licenseNumber || 'L' + profileInfo.id || '9842108' }}</text>
							<text v-if="profileInfo.specialties" class="specialties">{{ profileInfo.specialties.join(' • ') }}</text>
						</view>
					</view>
				</view>
				
				<!-- 服务状态卡片 -->
				<view class="service-status-card" @click="handleStatusClick">
					<view class="status-content">
						<text class="status-label">我的服务状态:</text>
						<view class="status-bottom">
							<view class="status-indicator">
								<view :class="['status-dot', profileInfo.onlineStatus || 'offline']"></view>
								<text class="status-text">{{ getStatusText(profileInfo.onlineStatus) }}</text>
							</view>
							<text class="arrow-icon">></text>
						</view>
					</view>
				</view>
				
				<!-- 服务统计卡片 -->
				<view class="service-stats-card" @click="handleServiceStatsClick">
					<text class="stats-line">我的服务单数: 累计咨询{{ statistics.totalConsultations || 0 }}次</text>
					<text class="stats-line">今日收入: ¥{{ statistics.todayIncome || '0.00' }}</text>
					<text class="stats-line">本月收入: ¥{{ statistics.monthlyIncome || '0.00' }}</text>
				</view>
				
				<!-- 设置卡片 -->
				<view class="settings-card">
					<text class="card-title">设置</text>
					<view class="settings-list">
						<view 
							class="setting-item" 
							v-for="(item, index) in settingsItems" 
							:key="index"
							@click="handleSettingClick(item.type)"
							hover-class="setting-item-hover"
						>
							<view class="item-left">
								<uv-icon :name="config.staticBaseUrl + '/icons/' + item.icon + '.png'" size="40" color="#888888"></uv-icon>
								<text class="item-text">{{ item.text }}</text>
							</view>
							<text class="arrow-icon">></text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部导航栏 -->
		<psychologist-tabbar></psychologist-tabbar>
	</view>
</template>

<script>
import PsychologistTabbar from '@/components/tabbar/psychologist-tabbar/psychologist-tabbar.vue'
import { getPsychologistProfile } from '@/api/modules/psychologist.js'
import { getCurrentUser } from '@/api/modules/user.js'
import config from '@/config/index.js'

export default {
	components: {
		PsychologistTabbar
	},
	data() {
		return {
			config,
			statusBarHeight: 0,
			scrollHeight: 0,
			loading: false,
			refreshing: false,
			error: null,
			hasData: false,
			
			// 心理师资料信息
			profileInfo: {
				id: '',
				name: '',
				avatar: '',
				licenseNumber: '',
				specialties: [],
				onlineStatus: 'offline',
				rating: 0,
				experienceYears: 0,
				bio: '',
				phone: '',
				email: ''
			},
			
			// 统计信息
			statistics: {
				totalConsultations: 0,
				todayIncome: '0.00',
				monthlyIncome: '0.00',
				thisWeekConsultations: 0,
				averageRating: 0
			},
			
			// 缓存管理
			cacheKey: 'psychologist_profile_cache',
			cacheExpiry: 10 * 60 * 1000, // 10分钟缓存
			lastLoadTime: 0,
			
			// 重试配置
			retryConfig: {
				maxRetries: 3,
				baseDelay: 1000,
				maxDelay: 8000
			},
			
			settingsItems: [
				{
					type: 'password',
					icon: 'anquan',
					text: '修改密码'
				},
				{
					type: 'userinfo',
					icon: 'user',
					text: '修改用户信息'
				},
				{
					type: 'notification',
					icon: 'delete',
					text: '消息通知设置'
				}
			]
		}
	},
	
	onLoad() {
		this.initPage()
		this.loadProfileData()
	},
	
	onShow() {
		// 检查数据是否需要刷新
		const now = Date.now()
		if (now - this.lastLoadTime > this.cacheExpiry) {
			this.loadProfileData()
		}
	},
	
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 0
			// 减去底部导航栏高度
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 80
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
					
					console.log(`[心理师个人资料] API调用失败，${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试:`, error.message)
					
					await new Promise(resolve => setTimeout(resolve, delay))
					return this.executeWithRetry(apiCall, retryCount + 1)
				}
				throw error
			}
		},
		
		// 加载缓存数据
		loadCachedData() {
			try {
				const cached = uni.getStorageSync(this.cacheKey)
				if (cached && cached.timestamp) {
					const isExpired = Date.now() - cached.timestamp > this.cacheExpiry
					if (!isExpired) {
						return cached.data
					}
				}
			} catch (error) {
				console.error('[心理师个人资料] 加载缓存失败:', error)
			}
			return null
		},
		
		// 保存缓存数据
		saveCachedData(data) {
			try {
				uni.setStorageSync(this.cacheKey, {
					data,
					timestamp: Date.now()
				})
			} catch (error) {
				console.error('[心理师个人资料] 保存缓存失败:', error)
			}
		},
		
		// 加载心理师资料数据 - 企业级API集成
		async loadProfileData() {
			if (this.loading) return
			
			this.loading = true
			this.error = null
			
			try {
				console.log('[心理师个人资料] 开始加载资料数据...')
				
				// 先尝试从缓存加载
				const cachedData = this.loadCachedData()
				if (cachedData && !this.refreshing) {
					console.log('[心理师个人资料] 使用缓存数据')
					this.profileInfo = { ...this.profileInfo, ...cachedData.profile }
					this.statistics = { ...this.statistics, ...cachedData.statistics }
					this.hasData = true
				}
				
				// 并行加载心理师资料和统计数据
				const [profileResult, userResult] = await Promise.allSettled([
					this.executeWithRetry(() => getPsychologistProfile()),
					this.executeWithRetry(() => getCurrentUser())
				])
				
				// 处理心理师资料数据
				if (profileResult.status === 'fulfilled' && profileResult.value?.data) {
					const profileData = profileResult.value.data
					console.log('[心理师个人资料] 心理师资料数据获取成功:', profileData)
					
					this.profileInfo = {
						id: profileData.id || '',
						name: profileData.name || profileData.fullName || '',
						avatar: profileData.avatar || profileData.avatarUrl || '',
						licenseNumber: profileData.licenseNumber || profileData.practiceNumber || '',
						specialties: profileData.specialties || profileData.expertise || [],
						onlineStatus: profileData.onlineStatus || profileData.status || 'offline',
						rating: profileData.rating || 0,
						experienceYears: profileData.experienceYears || 0,
						bio: profileData.bio || profileData.introduction || '',
						phone: profileData.phone || '',
						email: profileData.email || ''
					}
					
					// 处理统计数据
					if (profileData.statistics) {
						this.statistics = {
							totalConsultations: profileData.statistics.totalConsultations || 0,
							todayIncome: (profileData.statistics.todayIncome || 0).toFixed(2),
							monthlyIncome: (profileData.statistics.monthlyIncome || 0).toFixed(2),
							thisWeekConsultations: profileData.statistics.thisWeekConsultations || 0,
							averageRating: profileData.statistics.averageRating || 0
						}
					}
				}
				
				// 处理用户基础数据作为补充
				if (userResult.status === 'fulfilled' && userResult.value?.data) {
					const userData = userResult.value.data
					console.log('[心理师个人资料] 用户数据获取成功:', userData)
					
					// 补充缺失的基础信息
					if (!this.profileInfo.name) {
						this.profileInfo.name = userData.nickname || userData.name || ''
					}
					if (!this.profileInfo.avatar) {
						this.profileInfo.avatar = userData.avatar || userData.avatarUrl || ''
					}
					if (!this.profileInfo.phone) {
						this.profileInfo.phone = userData.phone || ''
					}
					if (!this.profileInfo.email) {
						this.profileInfo.email = userData.email || ''
					}
				}
				
				this.hasData = true
				this.lastLoadTime = Date.now()
				
				// 缓存数据
				this.saveCachedData({
					profile: this.profileInfo,
					statistics: this.statistics
				})
				
				console.log('[心理师个人资料] 数据加载完成:', {
					profile: this.profileInfo,
					statistics: this.statistics
				})
				
			} catch (error) {
				console.error('[心理师个人资料] 加载资料数据失败:', error)
				this.handleLoadError(error)
			} finally {
				this.loading = false
				this.refreshing = false
			}
		},
		
		// 处理加载错误
		handleLoadError(error) {
			let errorMessage = '加载失败，请重试'
			
			if (error && error.response) {
				const { status } = error.response
				switch (status) {
					case 401:
						errorMessage = '登录已过期，请重新登录'
						break
					case 403:
						errorMessage = '权限不足，无法访问'
						break
					case 404:
						errorMessage = '资料信息不存在'
						break
					case 500:
						errorMessage = '服务器错误，请稍后重试'
						break
					default:
						errorMessage = `网络错误 (${status})`
				}
			} else if (error && error.message) {
				if (error.message.includes('timeout')) {
					errorMessage = '请求超时，请检查网络连接'
				} else if (error.message.includes('Network')) {
					errorMessage = '网络连接失败'
				}
			}
			
			this.error = errorMessage
			
			// 如果没有缓存数据，设置默认值
			if (!this.hasData) {
				this.setDefaultData()
			}
		},
		
		// 设置默认数据
		setDefaultData() {
			this.profileInfo = {
				id: '',
				name: '心理师',
				avatar: '',
				licenseNumber: 'P9842108',
				specialties: ['心理咨询'],
				onlineStatus: 'offline',
				rating: 0,
				experienceYears: 0,
				bio: '',
				phone: '',
				email: ''
			}
			this.statistics = {
				totalConsultations: 0,
				todayIncome: '0.00',
				monthlyIncome: '0.00',
				thisWeekConsultations: 0,
				averageRating: 0
			}
			this.hasData = true
		},
		
		// 下拉刷新
		onRefresh() {
			this.refreshing = true
			this.loadProfileData()
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				'online': '在线',
				'busy': '忙碌',
				'away': '离开',
				'offline': '离线'
			}
			return statusMap[status] || '离线'
		},
		
		// 头像加载错误处理
		onAvatarError() {
			console.warn('[心理师个人资料] 头像加载失败')
			this.profileInfo.avatar = ''
		},
		
		// 处理状态点击
		handleStatusClick() {
			uni.navigateTo({
				url: '/pages/psychologist/profile/online-status/index'
			})
		},
		
		// 处理设置项点击
		handleSettingClick(type) {
			console.log('[心理师个人资料] 设置项点击:', type)
			switch(type) {
				case 'password':
					uni.navigateTo({
						url: '/pages/psychologist/profile/changepwd/index'
					})
					break
				case 'userinfo':
					uni.navigateTo({
						url: '/pages/psychologist/profile/psychology-info-settings/index'
					})
					break
				case 'notification':
					uni.navigateTo({
						url: '/pages/psychologist/profile/notification-settings/index'
					})
					break
			}
		},
		
		// 处理服务统计点击
		handleServiceStatsClick() {
			uni.navigateTo({
				url: '/pages/psychologist/profile/income-management/index'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.psychologist-profile-page {
	width: 100%;
	height: 100vh;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	position: relative;
}

.status-bar {
	width: 100%;
	background: transparent;
}

.scroll-container {
	width: 100%;
	padding: 0 30rpx;
	box-sizing: border-box;
}

// 加载和错误状态
.loading-container, .error-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 40rpx;
	
	.loading-text, .error-text {
		font-size: 28rpx;
		color: #666666;
		margin-top: 40rpx;
		text-align: center;
	}
	
	.retry-button {
		margin-top: 40rpx;
	}
}

.user-info-card{
	margin-top: 120rpx;
}

/* 卡片通用样式 */
.user-info-card,
.service-status-card,
.service-stats-card,
.settings-card {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-radius: 24rpx;
	margin-bottom: 20rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

/* 用户信息卡片 */
.user-header {
	display: flex;
	align-items: center;
}

.avatar-container {
	margin-right: 30rpx;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
}

.avatar-placeholder {
	width: 120rpx;
	height: 120rpx;
	background-color: #F0F0F0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.user-details {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.user-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
}

.practice-number {
	font-size: 28rpx;
	color: #666666;
	margin-bottom: 8rpx;
}

.specialties {
	font-size: 24rpx;
	color: #999999;
}

/* 服务状态卡片 */
.status-content {
	display: flex;
	flex-direction: column;
}

.status-label {
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 20rpx;
}

.status-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.status-indicator {
	display: flex;
	align-items: center;
}

.status-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	margin-right: 12rpx;
	
	&.online {
		background-color: #52C41A;
	}
	
	&.busy {
		background-color: #FA8C16;
	}
	
	&.away {
		background-color: #FADB14;
	}
	
	&.offline {
		background-color: #D9D9D9;
	}
}

.status-text {
	font-size: 28rpx;
	color: #333333;
}

/* 服务统计卡片 */
.service-stats-card {
	cursor: pointer;
}

.stats-line {
	display: block;
	font-size: 28rpx;
	color: #333333;
	margin-bottom: 16rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

/* 设置卡片 */
.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 30rpx;
	display: block;
}

.settings-list {
	display: flex;
	flex-direction: column;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #F0F0F0;
	cursor: pointer;
	
	&:last-child {
		border-bottom: none;
	}
	
	&.setting-item-hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
}

.item-left {
	display: flex;
	align-items: center;
}

.item-text {
	font-size: 28rpx;
	color: #333333;
	margin-left: 20rpx;
}

.arrow-icon {
	font-size: 32rpx;
	color: #CCCCCC;
}
</style> 