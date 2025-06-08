<template>
	<view class="about-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
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
				<text class="description-text">本平台致力于为用户提供法律咨询、心理支持、职业帮扶等一体化服务，构建一个温暖、有保障的互助网络。</text>
			</view>

			<!-- 版本信息与协议卡片 -->
			<view class="info-card">
				<view class="info-item">
					<text class="info-text">版本号 v1.2.3</text>
				</view>
				<view class="divider"></view>
				<view class="info-item">
					<text class="info-text">更新时间: 2025年12月1日</text>
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
				<view class="contact-item">
					<text class="contact-text">客服邮箱: support@example.com</text>
				</view>
				<view class="contact-item">
					<text class="contact-text">客服电话: 400-000-0000 (工作时间: 9:00-18:00)</text>
				</view>
			</view>

			<!-- 公司信息卡片 -->
			<view class="company-card">
				<text class="card-title">公司信息</text>
				<view class="company-item">
					<text class="company-text">公司名称: XX科技有限公司</text>
				</view>
				<view class="company-item">
					<text class="company-text">公司地址: 北京市海淀区XX路XX号</text>
				</view>
			</view>

			<!-- 页脚版权信息 -->
			<view class="footer">
				<text class="copyright-text">© 2024 XX平台版权所有 保留所有权利。</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			scrollHeight: 0,
			backgroundImage: staticBaseUrl + '/bg10.png'
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
			// 计算滚动容器高度：屏幕高度 - 状态栏高度 - 导航栏高度(约44px)
			this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44;
		},

		// 返回上一页
		goBack() {
			uni.navigateBack({
				delta: 1
			});
		},

		// 打开用户协议
		openUserAgreement() {
			console.log('打开用户协议');
			// 这里可以跳转到用户协议页面或打开webview
			uni.showToast({
				title: '用户协议功能待开发',
				icon: 'none'
			});
		},

		// 打开隐私协议
		openPrivacyPolicy() {
			console.log('打开隐私协议');
			// 这里可以跳转到隐私协议页面或打开webview
			uni.showToast({
				title: '隐私协议功能待开发',
				icon: 'none'
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
}

.contact-item:last-child {
	margin-bottom: 0;
}

.contact-text {
	font-size: 14px;
	color: #555555;
	line-height: 1.4;
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
</style>