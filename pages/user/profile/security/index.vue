<template>
	<view class="security-page" :style="{ background: `url('${config.staticBaseUrl}/bg10.png') no-repeat center center / cover` }">
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
						<text class="item-value">135****8666</text>
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

export default {
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			config: config,
			phoneNumber: '135****8666',
			passwordStatus: '已设置'
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
			// 计算滚动区域高度：屏幕高度 - 状态栏 - 导航栏
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 60;
		},
		
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 处理手机号点击
		handlePhoneClick() {
			// 跳转到手机号绑定页面
			uni.showToast({
				title: '跳转到手机号绑定',
				icon: 'none'
			});
		},
		
		// 处理密码点击
		handlePasswordClick() {
			// 跳转到密码修改页面
			uni.navigateTo({
				url: '/pages/lawyer/index/change-password/index'
			});
		},
		
		// 处理退出登录
		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						// 执行退出登录逻辑
						uni.showToast({
							title: '退出登录成功',
							icon: 'success'
						});
						// 这里可以添加清除用户信息、跳转到登录页等逻辑
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/login/login'
							});
						}, 1500);
					}
				}
			});
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