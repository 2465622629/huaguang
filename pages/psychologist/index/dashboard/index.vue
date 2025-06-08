<template>
	<view class="container" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg11.png)' }">
	  <!-- 顶部插画区域 -->
	  <view class="header-illustration">
		<uv-image 
		  :src="config.staticBaseUrl + '/xinli_banner.png'" 
		  width="90%" 
		  height="500rpx" 
		  mode="aspectFill"
		></uv-image>
	  </view>
	  
	  <!-- 内容区域 -->
	  <view class="content-area">
		<!-- 咨询信息卡片 -->
		<view class="info-card" @click="handleInfoCardClick">
		  <view class="card-title">咨询信息</view>
		  <scroll-view 
			class="consultation-list" 
			scroll-y="true" 
			:style="{ height: consultationListHeight }"
		  >
			<view 
			  v-for="(item, index) in consultationList" 
			  :key="index" 
			  class="consultation-item"
			>
			  <text class="client-name">{{ item.clientName }}</text>
			  <text class="consultation-summary">{{ item.summary }}</text>
			  <text class="time-stamp">{{ item.timeAgo }}</text>
			</view>
		  </scroll-view>
		</view>
		
		<!-- 法律文书审核列表卡片 -->
		<view class="document-card">
		  <view class="action-buttons">
			<view class="action-button" @click="handleViewDocuments">
			  <view class="button-icon view-icon">
				<uv-icon :name="config.staticBaseUrl + '/icons/xinli_huifu.png'" color="#FFFFFF" size="54"></uv-icon>
			  </view>
			  <text class="button-text">回复</text>
			</view>
			<view class="action-button" @click="handleReviewDocuments">
			  <view class="button-icon review-icon">
				<uv-icon :name="config.staticBaseUrl + '/icons/jieshao.png'" color="#FFFFFF" size="54"></uv-icon>
			  </view>
			  <text class="button-text">修改介绍</text>
			</view>
			<view class="action-button" @click="handleDownloadDocuments">
			  <view class="button-icon download-icon">
				<uv-icon :name="config.staticBaseUrl + '/icons/miam_change.png'" color="#FFFFFF" size="54"></uv-icon>
			  </view>
			  <text class="button-text">密码修改</text>
			</view>
		  </view>
		</view>
	  </view>
	  
	  <!-- 心理咨询师底部导航栏 -->
	  <psychologist-tabbar></psychologist-tabbar>
	</view>
  </template>
  
  <script>
  import PsychologistTabbar from '@/components/tabbar/psychologist-tabbar/psychologist-tabbar.vue'
  import config from '@/config/index.js'
  
  export default {
	name: 'PsychologistDashboard',
	components: {
	  PsychologistTabbar
	},
	data() {
	  return {
		config,
		consultationListHeight: '300rpx',
		consultationList: [
		  {
			clientName: '李小明',
			summary: '公司拖欠工资三个月, 当...',
			timeAgo: '10分钟前'
		  },
		  {
			clientName: '王小红',
			summary: '房屋租赁合同纠纷, 需要...',
			timeAgo: '25分钟前'
		  },
		  {
			clientName: '张小华',
			summary: '交通事故责任认定, 对方...',
			timeAgo: '1小时前'
		  },
		  {
			clientName: '刘小强',
			summary: '劳动合同解除争议, 公司...',
			timeAgo: '2小时前'
		  },
		  {
			clientName: '陈小美',
			summary: '婚姻财产分割问题, 涉及...',
			timeAgo: '3小时前'
		  }
		]
	  }
	},
	methods: {
	  handleViewDocuments() {
		uni.showToast({
		  title: '查看文书功能',
		  icon: 'none'
		})
	  },
	  handleReviewDocuments() {
		uni.showToast({
		  title: '审核文书功能',
		  icon: 'none'
		})
	  },
	  handleDownloadDocuments() {
		uni.showToast({
		  title: '下载文书功能',
		  icon: 'none'
		})
	  },
	  handleInfoCardClick() {
		// 跳转到收入管理页面
		uni.navigateTo({
		  url: '/pages/psychologist/consultation/consultation'
		})
	  }
	}
  }
  </script>
  
  <style scoped>
  .container {
	min-height: 100vh;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
  }
  
  .header-illustration {
	width: 100%;
	height: 700rpx;
	position: absolute;
	z-index: 0;
	top: 10rpx;
	left: 10%;
	/* padding: 20rpx; */
  }
  
  .content-area {
	padding: 360rpx 30rpx;
	margin-top: 0rpx;
	z-index: 1;
	position: relative;
  }
  
  .info-card, .document-card {
	background-color: #FFFFFF;
	border-radius: 30rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0px 8rpx 24rpx rgba(0, 0, 0, 0.08);
  }
  
  .card-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 30rpx;
  }
  
  .consultation-list {
	width: 100%;
  }
  
  .consultation-item {
	background-color: #F5F6F7;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
  }
  
  .client-name {
	font-size: 28rpx;
	color: #555555;
	min-width: 120rpx;
  }
  
  .consultation-summary {
	font-size: 28rpx;
	color: #555555;
	flex: 1;
	margin: 0 20rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
  }
  
  .time-stamp {
	font-size: 24rpx;
	color: #000;
	min-width: 120rpx;
	text-align: right;
  }
  
  .action-buttons {
	display: flex;
	justify-content: space-between;
	gap: 20rpx;
  }
  
  .action-button {
	flex: 1;
	background-color: #fff5f5;
	border-radius: 16rpx;
	padding: 30rpx 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
  }
  
  .button-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;
	background-color: #ff8c8c;
  }
  
  .button-text {
	font-size: 26rpx;
	color: #333333;
	text-align: center;
  }
  
  /* 状态栏适配 */
  .container {
	/* padding-top: var(--status-bar-height); */
  }
  </style> 