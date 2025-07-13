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
							<text class="practice-number">执业编号: {{ profileInfo.licenseNumber || 'PSY' + profileInfo.id || '未设置' }}</text>
							<text v-if="profileInfo.specialties && profileInfo.specialties.length > 0" class="specialties">{{ profileInfo.specialties.join(' • ') }}</text>
						</view>
					</view>
				</view>
				
				<!-- 服务状态卡片 -->
				<view class="service-status-card" @click="handleStatusClick">
					<view class="status-content">
						<text class="status-label">我的服务状态:</text>
						<view class="status-bottom">
							<view class="status-indicator">
								<view :class="['status-dot', profileInfo.isOnline ? 'online' : 'offline']"></view>
								<text class="status-text">{{ profileInfo.isOnline ? '在线' : '离线' }}</text>
							</view>
							<text class="arrow-icon">></text>
						</view>
					</view>
				</view>
				
				<!-- 服务统计卡片 -->
				<view class="service-stats-card" @click="handleServiceStatsClick">
					<text class="stats-line">我的服务单数: 累计咨询{{ profileInfo.consultationCount || 0 }}次</text>
					<text class="stats-line">文字咨询: ¥{{ profileInfo.textFee || '0.00' }}/次</text>
					<text class="stats-line">语音咨询: ¥{{ profileInfo.voiceFee || '0.00' }}/次</text>
					<text class="stats-line">视频咨询: ¥{{ profileInfo.videoFee || '0.00' }}/次</text>
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
				isOnline: false,
				experienceYears: 0,
				introduction: '',
				consultationCount: 0,
				textFee: 0,
				voiceFee: 0,
				videoFee: 0,
				certificates: [],
				serviceAdvantages: '',
				slogan: ''
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
		// 页面显示时重新加载数据
		this.loadProfileData()
	},
	
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 0
			// 减去底部导航栏高度
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 80
		},
		

		
		// 加载心理师资料数据
		async loadProfileData() {
			if (this.loading) return
			
			this.loading = true
			this.error = null
			
			try {
				console.log('[心理师个人资料] 开始加载资料数据...')
				
				const response = await getPsychologistProfile()
				
				if (response && response.data) {
					const data = response.data
					console.log('[心理师个人资料] 数据获取成功:', data)
					
					// 直接映射API响应数据
					this.profileInfo = {
						id: data.id || '',
						name: data.name || '心理师',
						avatar: data.avatar || '',
						licenseNumber: data.licenseNumber || '',
						specialties: data.specialties || [],
						isOnline: data.isOnline || false,
						experienceYears: data.experienceYears || 0,
						introduction: data.introduction || '',
						consultationCount: data.consultationCount || 0,
						textFee: data.textFee || 0,
						voiceFee: data.voiceFee || 0,
						videoFee: data.videoFee || 0,
						certificates: data.certificates || [],
						serviceAdvantages: data.serviceAdvantages || '',
						slogan: data.slogan || ''
					}
					
					this.hasData = true
					console.log('[心理师个人资料] 数据加载完成:', this.profileInfo)
				}
				
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
		},
		
		// 下拉刷新
		onRefresh() {
			this.refreshing = true
			this.loadProfileData()
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