<template>
	<view class="profile-edit-page" :style="{ background: `url('${config.staticBaseUrl}/bg10.png') no-repeat center center / cover fixed` }">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		
		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<uv-icon size="40" :name="config.staticBaseUrl + '/icons/back.png'"></uv-icon>
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
				<!-- 头像区域 -->
				<view class="avatar-section">
					<view class="avatar-placeholder"></view>
					<text class="change-avatar-text">更换头像</text>
				</view>
				
				<!-- 昵称区域 -->
				<view class="form-section">
					<view class="form-row">
						<text class="form-label">昵称</text>
						<view class="form-input">
							<text class="input-text">李晓明</text>
						</view>
					</view>
					<text class="form-hint">2-16个字符，支持中英文、数字</text>
				</view>
				
				<!-- 会员编号区域 -->
				<view class="form-section">
					<view class="form-row">
						<text class="form-label">会员编号</text>
						<text class="form-value">9842108</text>
						<text class="copy-icon" @click="copyMemberId">📄</text>
					</view>
					<view class="divider"></view>
				</view>
				
				<!-- 性别区域 -->
				<view class="form-section">
					<view class="form-row">
						<text class="form-label">性别</text>
						<view class="radio-group">
							<view class="radio-item" @click="selectGender('male')">
								<view class="radio-icon" :class="{ 'radio-selected': gender === 'male' }">
									<text v-if="gender === 'male'" class="radio-check">✓</text>
								</view>
								<text class="radio-text">男</text>
							</view>
							<view class="radio-item" @click="selectGender('female')">
								<view class="radio-icon" :class="{ 'radio-selected': gender === 'female' }">
									<text v-if="gender === 'female'" class="radio-check">✓</text>
								</view>
								<text class="radio-text">女</text>
							</view>
						</view>
					</view>
					<view class="divider"></view>
				</view>
				
				<!-- 联系方式区域 -->
				<view class="form-section">
					<view class="form-row">
						<text class="form-label">联系方式</text>
					</view>
					<view class="form-placeholder-container">
						<text class="form-placeholder">微信号/邮箱号/手机号</text>
					</view>
				</view>
			</view>
			
			<!-- 保存按钮 -->
			<view class="save-button-container">
				<view class="save-button" @click="saveProfile">
					<text class="save-button-text">点击保存</text>
				</view>
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
			gender: 'male', // 默认选中男性
			nickname: '李晓明',
			memberId: '9842108',
			contact: ''
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
		
		// 选择性别
		selectGender(value) {
			this.gender = value;
		},
		
		// 复制会员编号
		copyMemberId() {
			uni.setClipboardData({
				data: this.memberId,
				success: () => {
					uni.showToast({
						title: '已复制到剪贴板',
						icon: 'success'
					});
				}
			});
		},
		
		// 保存个人资料
		saveProfile() {
			// 这里可以添加保存逻辑
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.profile-edit-page {
	width: 100%;
	height: 100vh;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
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
	font-size: 34rpx;
	color: #4A90E2;
	margin-right: 8rpx;
	font-weight: normal;
}

.nav-back-text {
	font-size: 32rpx;
	color: #4A90E2;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.scroll-container {
	width: 100%;
	padding: 0 30rpx;
	box-sizing: border-box;
}

.main-card {
	background: #FFFFFF;
	border-radius: 40rpx 40rpx 20rpx 20rpx;
	padding: 40rpx 48rpx;
	margin-bottom: 60rpx;
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);
}

.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 50rpx;
}

.avatar-placeholder {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background-color: #D8D8D8;
	margin-bottom: 16rpx;
}

.change-avatar-text {
	font-size: 26rpx;
	color: #4A90E2;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.form-section {
	margin-bottom: 30rpx;
}

.form-row {
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
	min-height: 44rpx;
}

.form-label {
	font-size: 30rpx;
	color: #333333;
	width: 140rpx;
	flex-shrink: 0;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.form-input {
	flex: 1;
	margin-left: 40rpx;
	background-color: #F7F7F9;
	border-radius: 8rpx;
	padding: 20rpx 24rpx;
}

.input-text {
	font-size: 30rpx;
	color: #000000;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.form-value {
	flex: 1;
	margin-left: 40rpx;
	font-size: 30rpx;
	color: #333333;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.copy-icon {
	font-size: 30rpx;
	color: #333333;
	margin-left: 20rpx;
	cursor: pointer;
	width: 32rpx;
	height: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.form-hint {
	font-size: 22rpx;
	color: #888888;
	margin-left: 180rpx;
	margin-top: 12rpx;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.form-placeholder-container {
	margin-top: 12rpx;
}

.form-placeholder {
	font-size: 30rpx;
	color: #AAAAAA;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.radio-group {
	display: flex;
	margin-left: 40rpx;
}

.radio-item {
	display: flex;
	align-items: center;
	margin-right: 50rpx;
	cursor: pointer;
}

.radio-icon {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	border: 2rpx solid #CCCCCC;
	background-color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12rpx;
}

.radio-selected {
	background-color: #4A90E2;
	border-color: #4A90E2;
}

.radio-check {
	font-size: 20rpx;
	color: #FFFFFF;
	font-weight: bold;
}

.radio-text {
	font-size: 30rpx;
	color: #333333;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.divider {
	height: 2rpx;
	background-color: #EEEEEE;
	margin: 30rpx 0;
}

.save-button-container {
	padding: 0 30rpx;
	margin-bottom: 40rpx;
	display: flex;
	justify-content: center;
}

.save-button {
	width: 100%;
	height: 88rpx;
	background-color: #5291ff;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.save-button-text {
	font-size: 32rpx;
	color: #FFFFFF;
	font-weight: 500;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}
</style>