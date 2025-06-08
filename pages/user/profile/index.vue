<template>
	<view class="my-profile-page">
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
					<uv-avatar 
						:src="userInfo.avatar" 
						size="120" 
						shape="circle"
						:text="userInfo.nickname ? userInfo.nickname.charAt(0) : '用'"
						bg-color="#D8D8D8"
					></uv-avatar>
					<view class="user-details">
						<text class="nickname">{{ userInfo.nickname || '昵称' }}</text>
						<text class="member-id">会员ID: {{ userInfo.memberId || '9842108' }}</text>
					</view>
				</view>
				
				<!-- 快捷功能区域 -->
				<view class="quick-actions">
					<view 
						class="action-item" 
						v-for="(item, index) in quickActions" 
						:key="index"
						@click="handleQuickAction(item.type)"
						hover-class="action-item-hover"
					>
						<view class="action-icon">
							<uv-image :src="`${config.staticBaseUrl}/icons/${item.icon}.png`" width="50rpx" height="50rpx" mode="aspectFit"></uv-image>
						</view>
						<text class="action-text">{{ item.text }}</text>
					</view>
				</view>
			</view>
			
							<!-- 设置卡片 -->
			<view class="settings-card">
				<text class="card-title">设置</text>
				<view class="settings-list">
					<view 
						class="list-item" 
						v-for="(item, index) in settingsItems" 
						:key="index"
						@click="handleSettingsClick(item.type)"
						hover-class="list-item-hover"
					>
						<view class="item-left">
							<uv-image :src="`${config.staticBaseUrl}/icons/${item.icon}.png`" width="32rpx" height="32rpx"  mode="aspectFit"></uv-image>
							<text class="item-text">{{ item.text }}</text>
						</view>
						<text class="arrow-icon">></text>
					</view>
				</view>
			</view>
			
			<!-- 分销推广卡片 -->
			<view class="promotion-card">
				<text class="card-title">分销推广</text>
				<view class="promotion-list">
					<view 
						class="list-item" 
						v-for="(item, index) in promotionItems" 
						:key="index"
						@click="handlePromotionClick(item.type)"
						hover-class="list-item-hover"
					>
						<view class="item-left">
							<uv-image :src="`${config.staticBaseUrl}/icons/${item.icon}.png`" width="32rpx" height="32rpx"  mode="aspectFit"></uv-image>
							<text class="item-text">{{ item.text }}</text>
						</view>
						<text class="arrow-icon">></text>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部导航栏 -->
		<user-tabbar></user-tabbar>
	</view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import { personalCenterApi } from '@/api/index.js'
import config from '@/config/index.js'

export default {
	components: {
		UserTabbar
	},
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			loading: false,
			config: config,
			userInfo: {
				avatar: '',
				nickname: '昵称',
				memberId: '9842108'
			},
			quickActions: [
				{
					type: 'help',
					icon: 'huifu',
					text: '我的帮扶'
				},
				{
					type: 'video',
					icon: 'shoucangshipin',
					text: '我的收藏视频'
				},
				{
					type: 'job',
					icon: 'qiuzhi',
					text: '我的求职'
				}
			],
			settingsItems: [
				{
					type: 'security',
					icon: 'zhanghao',
					text: '账号与安全'
				},
				{
					type: 'profile',
					icon: 'xinxixiugai',
					text: '用户信息修改'
				},
				{
					type: 'cache',
					icon: 'qingkong',
					text: '清空缓存'
				},
				{
					type: 'about',
					icon: 'guanyu',
					text: '关于'
				}
			],
			promotionItems: [
				{
					type: 'team',
					icon: 'wodeteam',
					text: '我的团队'
				},
				{
					type: 'poster',
					icon: 'haibao',
					text: '分享海报'
				},
				{
					type: 'commission',
					icon: 'yongjin',
					text: '我的佣金'
				}
			]
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
			// 减去底部导航栏高度（约100rpx，转换为px约50px）
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 50;
		},
		
		// 加载用户信息
		async loadUserInfo() {
			if (this.loading) return;
			
			this.loading = true;
			uni.showLoading({
				title: '加载中...'
			});
			
			try {
				const response = await personalCenterApi.getUserCenterPage();
				
				// 检查响应数据
				if (response) {
					// 将API返回的数据映射到userInfo
					this.userInfo = {
						avatar: response.userBasicInfo.avatar || '',
						nickname: response.userBasicInfo.nickname || '昵称',
						memberId: response.userBasicInfo.memberId || '9842108'
					};
					
					console.log('用户信息加载成功:', this.userInfo);
				} else {
					console.warn('API返回数据格式异常:', response);
					// 保持默认值不变
				}
			} catch (error) {
				console.error('获取用户信息失败:', error);
				uni.showToast({
					title: '获取用户信息失败',
					icon: 'none',
					duration: 2000
				});
				// 发生错误时保持默认值
			} finally {
				this.loading = false;
				uni.hideLoading();
			}
		},
		
		// 处理快捷功能点击
		handleQuickAction(type) {
			console.log('快捷功能点击:', type);
			// 根据type进行相应的跳转或操作
			switch(type) {
				case 'help':
					uni.navigateTo({ url: '/pages/user/profile/assistance/index' });
					break;
				case 'video':
					uni.navigateTo({ url: '/pages/user/profile/video-collection/index' });
					break;
				case 'job':
					uni.navigateTo({ url: '/pages/user/profile/job-hunting/index' });
					break;
			}
		},
		
		// 处理设置项点击
		handleSettingsClick(type) {
			console.log('设置项点击:', type);
			// 根据type进行相应的跳转或操作
			switch(type) {
				case 'security':
					uni.navigateTo({ url: '/pages/user/profile/security/index' });
					break;
				case 'profile':
					uni.navigateTo({ url: '/pages/user/profile/edit/index' });
					break;
				case 'cache':
					uni.navigateTo({ url: '/pages/user/profile/clear-cache/index' });
					break;
				case 'about':
					uni.navigateTo({ url: '/pages/user/profile/about/index' });
					break;
			}
		},
		
		// 处理分销推广点击
		handlePromotionClick(type) {
			console.log('分销推广点击:', type);
			// 根据type进行相应的跳转或操作
			switch(type) {
				case 'team':
					uni.navigateTo({ url: '/pages/user/profile/invitation/index' });
					break;
				case 'poster':
					uni.navigateTo({ url: '/pages/user/profile/invitation-poster/index' });
					break;
				case 'commission':
					// 显示加载提示
					uni.showLoading({
						title: '加载中...'
					});
					
					// 跳转到我的佣金页面
					uni.navigateTo({
						url: '/pages/user/profile/promotion-commission/index',
						success: () => {
							uni.hideLoading();
						},
						fail: (err) => {
							uni.hideLoading();
							console.error('跳转失败:', err);
							uni.showToast({
								title: '页面跳转失败',
								icon: 'none'
							});
						}
					});
					break;
			}
		},
		
		// 清空缓存
		clearCache() {
			uni.showModal({
				title: '提示',
				content: '确定要清空缓存吗？',
				success: (res) => {
					if (res.confirm) {
						// 执行清空缓存操作
						uni.showToast({
							title: '缓存已清空',
							icon: 'success'
						});
					}
				}
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.my-profile-page {
	width: 100%;
	height: 100vh;
	background: linear-gradient(180deg, #EBF4FF 0%, #F5F9FF 100%);
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

/* 用户信息卡片 */
.user-info-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-top: 20rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.user-header {
	display: flex;
	align-items: center;
	margin-bottom: 40rpx;
}

.user-details {
	margin-left: 20rpx;
	flex: 1;
}

.nickname {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 10rpx;
}

.member-id {
	display: block;
	font-size: 28rpx;
	color: #666666;
}

/* 快捷功能区域 */
.quick-actions {
	display: flex;
	justify-content: space-between;
}

.action-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 10rpx;
	border-radius: 12rpx;
	transition: all 0.3s ease;
}

.action-item-hover {
	background-color: #F5F5F5;
}

.action-icon {
	margin-bottom: 12rpx;
}

.action-icon .iconfont {
	font-size: 48rpx;
}

.action-text {
	font-size: 24rpx;
	color: #333333;
	text-align: center;
}

/* 卡片通用样式 */
.settings-card,
.promotion-card {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.card-title {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 30rpx;
}

/* 列表项样式 */
.settings-list,
.promotion-list {
	width: 100%;
}

.list-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #F0F0F0;
	transition: all 0.3s ease;
}

.list-item:last-child {
	border-bottom: none;
}

.list-item-hover {
	background-color: #F8F8F8;
	margin: 0 -30rpx;
	padding-left: 30rpx;
	padding-right: 30rpx;
	border-radius: 12rpx;
}

.item-left {
	display: flex;
	align-items: center;
	flex: 1;
}

.item-icon {
	font-size: 36rpx;
	color: #888888;
	margin-right: 20rpx;
}

.item-text {
	font-size: 30rpx;
	color: #333333;
	margin-left: 30rpx;
}

.arrow-icon {
	font-size: 28rpx;
	color: #CCCCCC;
}

/* 图标字体样式 */
.iconfont {
	font-family: 'iconfont';
}

/* 如果没有iconfont，可以使用以下备用样式 */
.icon-bangfu::before { content: '🤝'; }
.icon-shipin::before { content: '📹'; }
.icon-gongzuo::before { content: '💼'; }
.icon-anquan::before { content: '🛡️'; }
.icon-yonghu::before { content: '👤'; }
.icon-qingchu::before { content: '🗑️'; }
.icon-guanyu::before { content: 'ℹ️'; }
.icon-tuandui::before { content: '👥'; }
.icon-haibao::before { content: '🖼️'; }
.icon-yongjin::before { content: '💰'; }
</style> 