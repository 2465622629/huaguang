<template>
	<view class="lawyer-profile-page" :style="backgroundStyle">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 滚动容器 -->
		<scroll-view 
			class="scroll-container" 
			scroll-y 
			:style="{ height: scrollHeight + 'px' }"
			enable-flex
		>
			<!-- 用户信息卡片 -->
			<view class="user-info-card">
				<view class="user-header">
					<view class="avatar-placeholder"></view>
					<view class="user-details">
						<text class="user-name">李律师</text>
						<text class="practice-number">执业编号: 9842108</text>
					</view>
				</view>
			</view>
			
			<!-- 服务状态卡片 -->
			<view class="service-status-card" @click="handleServiceStatusClick">
				<view class="status-content">
					<text class="status-label">我的服务状态:</text>
					<view class="status-bottom">
						<view class="status-indicator">
							<view class="online-dot"></view>
							<text class="status-text">在线</text>
						</view>
						<text class="arrow-icon">></text>
					</view>
				</view>
			</view>
			
			<!-- 服务统计卡片 -->
			<view class="service-stats-card" @click="handleIncomeClick">
				<text class="stats-line">我的服务单数: 累计咨询23次</text>
				<text class="stats-line">今日收入: ¥128.00</text>
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
							<uv-icon :name="`${staticBaseUrl}/icons/${item.icon}.png`" size="40" color="#888888"></uv-icon>
							<text class="item-text">{{ item.text }}</text>
						</view>
						<text class="arrow-icon">></text>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部导航栏 -->
		<lawyer-tabbar></lawyer-tabbar>
	</view>
</template>

<script>
import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'

export default {
	components: {
		LawyerTabbar
	},
	data() {
		return {
			staticBaseUrl,
			statusBarHeight: 0,
			scrollHeight: 0,
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
		this.initPage();
	},
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			// 减去底部导航栏高度（uv-tabbar会自动处理）
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 80;
		},
		
		// 处理设置项点击
		handleSettingClick(type) {
			console.log('设置项点击:', type);
			switch(type) {
				case 'password':
					// 跳转到修改密码页面
					uni.navigateTo({
						url: '/pages/lawyer/index/change-password/index'
					});
					break;
				case 'userinfo':
					// 跳转到修改用户信息页面
					uni.navigateTo({
						url: '/pages/user/profile/edit/index'
					});
					break;
				case 'notification':
					// 跳转到消息通知设置页面
					uni.navigateTo({
						url: '/pages/lawyer/index/notification-settings/index'
					});
					break;
			}
		},
		
		// 处理服务状态点击
		handleServiceStatusClick() {
			console.log('服务状态点击');
			// 跳转到在线状态设置页面
			uni.navigateTo({
				url: '/pages/lawyer/index/online-status/index'
			});
		},
		
		// 处理收入统计卡片点击
		handleIncomeClick() {
			console.log('收入统计卡片点击');
			// 跳转到收入管理页面
			uni.navigateTo({
				url: '/pages/lawyer/index/income-management/index'
			});
		}
	},
	computed: {
		backgroundStyle() {
			return {
				backgroundImage: `url('${staticBaseUrl}/bg10.png')`
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.lawyer-profile-page {
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

.avatar-placeholder {
	width: 120rpx;
	height: 120rpx;
	background-color: #D9D9D9;
	border-radius: 50%;
	margin-right: 30rpx;
}

.user-details {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.user-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #333333;
	margin-bottom: 10rpx;
}

.practice-number {
	font-size: 26rpx;
	color: #888888;
}

/* 服务状态卡片 */
.status-content {
	display: flex;
	flex-direction: column;
}

.status-label {
	font-size: 30rpx;
	color: #333333;
	margin-bottom: 16rpx;
}

.status-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.status-indicator {
	display: flex;
	align-items: center;
}

.online-dot {
	width: 20rpx;
	height: 20rpx;
	background-color: #52C41A;
	border-radius: 50%;
	margin-right: 10rpx;
}

.status-text {
	font-size: 30rpx;
	color: #52C41A;
}

.arrow-icon {
	font-size: 32rpx;
	color: #CCCCCC;
}

/* 服务统计卡片 */
.stats-line {
	display: block;
	font-size: 30rpx;
	color: #333333;
	margin-bottom: 16rpx;
	
	&:last-child {
		margin-bottom: 0;
	}
}

/* 设置卡片 */
.card-title {
	font-size: 36rpx;
	font-weight: 600;
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
	padding: 24rpx 0;
	
	&:not(:last-child) {
		border-bottom: 1rpx solid #F0F0F0;
	}
}

.setting-item-hover {
	background-color: rgba(0, 0, 0, 0.05);
	border-radius: 12rpx;
}

.item-left {
	display: flex;
	align-items: center;
}

.item-text {
	font-size: 30rpx;
	color: #333333;
	margin-left: 20rpx;
}
</style> 