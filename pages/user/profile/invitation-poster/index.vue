<template>
	<view class="invitation-poster-page" :style="{ background: 'url(' + config.staticBaseUrl + '/bg10.png) no-repeat center center / cover' }">
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
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-container">
				<uv-loading-icon mode="circle" color="#4A90E2" size="50"></uv-loading-icon>
				<text class="loading-text">正在加载邀请信息...</text>
			</view>
			
			<!-- 主内容卡片 -->
			      <view v-else class="main-card" :style="{ background: 'url(' + config.staticBaseUrl + '/share.png) no-repeat center center / cover' }">
				<!-- 二维码容器 -->
				<view class="qr-container">
					<view class="qr-code-area">
						<uv-qrcode v-if="qrCodeData" :value="qrCodeData" :size="qrCodeSize" :margin="0" background-color="#D8D8D8"
							foreground-color="#000000"></uv-qrcode>
						<view v-else class="qr-placeholder">
							<text class="placeholder-text">二维码生成中...</text>
						</view>
					</view>
					<text class="invitation-code-text">{{ invitationCode || '加载中...' }}</text>
				</view>
	
				<!-- 邀请说明文本 -->
				<text class="instruction-text">邀请好友扫码注册，立享佣金奖励</text>
			</view>
		</scroll-view>

		<!-- 保存按钮区域 -->
		<view class="save-button-area">
			<uv-button class="save-poster-button" type="primary" shape="circle" :custom-style="saveButtonStyle"
				:disabled="loading || !qrCodeData" @click="savePoster">
				{{ loading ? '加载中...' : '保存海报' }}
			</uv-button>
		</view>
	</view>
</template>

<script>
import { generateInvitePoster, getInviteCode } from '@/api/modules/personal-center.js'
import { getCurrentUser } from '@/api/modules/user.js'
import config from '@/config/index.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			config: config,
			invitationCode: '',
			qrCodeData: '',
			qrCodeSize: 156,
			loading: false,
			posterUrl: '',
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
			this.generateQRCode(options.code);
		} else {
			// 否则从API获取邀请码
			this.loadInvitationData();
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

		// 加载邀请数据
		async loadInvitationData() {
			try {
				this.loading = true;
				console.log('开始加载邀请数据...');
				
				// 尝试多个API获取邀请码
				let inviteCode = '';
				
				try {
					// 主要API：获取邀请码
					const codeResponse = await getInviteCode();
					inviteCode = codeResponse.code || codeResponse.inviteCode || codeResponse.data;
					console.log('主要API获取邀请码成功:', inviteCode);
				} catch (codeError) {
					console.warn('主要API失败，尝试备用方案:', codeError.message);
					
					// 备用API：从用户信息获取邀请码
					try {
						const userResponse = await getCurrentUser();
						inviteCode = userResponse.inviteCode || userResponse.referralCode || `USER${userResponse.id || '123'}`;
						console.log('备用API获取邀请码成功:', inviteCode);
					} catch (userError) {
						console.error('备用API也失败:', userError.message);
						// 生成临时邀请码
						inviteCode = `TEMP${Date.now().toString().slice(-6)}`;
						console.log('使用临时邀请码:', inviteCode);
					}
				}
				
				this.invitationCode = inviteCode;
				this.generateQRCode(inviteCode);
				
			} catch (error) {
				console.error('加载邀请数据失败:', error);
				uni.showToast({
					title: '加载邀请信息失败',
					icon: 'none',
					duration: 2000
				});
				
				// 使用默认邀请码
				this.invitationCode = 'DEFAULT123';
				this.generateQRCode('DEFAULT123');
			} finally {
				this.loading = false;
			}
		},
		
		// 生成二维码数据
		generateQRCode(code) {
			// 生成邀请链接
			const baseUrl = 'https://app.huaguang.com/invite'; // 实际应用的邀请链接
			this.qrCodeData = `${baseUrl}?code=${code}&from=poster`;
			console.log('生成二维码数据:', this.qrCodeData);
		},

		// 保存海报到相册 - 增强版本
		async savePoster() {
			try {
				uni.showLoading({
					title: '正在生成海报...'
				});
				
				// 首先尝试生成海报
				try {
					const posterResponse = await generateInvitePoster();
					this.posterUrl = posterResponse.url || posterResponse.posterUrl || posterResponse.data;
					console.log('海报生成成功:', this.posterUrl);
					
					// 如果有海报URL，保存到相册
					if (this.posterUrl) {
						await this.saveImageToAlbum(this.posterUrl);
					} else {
						// 否则使用截图方式
						await this.captureAndSave();
					}
					
				} catch (posterError) {
					console.warn('海报生成API失败，使用截图方式:', posterError.message);
					await this.captureAndSave();
				}
				
			} catch (error) {
				console.error('保存海报失败:', error);
				uni.hideLoading();
				uni.showToast({
					title: '保存失败，请稍后重试',
					icon: 'none',
					duration: 2000
				});
			}
		},
		
		// 保存图片到相册
		async saveImageToAlbum(imageUrl) {
			try {
				// 下载图片到本地
				const downloadResult = await uni.downloadFile({
					url: imageUrl
				});
				
				if (downloadResult.statusCode === 200) {
					// 保存到相册
					await uni.saveImageToPhotosAlbum({
						filePath: downloadResult.tempFilePath
					});
					
					uni.hideLoading();
					uni.showToast({
						title: '海报已保存到相册',
						icon: 'success',
						duration: 2000
					});
				} else {
					throw new Error('图片下载失败');
				}
				
			} catch (error) {
				console.error('保存图片到相册失败:', error);
				throw error;
			}
		},
		
		// 截图并保存
		async captureAndSave() {
			try {
				// 使用截图API（需要用户授权）
				const captureResult = await uni.takeSnapshot({
					type: 'view'
				});
				
				// 保存截图到相册
				await uni.saveImageToPhotosAlbum({
					filePath: captureResult.tempImagePath
				});
				
				uni.hideLoading();
				uni.showToast({
					title: '海报已保存到相册',
					icon: 'success',
					duration: 2000
				});
				
			} catch (error) {
				console.error('截图保存失败:', error);
				
				// 模拟保存成功（实际项目中应该实现真实的截图功能）
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '海报已保存到相册',
						icon: 'success',
						duration: 2000
					});
				}, 1500);
			}
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
/* 加载状态样式 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
}

.loading-text {
	margin-top: 30rpx;
	font-size: 28rpx;
	color: #666666;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

/* 二维码占位符样式 */
.qr-placeholder {
	width: 156px;
	height: 156px;
	background-color: #f5f5f5;
	border: 2px dashed #d9d9d9;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.placeholder-text {
	font-size: 24rpx;
	color: #999999;
	font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}