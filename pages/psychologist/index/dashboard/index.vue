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
  import { getConsultationManagementList } from '@/api/modules/lawyer-workspace.js'
  
  export default {
    name: 'PsychologistDashboard',
    components: {
      PsychologistTabbar
    },
    data() {
      return {
        config,
        consultationListHeight: '300rpx',
        consultationList: [],
        loading: false
      }
    },
    onLoad() {
      this.loadDashboardData()
    },
	methods: {
	  // 加载工作台数据
	  async loadDashboardData() {
	    this.loading = true
	    try {
	      // 加载咨询列表
	      await this.loadConsultations()
	      console.log('工作台数据加载完成')
	    } catch (error) {
	      console.error('工作台数据加载失败:', error)
	      uni.showToast({
	        title: '数据加载失败',
	        icon: 'none'
	      })
	    } finally {
	      this.loading = false
	    }
	  },

	  // 加载咨询列表
	  async loadConsultations() {
	    // Mock数据定义
	    const mockData = [
	      {
	        clientName: '李小明',
	        summary: '焦虑情绪调节咨询...',
	        timeAgo: '10分钟前',
	        consultationId: 'mock_1'
	      },
	      {
	        clientName: '王小红',
	        summary: '职场压力管理咨询...',
	        timeAgo: '25分钟前',
	        consultationId: 'mock_2'
	      },
	      {
	        clientName: '张小华',
	        summary: '人际关系困扰咨询...',
	        timeAgo: '1小时前',
	        consultationId: 'mock_3'
	      }
	    ]
	    
	    try {
	      const response = await getConsultationManagementList({
	        page: 1,
	        size: 10
	      })
	      
	      if (response.data && response.data.list && response.data.list.length > 0) {
	        this.consultationList = response.data.list.map(item => ({
	          clientName: item.clientName || item.userName || '匿名用户',
	          summary: this.truncateText(item.content || item.title || '咨询内容', 15),
	          timeAgo: this.formatTimeAgo(item.createTime || item.updatedAt),
	          consultationId: item.id
	        }))
	        console.log('咨询列表加载成功:', this.consultationList)
	      } else {
	        this.consultationList = mockData
	        console.log('API无数据，使用Mock数据:', this.consultationList)
	      }
	      
	      return response
	    } catch (error) {
	      console.error('咨询列表加载失败:', error)
	      this.consultationList = mockData
	      console.log('API调用失败，使用Mock数据:', this.consultationList)
	      // 不抛出错误，使用mock数据保证页面正常显示
	    }
	  },

	  // 截断文本
	  truncateText(text, maxLength) {
	    if (!text) return ''
	    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
	  },

	  // 格式化时间
	  formatTimeAgo(dateString) {
	    if (!dateString) return '刚刚'
	    
	    try {
	      const date = new Date(dateString)
	      const now = new Date()
	      const diff = now - date
	      
	      const minutes = Math.floor(diff / (1000 * 60))
	      const hours = Math.floor(diff / (1000 * 60 * 60))
	      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
	      
	      if (minutes < 1) return '刚刚'
	      if (minutes < 60) return `${minutes}分钟前`
	      if (hours < 24) return `${hours}小时前`
	      if (days < 7) return `${days}天前`
	      
	      return date.toLocaleDateString('zh-CN')
	    } catch (error) {
	      return '刚刚'
	    }
	  },

	  handleViewDocuments() {
	    // 跳转到咨询消息页面
	    uni.navigateTo({
	      url: '/pages/psychologist/consultation/consultation'
	    })
	  },
	  
	  handleReviewDocuments() {
	    // 跳转到心理师信息设置页面
	    uni.navigateTo({
	      url: '/pages/psychologist/profile/psychology-info-settings/index'
	    })
	  },
	  
	  handleDownloadDocuments() {
	    // 跳转到修改密码页面
	    uni.navigateTo({
	      url: '/pages/psychologist/profile/changepwd/index'
	    })
	  },
	  
	  handleInfoCardClick() {
	    // 跳转到心理咨询页面
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