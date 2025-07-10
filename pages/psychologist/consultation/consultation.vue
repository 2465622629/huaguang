<template>
	<view class="container" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg11.png)' }">
	  <!-- 状态栏占位 -->
	  <view class="status-bar"></view>
	  
	  <!-- 页面标题区域 -->
	  <view class="header">
		<text class="title">咨询信息</text>
		<view class="header-actions">
		  <view class="refresh-button" @click="refreshData">
			<uv-icon name="refresh" size="20" color="#333"></uv-icon>
		  </view>
		  <view class="online-status" :class="{ 'online': isOnline }" @click="toggleOnlineStatus">
			<view class="status-dot"></view>
			<text class="status-text">{{ isOnline ? '在线' : '离线' }}</text>
		  </view>
		</view>
	  </view>
	  
	  <!-- 标签页导航栏 -->
	  <view class="tab-navigation">
		<view 
		  v-for="(tab, index) in tabsList" 
		  :key="index"
		  class="tab-item" 
		  :class="{ 'tab-active': currentTab === index }"
		  @click="handleTabChange(index)"
		>
		  <text class="tab-text" :class="{ 'tab-text-active': currentTab === index }">
			{{ tab.name }}
		  </text>
		  <view v-if="tab.count > 0" class="tab-badge">
			<text class="badge-text">{{ tab.count > 99 ? '99+' : tab.count }}</text>
		  </view>
		</view>
	  </view>
	  
	  <!-- 内容列表区域 -->
	  <view class="content-area">
		<scroll-view 
		  class="scroll-container" 
		  scroll-y="true" 
		  :style="{ height: scrollViewHeight + 'px' }"
		  enable-back-to-top="true"
		  show-scrollbar="false"
		  @scrolltolower="loadMore"
		  @refresherrefresh="onRefresh"
		  :refresher-enabled="true"
		  :refresher-triggered="refreshing"
		>
		  <view class="consultation-list">
			<view 
			  v-for="(item, index) in filteredConsultationList" 
			  :key="item.id"
			  class="consultation-card"
			  @click="handleCardClick(item)"
			>
			  <!-- 左侧头像 -->
			  <view class="avatar-container">
				<uv-avatar 
				  :src="item.userAvatar || ''" 
				  :text="item.userName ? item.userName.charAt(0) : '用'"
				  size="50"
				  bg-color="#f0f0f0"
				  color="#666"
				></uv-avatar>
				<view v-if="item.urgentLevel === 'high'" class="urgent-mark">
				  <uv-icon name="warning" size="12" color="#ff4757"></uv-icon>
				</view>
			  </view>
			  
			  <!-- 右侧信息区域 -->
			  <view class="info-area">
				<!-- 第一行：用户名和心理类别 -->
				<view class="first-line">
				  <text class="user-name">{{ item.userName || '匿名用户' }}</text>
				  <view class="category-tag" :class="'category-' + item.category">
					<text class="category-text">{{ getCategoryName(item.category) }}</text>
				  </view>
				</view>
				
				<!-- 第二行：描述文本 -->
				<view class="second-line">
				  <text class="description">{{ item.title || item.description || '暂无描述' }}</text>
				</view>
				
				<!-- 第三行：状态和标签 -->
				<view class="third-line">
				  <view class="status-badge" :class="'status-' + item.status">
					<text class="status-text">{{ getStatusName(item.status) }}</text>
				  </view>
				  <view v-if="item.unreadCount > 0" class="unread-badge">
					<text class="unread-text">{{ item.unreadCount }}条新消息</text>
				  </view>
				</view>
			  </view>
			  
			  <!-- 右上角时间戳和右下角操作按钮 -->
			  <view class="action-area">
				<text class="time-stamp">{{ formatTime(item.updatedAt || item.createdAt) }}</text>
				<view class="action-buttons">
				  <view 
					v-if="item.status === 'pending'" 
					class="action-button primary" 
					@click.stop="handleReply(item)"
				  >
					<text class="button-text">回复</text>
				  </view>
				  <view 
					v-else-if="item.status === 'in_progress'" 
					class="action-button success" 
					@click.stop="handleContinue(item)"
				  >
					<text class="button-text">继续</text>
				  </view>
				  <view 
					v-else 
					class="action-button default" 
					@click.stop="handleView(item)"
				  >
					<text class="button-text">查看</text>
				  </view>
				</view>
			  </view>
			</view>
		  </view>
		  
		  <!-- 加载更多提示 -->
		  <view v-if="loading && filteredConsultationList.length > 0" class="loading-tip">
			<uv-loading-icon mode="flower" size="24"></uv-loading-icon>
			<text class="loading-text">加载中...</text>
		  </view>
		  
		  <!-- 没有更多数据提示 -->
		  <view v-if="!hasMore && filteredConsultationList.length > 0" class="no-more-tip">
			<text class="no-more-text">没有更多数据了</text>
		  </view>
		  
		  <!-- 空状态 -->
		  <view v-if="filteredConsultationList.length === 0 && !loading" class="empty-state">
			<uv-empty mode="data" icon-size="120" :show="true">
			  <text slot="info" class="empty-text">{{ getEmptyText() }}</text>
			</uv-empty>
		  </view>
		</scroll-view>
	  </view>
	  
	  <!-- 底部标签栏 -->
	  <psychologist-tabbar />
	  
	  <!-- 操作确认弹窗 -->
	  <uv-modal 
		v-model="showActionModal" 
		title="操作确认"
		:content="actionModalContent"
		:show-cancel-button="true"
		@confirm="confirmAction"
		@cancel="cancelAction"
	  ></uv-modal>
	  
	  <!-- 状态更新弹窗 -->
	  <uv-popup 
		v-model="showStatusPopup" 
		mode="bottom" 
		border-radius="20"
		safe-area-inset-bottom
	  >
		<view class="status-popup">
		  <view class="popup-header">
			<text class="popup-title">更新咨询状态</text>
			<uv-icon name="close" @click="showStatusPopup = false"></uv-icon>
		  </view>
		  <view class="status-options">
			<view 
			  v-for="status in availableStatuses" 
			  :key="status.value"
			  class="status-option"
			  @click="selectStatus(status.value)"
			>
			  <text class="option-text">{{ status.label }}</text>
			  <text class="option-desc">{{ status.description }}</text>
			</view>
		  </view>
		</view>
	  </uv-popup>
	</view>
  </template>
  
  <script>
  import PsychologistTabbar from '@/components/tabbar/psychologist-tabbar/psychologist-tabbar.vue'
  import config from '@/config/index.js'
  import { 
	getPsychologistConsultations, 
	updateConsultationStatus, 
	updatePsychologistOnlineStatus,
	getPsychConsultationDetail,
	replyPsychConsultation
  } from '@/api/modules/psychologist.js'
  
  export default {
	components: {
	  PsychologistTabbar
	},
	data() {
	  return {
		config,
		// 标签列表
		tabsList: [
		  { name: '待回复', status: 'pending', count: 0 },
		  { name: '咨询中', status: 'in_progress', count: 0 },
		  { name: '已完成', status: 'completed', count: 0 }
		],
		currentTab: 0,
		
		// 咨询信息列表
		consultationList: [],
		
		// 滚动相关
		scrollViewHeight: 0,
		loading: false,
		refreshing: false,
		hasMore: true,
		page: 1,
		pageSize: 20,
		
		// 在线状态
		isOnline: true,
		
		// 弹窗相关
		showActionModal: false,
		actionModalContent: '',
		currentAction: null,
		currentItem: null,
		
		// 状态更新弹窗
		showStatusPopup: false,
		availableStatuses: [
		  { value: 'in_progress', label: '开始咨询', description: '与用户开始进行咨询对话' },
		  { value: 'completed', label: '完成咨询', description: '本次咨询已结束' }
		],
		
		// 缓存管理
		cacheKey: 'psychologist_consultations',
		cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
		lastFetchTime: 0,
		
		// 错误重试
		retryCount: 0,
		maxRetries: 3,
		retryDelay: 1000,
		
		// 心理类别映射
		categoryMap: {
		  'anxiety': '焦虑症',
		  'depression': '抑郁症', 
		  'stress': '压力管理',
		  'relationship': '人际关系',
		  'family': '家庭问题',
		  'career': '职业发展',
		  'emotion': '情感困扰',
		  'sleep': '睡眠问题',
		  'other': '其他'
		}
	  }
	},
	
	computed: {
	  // 根据当前标签筛选咨询列表
	  filteredConsultationList() {
		const status = this.tabsList[this.currentTab].status
		return this.consultationList.filter(item => item.status === status)
	  }
	},
	
	async mounted() {
	  this.calculateScrollHeight()
	  await this.initializeData()
	},
	
	methods: {
	  /**
	   * 初始化数据
	   */
	  async initializeData() {
		try {
		  // 并行加载数据
		  await Promise.allSettled([
			this.loadConsultations(true),
			this.loadOnlineStatus()
		  ])
		} catch (error) {
		  console.error('初始化数据失败:', error)
		  this.showError('数据加载失败，请刷新重试')
		}
	  },
	  
	  /**
	   * 加载咨询列表
	   */
	  async loadConsultations(isRefresh = false) {
		if (this.loading && !isRefresh) return
		
		// 检查缓存
		if (!isRefresh && this.shouldUseCache()) {
		  const cached = this.getCache()
		  if (cached) {
			this.consultationList = cached.data || []
			this.updateTabCounts()
			return
		  }
		}
		
		this.loading = true
		if (isRefresh) {
		  this.page = 1
		  this.hasMore = true
		}
		
		try {
		  const response = await this.fetchWithRetry(() => 
			getPsychologistConsultations({
			  page: this.page,
			  pageSize: this.pageSize,
			  sortBy: 'updated_time',
			  sortOrder: 'desc'
			})
		  )
		  
		  if (response.code === 200) {
			const newData = response.data?.list || []
			
			if (isRefresh) {
			  this.consultationList = newData
			} else {
			  this.consultationList = [...this.consultationList, ...newData]
			}
			
			this.hasMore = newData.length === this.pageSize
			this.page += 1
			this.lastFetchTime = Date.now()
			
			// 更新缓存
			this.setCache({ 
			  data: this.consultationList,
			  timestamp: this.lastFetchTime 
			})
			
			// 更新标签计数
			this.updateTabCounts()
		  } else {
			throw new Error(response.message || '获取咨询列表失败')
		  }
		} catch (error) {
		  console.error('加载咨询列表失败:', error)
		  if (this.consultationList.length === 0) {
			this.showError('加载失败，请检查网络连接')
		  }
		} finally {
		  this.loading = false
		  this.refreshing = false
		}
	  },
	  
	  /**
	   * 加载在线状态
	   */
	  async loadOnlineStatus() {
		try {
		  // 这里可以调用获取当前状态的API
		  // 暂时使用本地存储的状态
		  const stored = uni.getStorageSync('psychologist_online_status')
		  this.isOnline = stored !== null ? stored : true
		} catch (error) {
		  console.error('加载在线状态失败:', error)
		}
	  },
	  
	  /**
	   * 更新标签计数
	   */
	  updateTabCounts() {
		this.tabsList.forEach(tab => {
		  tab.count = this.consultationList.filter(item => item.status === tab.status).length
		})
	  },
	  
	  /**
	   * 切换在线状态
	   */
	  async toggleOnlineStatus() {
		try {
		  const newStatus = !this.isOnline
		  
		  // 乐观更新UI
		  this.isOnline = newStatus
		  
		  const response = await updatePsychologistOnlineStatus(newStatus)
		  
		  if (response.code === 200) {
			// 保存状态到本地
			uni.setStorageSync('psychologist_online_status', newStatus)
			
			this.$uv.toast(newStatus ? '已设置为在线状态' : '已设置为离线状态')
		  } else {
			// 回滚状态
			this.isOnline = !newStatus
			throw new Error(response.message || '状态更新失败')
		  }
		} catch (error) {
		  console.error('切换在线状态失败:', error)
		  this.showError('状态更新失败')
		}
	  },
	  
	  /**
	   * 计算滚动区域高度
	   */
	  calculateScrollHeight() {
		const systemInfo = uni.getSystemInfoSync()
		const statusBarHeight = systemInfo.statusBarHeight || 0
		const headerHeight = 80 // 页面标题高度
		const tabHeight = 60 // 标签导航高度 
		const tabbarHeight = 50 // uv-tabbar 的高度
		
		this.scrollViewHeight = systemInfo.windowHeight - statusBarHeight - headerHeight - tabHeight - tabbarHeight
	  },
	  
	  /**
	   * 处理标签切换
	   */
	  handleTabChange(index) {
		this.currentTab = index
	  },
	  
	  /**
	   * 处理卡片点击
	   */
	  handleCardClick(item) {
		this.navigateToDetail(item)
	  },
	  
	  /**
	   * 处理回复操作
	   */
	  handleReply(item) {
		this.currentItem = item
		this.currentAction = 'reply'
		this.actionModalContent = `确定要回复"${item.userName}"的咨询吗？`
		this.showActionModal = true
	  },
	  
	  /**
	   * 处理继续咨询
	   */
	  handleContinue(item) {
		this.navigateToChat(item)
	  },
	  
	  /**
	   * 处理查看操作
	   */
	  handleView(item) {
		this.navigateToDetail(item)
	  },
	  
	  /**
	   * 确认操作
	   */
	  async confirmAction() {
		if (this.currentAction === 'reply' && this.currentItem) {
		  await this.startConsultation(this.currentItem)
		}
		this.showActionModal = false
		this.currentAction = null
		this.currentItem = null
	  },
	  
	  /**
	   * 取消操作
	   */
	  cancelAction() {
		this.showActionModal = false
		this.currentAction = null
		this.currentItem = null
	  },
	  
	  /**
	   * 开始咨询
	   */
	  async startConsultation(item) {
		try {
		  const response = await updateConsultationStatus(item.id, {
			status: 'in_progress',
			note: '心理师开始提供咨询服务'
		  })
		  
		  if (response.code === 200) {
			// 更新本地数据
			const index = this.consultationList.findIndex(consultation => consultation.id === item.id)
			if (index !== -1) {
			  this.consultationList[index].status = 'in_progress'
			  this.consultationList[index].updatedAt = new Date().toISOString()
			}
			
			this.updateTabCounts()
			this.$uv.toast('已开始咨询')
			
			// 跳转到聊天界面
			this.navigateToChat(item)
		  } else {
			throw new Error(response.message || '状态更新失败')
		  }
		} catch (error) {
		  console.error('开始咨询失败:', error)
		  this.showError('操作失败，请重试')
		}
	  },
	  
	  /**
	   * 跳转到详情页面
	   */
	  navigateToDetail(item) {
		uni.navigateTo({
		  url: `/pages/psychologist/consultation/detail?id=${item.id}`
		})
	  },
	  
	  /**
	   * 跳转到聊天页面
	   */
	  navigateToChat(item) {
		uni.navigateTo({
		  url: `/pages/psychologist/chat/index?consultationId=${item.id}&userId=${item.userId}`
		})
	  },
	  
	  /**
	   * 下拉刷新
	   */
	  async onRefresh() {
		this.refreshing = true
		await this.loadConsultations(true)
	  },
	  
	  /**
	   * 刷新数据
	   */
	  async refreshData() {
		await this.loadConsultations(true)
	  },
	  
	  /**
	   * 加载更多数据
	   */
	  loadMore() {
		if (!this.loading && this.hasMore) {
		  this.loadConsultations(false)
		}
	  },
	  
	  /**
	   * 获取心理类别名称
	   */
	  getCategoryName(category) {
		return this.categoryMap[category] || '其他'
	  },
	  
	  /**
	   * 获取状态名称
	   */
	  getStatusName(status) {
		const statusMap = {
		  'pending': '待回复',
		  'in_progress': '咨询中', 
		  'completed': '已完成'
		}
		return statusMap[status] || '未知'
	  },
	  
	  /**
	   * 格式化时间
	   */
	  formatTime(timeString) {
		if (!timeString) return ''
		
		const time = new Date(timeString)
		const now = new Date()
		const diff = now - time
		
		// 小于1分钟
		if (diff < 60000) {
		  return '刚刚'
		}
		// 小于1小时
		if (diff < 3600000) {
		  return `${Math.floor(diff / 60000)}分钟前`
		}
		// 小于1天
		if (diff < 86400000) {
		  return `${Math.floor(diff / 3600000)}小时前`
		}
		// 小于7天
		if (diff < 604800000) {
		  return `${Math.floor(diff / 86400000)}天前`
		}
		
		// 超过7天显示具体日期
		return time.toLocaleDateString()
	  },
	  
	  /**
	   * 获取空状态文字
	   */
	  getEmptyText() {
		const statusTexts = {
		  'pending': '暂无待回复的咨询',
		  'in_progress': '暂无进行中的咨询',
		  'completed': '暂无已完成的咨询'
		}
		const status = this.tabsList[this.currentTab].status
		return statusTexts[status] || '暂无咨询信息'
	  },
	  
	  /**
	   * 缓存相关方法
	   */
	  shouldUseCache() {
		return this.lastFetchTime > 0 && (Date.now() - this.lastFetchTime) < this.cacheExpiry
	  },
	  
	  getCache() {
		try {
		  return uni.getStorageSync(this.cacheKey)
		} catch (error) {
		  console.error('获取缓存失败:', error)
		  return null
		}
	  },
	  
	  setCache(data) {
		try {
		  uni.setStorageSync(this.cacheKey, data)
		} catch (error) {
		  console.error('设置缓存失败:', error)
		}
	  },
	  
	  /**
	   * 带重试的请求方法
	   */
	  async fetchWithRetry(apiCall, retryCount = 0) {
		try {
		  return await apiCall()
		} catch (error) {
		  if (retryCount < this.maxRetries) {
			const delay = this.retryDelay * Math.pow(2, retryCount) + Math.random() * 1000
			await new Promise(resolve => setTimeout(resolve, delay))
			return this.fetchWithRetry(apiCall, retryCount + 1)
		  }
		  throw error
		}
	  },
	  
	  /**
	   * 显示错误信息
	   */
	  showError(message) {
		this.$uv.toast(message)
	  }
	}
  }
  </script>
  
  <style lang="scss" scoped>
  .container {
	width: 100%;
	height: 100vh;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	display: flex;
	flex-direction: column;
  }
  
  // 状态栏占位
  .status-bar {
	height: var(--status-bar-height);
	background: transparent;
  }
  
  // 页面标题区域
  .header {
	padding: 16px 20px 12px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	
	.title {
	  font-size: 24px;
	  font-weight: bold;
	  color: #333333;
	  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
	}
	
	.header-actions {
	  display: flex;
	  align-items: center;
	  gap: 10px;
	}
	
	.refresh-button {
	  padding: 5px;
	}
	
	.online-status {
	  display: flex;
	  align-items: center;
	  gap: 5px;
	  padding: 5px 10px;
	  border-radius: 20px;
	  background-color: #ffecec;
	  border: 1px solid #ff7d7d;
	  
	  &.online {
		background-color: #e1f3d8;
		border-color: #67c23a;
	  }
	  
	  .status-dot {
		width: 8px;
		height: 8px;
		border-radius: 4px;
		background-color: #ff7d7d;
	  }
	  
	  .status-text {
		font-size: 13px;
		color: #ff7d7d;
		font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
	  }
	  
	  &.online {
		.status-dot {
		  background-color: #67c23a;
		}
		
		.status-text {
		  color: #67c23a;
		}
	  }
	}
  }
  
  // 标签页导航栏
  .tab-navigation {
	padding: 0 20px 16px;
	display: flex;
	align-items: center;
	gap: 16px;
	
	.tab-item {
	  height: 32px;
	  padding: 0 12px;
	  border-radius: 6px;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  background: #ffecec;
	  position: relative;
	  
	  &.tab-active {
		background-color: #ff7d7d;
	  }
	  
	  .tab-text {
		font-size: 15px;
		color: #ff7d7d;
		font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
		
		&.tab-text-active {
		  color: #FFFFFF;
		}
	  }
	  
	  .tab-badge {
		position: absolute;
		top: -5px;
		right: -5px;
		background-color: #ff4757;
		border-radius: 10px;
		padding: 2px 6px;
		min-width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
		
		.badge-text {
		  font-size: 12px;
		  color: #FFFFFF;
		  font-weight: bold;
		}
	  }
	}
  }
  
  // 内容列表区域
  .content-area {
	flex: 1;
	padding: 0 12px;
  }
  
  .scroll-container {
	width: 100%;
  }
  
  .consultation-list {
	padding-bottom: 20px;
  }
  
  // 咨询卡片样式
  .consultation-card {
	background-color: #FFFFFF;
	border-radius: 12px;
	padding: 12px 16px;
	margin-bottom: 10px;
	box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
	display: flex;
	align-items: flex-start;
	position: relative;
	
	// 左侧头像
	.avatar-container {
	  position: relative;
	  margin-right: 12px;
	  flex-shrink: 0;
	  
	  .urgent-mark {
		position: absolute;
		top: 0;
		right: 0;
		background-color: #ffecec;
		border: 1px solid #ff7d7d;
		border-radius: 10px;
		padding: 2px 6px;
		z-index: 1;
		
		.uv-icon {
		  font-size: 12px;
		  color: #ff7d7d;
		}
	  }
	}
	
	// 右侧信息区域
	.info-area {
	  flex: 1;
	  margin-right: 80px; // 为右侧操作区域留出空间
	  
	  .first-line {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
		
		.user-name {
		  font-size: 16px;
		  font-weight: 500;
		  color: #333333;
		  margin-right: 8px;
		  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
		}
		
		.category-tag {
		  background-color: #ffecec;
		  border: 1px solid #ff7d7d;
		  border-radius: 4px;
		  padding: 2px 6px;
		  display: flex;
		  align-items: center;
		  
		  &.category-anxiety {
			background-color: #fffbe6;
			border-color: #ffe58f;
		  }
		  &.category-depression {
			background-color: #fffbe6;
			border-color: #ffe58f;
		  }
		  &.category-stress {
			background-color: #e6f7ff;
			border-color: #91d5ff;
		  }
		  &.category-relationship {
			background-color: #e6f7ff;
			border-color: #91d5ff;
		  }
		  &.category-family {
			background-color: #e6f7ff;
			border-color: #91d5ff;
		  }
		  &.category-career {
			background-color: #e6f7ff;
			border-color: #91d5ff;
		  }
		  &.category-emotion {
			background-color: #e6f7ff;
			border-color: #91d5ff;
		  }
		  &.category-sleep {
			background-color: #e6f7ff;
			border-color: #91d5ff;
		  }
		  &.category-other {
			background-color: #e6f7ff;
			border-color: #91d5ff;
		  }
		  
		  .category-text {
			font-size: 12px;
			color: #ff7d7d;
			font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
		  }
		}
	  }
	  
	  .second-line {
		.description {
		  font-size: 13px;
		  color: #666666;
		  line-height: 1.3;
		  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
		  overflow: hidden;
		  text-overflow: ellipsis;
		  white-space: nowrap;
		}
	  }
	  
	  .third-line {
		display: flex;
		align-items: center;
		margin-top: 4px;
		
		.status-badge {
		  background-color: #ffecec;
		  border: 1px solid #ff7d7d;
		  border-radius: 4px;
		  padding: 2px 6px;
		  display: flex;
		  align-items: center;
		  
		  &.status-pending {
			background-color: #fffbe6;
			border-color: #ffe58f;
		  }
		  &.status-in_progress {
			background-color: #e1f3d8;
			border-color: #67c23a;
		  }
		  &.status-completed {
			background-color: #e1f3d8;
			border-color: #67c23a;
		  }
		  
		  .status-text {
			font-size: 12px;
			color: #ff7d7d;
			font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
			
			&.status-pending {
			  color: #ffe58f;
			}
			&.status-in_progress {
			  color: #67c23a;
			}
			&.status-completed {
			  color: #67c23a;
			}
		  }
		}
		
		.unread-badge {
		  background-color: #ffecec;
		  border: 1px solid #ff7d7d;
		  border-radius: 4px;
		  padding: 2px 6px;
		  display: flex;
		  align-items: center;
		  
		  .unread-text {
			font-size: 12px;
			color: #ff7d7d;
			font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
		  }
		}
	  }
	}
	
	// 右上角时间戳和右下角操作按钮
	.action-area {
	  position: absolute;
	  right: 16px;
	  top: 12px;
	  display: flex;
	  flex-direction: column;
	  align-items: flex-end;
	  height: calc(100% - 24px);
	  justify-content: space-between;
	  
	  .time-stamp {
		font-size: 12px;
		color: #999999;
		font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
	  }
	  
	  .action-buttons {
		display: flex;
		gap: 8px;
		
		.action-button {
		  padding: 2px 6px;
		  border-radius: 5px;
		  
		  &.primary {
			background-color: #ff9595;
			border: 1px solid #ff9595;
			
			.button-text {
			  color: #FFFFFF;
			}
		  }
		  &.success {
			background-color: #67c23a;
			border: 1px solid #67c23a;
			
			.button-text {
			  color: #FFFFFF;
			}
		  }
		  &.default {
			background-color: #e0e0e0;
			border: 1px solid #e0e0e0;
			
			.button-text {
			  color: #333333;
			}
		  }
		  
		  .button-text {
			font-size: 13px;
			font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
		  }
		}
	  }
	}
  }
  
  // 加载提示
  .loading-tip {
	text-align: center;
	padding: 20px;
	
	.loading-text {
	  font-size: 14px;
	  color: #888888;
	}
  }
  
  .no-more-tip {
	text-align: center;
	padding: 20px;
	
	.no-more-text {
	  font-size: 14px;
	  color: #AAAAAA;
	}
  }
  
  // 空状态
  .empty-state {
	text-align: center;
	padding: 60px 20px;
	
	.empty-text {
	  font-size: 16px;
	  color: #999999;
	}
  }
  
  // 状态更新弹窗样式
  .status-popup {
	padding: 20px;
	
	.popup-header {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-bottom: 15px;
	  
	  .popup-title {
		font-size: 18px;
		font-weight: bold;
		color: #333333;
		font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
	  }
	}
	
	.status-options {
	  display: flex;
	  flex-direction: column;
	  gap: 10px;
	  
	  .status-option {
		background-color: #f5f5f5;
		border-radius: 8px;
		padding: 12px 15px;
		display: flex;
		flex-direction: column;
		
		.option-text {
		  font-size: 16px;
		  font-weight: 500;
		  color: #333333;
		  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
		}
		
		.option-desc {
		  font-size: 12px;
		  color: #999999;
		  margin-top: 4px;
		  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
		}
	  }
	}
  }
  </style>