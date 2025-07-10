<template>
  <view class="consultation-records-page" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
    <!-- 自定义状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <uv-icon name="arrow-left" color="#007AFF" size="32"></uv-icon>
        <text class="back-text">返回</text>
      </view>
    </view>
    
    <!-- 主内容区域 -->
    <scroll-view
      class="scroll-container"
      scroll-y="true"
      :style="{ height: scrollHeight + 'px' }"
      enable-back-to-top="true"
      show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 咨询记录卡片列表 -->
      <view class="records-list">
        <!-- 记录列表 -->
        <view
          v-for="(record, index) in consultationRecords"
          :key="record.id || index"
          class="record-card"
        >
          <!-- 卡片内容 -->
          <view class="card-content">
            <!-- 标题 -->
            <text class="record-title">{{ record.title || record.targetName || '咨询记录' }}</text>
            
            <!-- 公司名称或服务类型 -->
            <text class="company-name">{{ record.company || record.serviceType || '咨询服务' }}</text>
            
            <!-- 时间戳 -->
            <text class="timestamp">{{ formatTime(record.timestamp || record.updatedAt || record.createdAt) }}</text>
            
            <!-- 状态标签 -->
            <view class="status-tag" :class="getStatusClass(record.status)">
              <text class="status-text">{{ getStatusText(record.status) }}</text>
            </view>
            
            <!-- 按钮行 -->
            <view class="button-row">
              <view
                class="action-button primary-button"
                @click="enterCommunication(record)"
                v-if="record.status === 'active'"
              >
                <text class="button-text primary-text">进入沟通</text>
              </view>
              
              <view
                class="action-button secondary-button"
                @click="viewHistory(record)"
                v-if="record.status === 'ended'"
              >
                <text class="button-text secondary-text">查看记录</text>
              </view>
              
              <view
                class="action-button danger-button"
                @click="endConversation(record)"
                v-if="record.status === 'active'"
              >
                <text class="button-text danger-text">结束对话</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="!loading && consultationRecords.length === 0" class="empty-state">
          <text class="empty-text">暂无咨询记录</text>
          <text class="empty-hint">您还没有进行过咨询，快去找专业人士聊聊吧</text>
        </view>
        
        <!-- 加载更多提示 -->
        <view v-if="consultationRecords.length > 0" class="load-more">
          <text v-if="loading" class="load-text">加载中...</text>
          <text v-else-if="!hasMore" class="load-text">没有更多了</text>
          <text v-else class="load-text">上拉加载更多</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import { getUserSessions, getChatSessions, deleteSessionAndMessages } from '@/api/modules/chat.js'
import { getCurrentUser, getFavorites, getBrowseHistory } from '@/api/modules/user.js'

export default {
  name: 'ConsultationRecords',
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      backgroundImage: staticBaseUrl + '/bg10.png',
      loading: false,
      refreshing: false,
      consultationRecords: [],
      page: 1,
      pageSize: 20,
      hasMore: true,
      retryCount: 0,
      maxRetries: 3,
      filterStatus: 'all', // 筛选状态：all, active, ended, pending
      searchKeyword: '' // 搜索关键词
    }
  },
  onLoad() {
    this.initPage()
    this.loadConsultationRecords()
  },
  onShow() {
    // 页面显示时刷新数据
    this.refreshData()
  },

  onPullDownRefresh() {
    this.onRefresh().then(() => {
      uni.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    this.onLoadMore()
  },
  methods: {
    // 初始化页面
    initPage() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      // 计算滚动容器高度：屏幕高度 - 状态栏 - 导航栏(约44px)
      this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44
    },

    // 加载咨询记录 - 增强版多源数据整合
    async loadConsultationRecords(isRefresh = false) {
      if (this.loading) return
      
      if (isRefresh) {
        this.page = 1
        this.hasMore = true
        this.consultationRecords = []
        this.retryCount = 0
      }
      
      this.loading = true
      
      try {
        // 主要数据源：用户会话列表
        const records = await this.fetchConsultationRecordsWithRetry(isRefresh)
        
        if (isRefresh) {
          this.consultationRecords = records
        } else {
          this.consultationRecords.push(...records)
        }
        
        // 检查是否还有更多数据
        this.hasMore = records.length >= this.pageSize
        
        if (this.hasMore) {
          this.page++
        }
        
        // 重置重试计数
        this.retryCount = 0
        
        console.log('咨询记录加载成功:', records)
        
      } catch (error) {
        console.error('获取咨询记录失败:', error)
        
        // 如果是刷新操作且主要数据源失败，尝试备用数据源
        if (isRefresh) {
          try {
            const backupRecords = await this.fetchBackupConsultationData()
            this.consultationRecords = backupRecords
            
            uni.showToast({
              title: '已从备用数据源加载',
              icon: 'none',
              duration: 2000
            })
          } catch (backupError) {
            console.error('备用数据源也失败:', backupError)
            uni.showToast({
              title: '网络连接异常，请稍后重试',
              icon: 'none'
            })
          }
        } else {
          uni.showToast({
            title: '加载失败，请下拉刷新重试',
            icon: 'none'
          })
        }
      } finally {
        this.loading = false
      }
    },

    // 带重试机制的数据获取
    async fetchConsultationRecordsWithRetry(isRefresh = false) {
      const maxRetries = this.maxRetries
      let lastError = null
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // 指数退避延迟
          if (attempt > 0) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
            await new Promise(resolve => setTimeout(resolve, delay))
            
            console.log(`重试第 ${attempt} 次获取咨询记录...`)
          }
          
          // 并行获取主要数据源
          const [userSessionsResult, chatSessionsResult] = await Promise.allSettled([
            getUserSessions({
              page: this.page,
              pageSize: this.pageSize,
              type: 'consultation'
            }),
            getChatSessions({
              page: this.page,
              pageSize: this.pageSize,
              type: 'consultation'
            })
          ])
          
          // 处理主要数据源
          let sessions = []
          if (userSessionsResult.status === 'fulfilled') {
            const sessionData = userSessionsResult.value.data || userSessionsResult.value
            sessions = sessionData.list || sessionData.sessions || []
          } else if (chatSessionsResult.status === 'fulfilled') {
            // 备用数据源
            const sessionData = chatSessionsResult.value.data || chatSessionsResult.value
            sessions = sessionData.list || sessionData.sessions || []
          } else {
            throw new Error('所有数据源都失败')
          }
          
          // 格式化数据
          const formattedRecords = sessions.map(session => ({
            id: session.id || session.sessionId,
            title: this.getSessionTitle(session),
            company: this.getSessionCompany(session),
            timestamp: session.updatedAt || session.createdAt,
            status: session.status || 'active',
            sessionId: session.id || session.sessionId,
            targetId: session.targetId,
            targetType: session.targetType,
            targetName: session.targetName,
            serviceType: session.serviceType,
            lastMessage: session.lastMessage,
            source: userSessionsResult.status === 'fulfilled' ? 'primary' : 'backup'
          }))
          
          // 数据排序：按时间倒序，优先显示进行中的会话
          formattedRecords.sort((a, b) => {
            // 首先按状态排序：active > pending > ended
            const statusPriority = { active: 3, pending: 2, ended: 1 }
            const statusDiff = (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0)
            if (statusDiff !== 0) return statusDiff
            
            // 然后按时间排序
            const timeA = new Date(a.timestamp || 0).getTime()
            const timeB = new Date(b.timestamp || 0).getTime()
            return timeB - timeA
          })
          
          return formattedRecords
          
        } catch (error) {
          lastError = error
          console.error(`第 ${attempt + 1} 次尝试失败:`, error)
          
          if (attempt === maxRetries) {
            throw lastError
          }
        }
      }
    },

    // 备用数据源：从用户收藏和浏览历史中恢复咨询记录
    async fetchBackupConsultationData() {
      try {
        const [userResult, favoritesResult, historyResult] = await Promise.allSettled([
          getCurrentUser(),
          getFavorites({ type: 'consultation', page: 1, pageSize: 10 }),
          getBrowseHistory({ page: 1, pageSize: 10 })
        ])
        
        const backupRecords = []
        
        // 从用户信息中提取最近咨询
        if (userResult.status === 'fulfilled') {
          const userData = userResult.value.data || userResult.value
          if (userData.recentConsultations) {
            userData.recentConsultations.forEach(consultation => {
              backupRecords.push({
                id: consultation.id || `backup_${Date.now()}_${Math.random()}`,
                title: consultation.title || '历史咨询记录',
                company: consultation.company || '咨询服务',
                timestamp: consultation.timestamp || consultation.createdAt,
                status: 'ended', // 备用数据默认为已结束
                sessionId: consultation.sessionId || consultation.id,
                targetId: consultation.targetId,
                targetType: consultation.targetType || 'unknown',
                targetName: consultation.targetName,
                serviceType: consultation.serviceType,
                source: 'backup_user'
              })
            })
          }
        }
        
        // 从收藏中提取咨询相关记录
        if (favoritesResult.status === 'fulfilled') {
          const favoritesData = favoritesResult.value.data || favoritesResult.value
          const favorites = favoritesData.list || favoritesData.favorites || []
          
          favorites.forEach(favorite => {
            if (favorite.targetType === 'consultation' || favorite.type === 'consultation') {
              backupRecords.push({
                id: `fav_${favorite.id}`,
                title: favorite.title || '收藏的咨询',
                company: favorite.company || '咨询服务',
                timestamp: favorite.createdAt,
                status: 'ended',
                sessionId: favorite.targetId,
                targetId: favorite.targetId,
                targetType: favorite.targetType,
                targetName: favorite.targetName,
                serviceType: '收藏咨询',
                source: 'backup_favorites'
              })
            }
          })
        }
        
        // 数据去重和排序
        const uniqueRecords = backupRecords.filter((record, index, self) =>
          index === self.findIndex(r => r.sessionId === record.sessionId)
        )
        
        uniqueRecords.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime()
          const timeB = new Date(b.timestamp || 0).getTime()
          return timeB - timeA
        })
        
        return uniqueRecords.slice(0, this.pageSize)
        
      } catch (error) {
        console.error('备用数据源获取失败:', error)
        return []
      }
    },

    // 获取会话标题
    getSessionTitle(session) {
      if (session.targetType === 'lawyer') {
        return session.targetName || '律师咨询'
      } else if (session.targetType === 'psychologist') {
        return session.targetName || '心理咨询'
      } else if (session.targetType === 'enterprise') {
        return session.targetName || '企业咨询'
      }
      return session.title || '咨询记录'
    },

    // 获取会话公司/机构信息
    getSessionCompany(session) {
      return session.targetCompany || session.serviceType || '咨询服务'
    },

    // 格式化时间 - 增强版
    formatTime(timestamp) {
      if (!timestamp) return '时间未知'
      
      try {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date
        
        // 无效日期处理
        if (isNaN(date.getTime())) {
          return '时间格式错误'
        }
        
        // 未来时间处理
        if (diff < 0) {
          return '刚刚'
        }
        
        // 1分钟内
        if (diff < 60 * 1000) {
          return '刚刚'
        }
        
        // 1小时内
        if (diff < 60 * 60 * 1000) {
          const minutes = Math.floor(diff / (60 * 1000))
          return `${minutes}分钟前`
        }
        
        // 今天
        if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
          return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        
        // 昨天
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        if (date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear()) {
          return '昨天 ' + date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        
        // 本周内
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        if (date > weekAgo) {
          const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
          return weekdays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        
        // 本年内
        if (date.getFullYear() === now.getFullYear()) {
          return date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        
        // 其他年份
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        
      } catch (error) {
        console.error('时间格式化错误:', error)
        return '时间解析失败'
      }
    },

    // 获取状态样式类 - 增强版
    getStatusClass(status) {
      switch (status) {
        case 'active':
          return 'status-active'
        case 'ended':
          return 'status-ended'
        case 'pending':
          return 'status-pending'
        case 'cancelled':
          return 'status-cancelled'
        case 'timeout':
          return 'status-timeout'
        case 'processing':
          return 'status-processing'
        default:
          return 'status-default'
      }
    },

    // 获取状态文本 - 增强版
    getStatusText(status) {
      switch (status) {
        case 'active':
          return '进行中'
        case 'ended':
          return '已结束'
        case 'pending':
          return '等待中'
        case 'cancelled':
          return '已取消'
        case 'timeout':
          return '已超时'
        case 'processing':
          return '处理中'
        case 'paused':
          return '已暂停'
        case 'scheduled':
          return '已预约'
        default:
          return '状态未知'
      }
    },

    // 刷新数据
    refreshData() {
      this.loadConsultationRecords(true)
    },

    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await this.loadConsultationRecords(true)
      } finally {
        this.refreshing = false
      }
    },

    // 上拉加载更多
    onLoadMore() {
      if (!this.loading && this.hasMore) {
        this.loadConsultationRecords(false)
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 进入沟通
    enterCommunication(record) {
      console.log('进入沟通:', record)
      
      // 根据不同类型跳转到对应的聊天页面
      let chatUrl = '/pages/user/index/chat/index'
      
      if (record.targetType === 'lawyer') {
        chatUrl = '/pages/lawyer/index/chat/index'
      } else if (record.targetType === 'psychologist') {
        chatUrl = '/pages/psychologist/index/chat/index'
      } else if (record.targetType === 'enterprise') {
        chatUrl = '/pages/enterprise/index/chat/index'
      }
      
      uni.navigateTo({
        url: `${chatUrl}?sessionId=${record.sessionId}&targetId=${record.targetId}`
      })
    },

    // 查看历史记录
    viewHistory(record) {
      console.log('查看历史记录:', record)
      
      // 跳转到聊天记录页面（只读模式）
      uni.navigateTo({
        url: `/pages/user/index/chat/index?sessionId=${record.sessionId}&readonly=true`
      })
    },
    
    // 结束对话
    async endConversation(record) {
      console.log('结束对话:', record)
      
      uni.showModal({
        title: '确认结束对话',
        content: '确定要结束这个咨询对话吗？结束后将无法继续沟通。',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '处理中...' })
              
              // 调用删除会话API
              await deleteSessionAndMessages(record.sessionId)
              
              uni.showToast({
                title: '对话已结束',
                icon: 'success'
              })
              
              // 刷新列表
              this.refreshData()
              
            } catch (error) {
              console.error('结束对话失败:', error)
              uni.showToast({
                title: '结束对话失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.consultation-records-page {
  min-height: 100vh;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: relative;
}

/* 状态栏样式 */
.status-bar {
  width: 100%;
  background: transparent;
}

/* 导航栏样式 */
.navbar {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 32rpx 0rpx 0rpx 32rpx;
  background: transparent;
}

.nav-left {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.back-text {
  color: #007AFF;
  font-size: 16px;
  margin-left: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 滚动容器样式 */
.scroll-container {
  width: 100%;
}

/* 记录列表样式 */
.records-list {
  padding: 32rpx 32rpx 32rpx 32rpx;
}

/* 记录卡片样式 */
.record-card {
  background: #FFFFFF;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
}

.card-content {
  padding: 12px;
}

/* 文本样式 */
.record-title {
  font-size: 16px;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.company-name {
  font-size: 13px;
  color: #555555;
  display: block;
  margin-bottom: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.timestamp {
  font-size: 12px;
  color: #888888;
  display: block;
  margin-bottom: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 按钮行样式 */
.button-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.action-button {
  flex: 1;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.primary-button {
  background: #EBF4FF;
}

.secondary-button {
  background: #F0F0F0;
}

.button-text {
  font-size: 13px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.primary-text {
  color: #007AFF;
}

.secondary-text {
  color: #666666;
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status-active {
  background: #E8F5E8;
  color: #52C41A;
}

.status-ended {
  background: #F5F5F5;
  color: #8C8C8C;
}

.status-pending {
  background: #FFF7E6;
  color: #FA8C16;
}

.status-cancelled {
  background: #FFF2F0;
  color: #FF4D4F;
}

.status-timeout {
  background: #FFF2F0;
  color: #FF4D4F;
}

.status-processing {
  background: #E6F7FF;
  color: #1890FF;
}

.status-default {
  background: #FAFAFA;
  color: #999999;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999999;
}

.empty-text {
  font-size: 16px;
  color: #666666;
  margin-bottom: 8px;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.empty-hint {
  font-size: 14px;
  color: #999999;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 加载更多样式 */
.load-more {
  text-align: center;
  padding: 20px;
}

.load-text {
  font-size: 14px;
  color: #999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 危险按钮样式 */
.danger-button {
  background: #FFF2F0;
}

.danger-text {
  color: #FF4D4F;
}

/* 按钮点击效果 */
.action-button:active {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 卡片悬停效果 */
.record-card:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}
</style>