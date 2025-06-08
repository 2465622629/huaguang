<template>
	<view class="invitation-poster-page" :style="{ background: `url('${config.staticBaseUrl}/bg10.png') no-repeat center center / cover` }">
		<!-- 自定义状态栏 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-back" @click="goBack">
				<image class="back-icon" :src="config.staticBaseUrl + '/icons/back.png'" mode="aspectFit"></image>
				<text class="back-text">返回</text>
			</view>
		</view>

		<!-- 滚动容器 -->
		<scroll-view class="scroll-container" scroll-y :style="{ height: scrollHeight + 'px' }" enable-flex>
			<!-- 主内容卡片 -->
			<view class="main-card" :style="{ background: `url('${config.staticBaseUrl}/share.png') no-repeat center center / cover` }">
				<!-- 二维码容器 -->
				<view class="qr-container">
					<view class="qr-code-area">
						<uv-qrcode :value="qrCodeData" :size="qrCodeSize" :margin="0" background-color="#D8D8D8"
							foreground-color="#000000"></uv-qrcode>
					</view>
					<text class="invitation-code-text">{{ invitationCode }}</text>
				</view>

				<!-- 邀请说明文本 -->
				<text class="instruction-text">邀请好友扫码注册，立享佣金奖励</text>
			</view>
		</scroll-view>

		<!-- 保存按钮区域 -->
		<view class="save-button-area">
			<uv-button class="save-poster-button" type="primary" shape="circle" :custom-style="saveButtonStyle"
				@click="savePoster">
				保存海报
			</uv-button>
		</view>
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
			invitationCode: 'ABC123',
			qrCodeData: 'https://example.com/invite?code=ABC123',
			qrCodeSize: 156,
			saveButtonStyle: {
				backgroundColor: '#4A90E2',
				borderRadius: '50px',
				height: '44px',
				width: '70%',
				fontSize: '16px',
				fontWeight: '500'
			}
		}
	},
	onLoad(options) {
		this.initPage();
		// 如果有传入的邀请码参数，使用传入的值
		if (options.code) {
			this.invitationCode = options.code;
			this.qrCodeData = `https://example.com/invite?code=${options.code}`;
		}
	},
	methods: {
		// 初始化页面
		initPage() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			// 计算滚动容器高度：屏幕高度 - 状态栏 - 导航栏 - 保存按钮区域
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 50 - 80;

			// 根据屏幕宽度调整二维码大小
			const screenWidth = systemInfo.windowWidth;
			this.qrCodeSize = Math.min(156, screenWidth * 0.325);
		},

		// 返回上一页
		goBack() {
			uni.navigateBack();
		},

		// 保存海报到相册
		savePoster() {
			uni.showLoading({
				title: '正在保存...'
			});

			// 模拟保存过程
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({
					title: '海报已保存到相册',
					icon: 'success',
					duration: 2000
				});
			}, 1500);

			// 实际项目中，这里应该实现截图和保存到相册的功能
			// 可以使用uni.canvasToTempFilePath()和uni.saveImageToPhotosAlbum()
		}
	}
}
</script>

<style lang="scss" scoped>
.invitation-poster-page {
	width: 100%;
	height: 100vh;
	position: relative;
}

.status-bar {
	width: 100%;
	background: transparent;
}

.nav-bar {
	width: 100%;
	height: 100rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
}

.nav-back {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 8rpx;
}

.back-text {
	font-size: 16px;
	color: #4A90E2;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

.scroll-container {
	width: 100%;
	padding: 0 5%;
	box-sizing: border-box;
}

.main-card {
	border-radius: 20px;
	width: 620rpx;
	height: 900rpx;
	margin: 110rpx auto 50rpx;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	padding: 0;
}



/* 二维码容器 */
.qr-container {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 24rpx;
	padding: 90rpx 40rpx 50rpx 40rpx;
	margin: 220rpx auto 40rpx auto;
	width: 65%;
	box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	z-index: 10;
}

.qr-code-area {
	// margin-bottom: 15px;
	border-radius: 8px;
	overflow: hidden;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

.invitation-code-text {
	font-size: 28px;
	color: #333333;
	font-weight: 500;
	letter-spacing: 2px;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

/* 说明文本 */
.instruction-text {
	display: block;
	text-align: center;
	font-size: 38rpx;
	color: #000;
	margin-top: 20px;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

/* 保存按钮区域 */
.save-button-area {
	position: fixed;
	bottom: 400rpx;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	padding: 0 1%;
}



/* 响应式调整 */
@media screen and (max-width: 375px) {
	.main-card {
		padding: 15px;
	}

	.qr-container {
		width: 70%;
		padding: 15px;
	}

	.invitation-code-text {
		font-size: 24px;
	}

	.instruction-text {
		font-size: 13px;
	}
}

@media screen and (min-width: 414px) {
	.qr-container {
		width: 60%;
	}
}
</style>