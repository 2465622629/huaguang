<template>
  <view class="assistance-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg10.png')` }">
    <!-- 自定义状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 导航区域 -->
    <view class="nav-section">
      <!-- 返回按钮 -->
      <view class="back-button" @click="goBack">
        <uv-icon name="arrow-left" color="#007AFF" size="32"></uv-icon>
        <text class="back-text">返回</text>
      </view>
    </view>
    
    <!-- 主内容区域 -->
    <scroll-view
      class="scroll-container"
      :style="{ height: scrollHeight + 'px' }"
      scroll-y="true"
      @scrolltolower="onLoadMore"
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper">
        <!-- 加载状态 -->
        <view v-if="loading && assistanceRecords.length === 0" class="loading-state">
          <view class="loading-spinner"></view>
          <text class="loading-text">正在加载帮扶记录...</text>
          <text class="loading-subtitle">请稍候，正在为您获取最新数据</text>
        </view>
        
        <!-- 帮扶记录列表 -->
        <view v-else-if="assistanceRecords.length > 0" class="records-list">
          <view
            v-for="record in assistanceRecords"
            :key="record.id"
            class="record-item"
            @click="viewRecordDetail(record)"
          >
            <!-- 记录头部 -->
            <view class="record-header">
              <view class="record-info">
                <text class="record-title">{{ record.title }}</text>
                <text class="record-type">{{ getServiceTypeText(record.serviceType) }}</text>
              </view>
              <view class="record-status" :class="getStatusClass(record.status)">
                <text class="status-text">{{ getStatusText(record.status) }}</text>
              </view>
            </view>
            
            <!-- 记录内容 -->
            <view class="record-content">
              <text class="record-description">{{ record.description || '暂无描述' }}</text>
              <view class="record-meta">
                <text class="record-time">{{ formatTime(record.createdAt) }}</text>
                <text v-if="record.amount" class="record-amount">金额：¥{{ record.amount }}</text>
              </view>
            </view>
            
            <!-- 操作按钮 -->
            <view class="record-actions">
              <view class="action-btn" @click.stop="viewRecordDetail(record)">
                <text class="action-text">查看详情</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-else class="empty-state">
          <!-- 帮扶图标 -->
          <image class="bangfu-icon" :src="config.staticBaseUrl + '/bangfu.png'" mode="aspectFit"></image>
          
          <!-- 标题文本 -->
          <text class="title-text">暂无帮扶记录</text>
          
          <!-- 描述文本 -->
          <text class="description-text">你暂时还没有接受过帮扶，
有需要可前往首页提交申请。</text>
        </view>
        
        <!-- 加载更多提示 -->
        <view v-if="assistanceRecords.length > 0" class="load-more">
          <view v-if="loading" class="load-more-loading">
            <view class="loading-spinner-small"></view>
            <text class="load-text">正在加载更多...</text>
          </view>
          <text v-else-if="!hasMore" class="load-text">已加载全部记录</text>
          <view v-else class="load-more-tip">
            <text class="load-text">上拉加载更多记录</text>
            <text class="load-hint">共 {{ assistanceRecords.length }} 条记录</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- iOS Home Indicator -->
    <!-- <view class="home-indicator"></view> -->
  </view>
</template>

<script>
import config from '@/config/index.js'
import youthAssistanceApi from '@/api/modules/youth-assistance.js'
import userApi from '@/api/modules/user.js'

export default {
  name: 'AssistanceRecords',
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      config: config,
      loading: false,
      refreshing: false,
      assistanceRecords: [],
      page: 1,
      pageSize: 20,
      hasMore: true,
      userInfo: null,
      retryCount: 0,
      maxRetries: 2
    }
  },

  onLoad() {
    this.initPage()
    this.loadAssistanceRecords(true)
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

    // 加载帮扶记录
    async loadAssistanceRecords(isRefresh = false) {
      if (this.loading) return
      
      if (isRefresh) {
        this.page = 1
        this.hasMore = true
        this.assistanceRecords = []
        this.retryCount = 0
      }
      
      this.loading = true
      
      try {
        // 并行获取用户信息和帮扶记录
        const [userInfoResult, recordsResult] = await Promise.allSettled([
          this.getUserInfo(),
          this.getAssistanceRecordsWithRetry()
        ])
        
        // 处理用户信息
        if (userInfoResult.status === 'fulfilled') {
          this.userInfo = userInfoResult.value
        }
        
        // 处理帮扶记录
        if (recordsResult.status === 'fulfilled') {
          const recordData = recordsResult.value.data || recordsResult.value
          const records = recordData.list || recordData.records || []
          
          // 处理数据格式，结合用户信息
          const formattedRecords = records.map(record => ({
            id: record.id || record.recordId,
            serviceType: record.serviceType || 'unknown',
            title: this.getRecordTitle(record),
            status: record.status || 'pending',
            createdAt: record.createdAt || record.createTime,
            description: record.description || record.remark,
            amount: record.amount || record.assistanceAmount,
            applicationId: record.applicationId,
            // 添加用户信息关联
            userName: this.userInfo?.nickname || '用户',
            userPhone: this.userInfo?.phone || ''
          }))
          
          if (isRefresh) {
            this.assistanceRecords = formattedRecords
          } else {
            this.assistanceRecords.push(...formattedRecords)
          }
          
          // 检查是否还有更多数据
          this.hasMore = records.length >= this.pageSize
          
          if (this.hasMore) {
            this.page++
          }
          
          console.log('帮扶记录加载成功:', formattedRecords)
          
        } else {
          throw recordsResult.reason
        }
        
      } catch (error) {
        console.error('获取帮扶记录失败:', error)
        await this.handleLoadError(error, isRefresh)
      } finally {
        this.loading = false
      }
    },

    // 获取用户信息（备用数据源）
    async getUserInfo() {
      try {
        const response = await userApi.getCurrentUser()
        return response.data || response
      } catch (error) {
        console.warn('获取用户信息失败，使用默认值:', error)
        return null
      }
    },

    // 带重试机制的获取帮扶记录
    async getAssistanceRecordsWithRetry() {
      try {
        return await youthAssistanceApi.getAssistanceRecords({
          page: this.page,
          size: this.pageSize,
          // 添加更多查询参数支持
          serviceType: '', // 可以根据需要筛选服务类型
          status: '' // 可以根据需要筛选状态
        })
      } catch (error) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++
          console.log(`重试获取帮扶记录，第${this.retryCount}次`)
          await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount))
          return this.getAssistanceRecordsWithRetry()
        }
        throw error
      }
    },

    // 处理加载错误
    async handleLoadError(error, isRefresh) {
      const errorMessage = this.getErrorMessage(error)
      
      // 如果是刷新操作且有重试次数，尝试使用备用方案
      if (isRefresh && this.retryCount < this.maxRetries) {
        try {
          // 尝试使用用户模块的相关API作为备用
          const fallbackData = await this.getFallbackData()
          if (fallbackData && fallbackData.length > 0) {
            this.assistanceRecords = fallbackData
            uni.showToast({
              title: '数据已从备用源加载',
              icon: 'success'
            })
            return
          }
        } catch (fallbackError) {
          console.error('备用数据源也失败:', fallbackError)
        }
      }
      
      // 显示错误提示
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
      
      // 如果是首次加载失败，显示重试按钮
      if (isRefresh && this.assistanceRecords.length === 0) {
        uni.showModal({
          title: '加载失败',
          content: '获取帮扶记录失败，是否重试？',
          success: (res) => {
            if (res.confirm) {
              this.retryCount = 0
              this.loadAssistanceRecords(true)
            }
          }
        })
      }
    },

    // 获取备用数据（模拟从其他API获取相关数据）
    async getFallbackData() {
      try {
        // 这里可以调用其他相关API获取数据
        // 例如从用户收藏、浏览历史等推断可能的帮扶记录
        const [favorites, history] = await Promise.allSettled([
          userApi.getFavorites({ type: 'assistance' }),
          userApi.getBrowseHistory({ type: 'assistance' })
        ])
        
        const fallbackRecords = []
        
        // 处理收藏数据
        if (favorites.status === 'fulfilled') {
          const favoriteData = favorites.value.data || favorites.value
          const favoriteList = favoriteData.list || []
          favoriteList.forEach(item => {
            if (item.targetType === 'assistance') {
              fallbackRecords.push({
                id: `fav_${item.id}`,
                serviceType: 'unknown',
                title: '收藏的帮扶服务',
                status: 'pending',
                createdAt: item.createdAt,
                description: '从收藏记录恢复的数据',
                amount: 0,
                applicationId: item.targetId
              })
            }
          })
        }
        
        return fallbackRecords
      } catch (error) {
        console.error('获取备用数据失败:', error)
        return []
      }
    },

    // 获取错误信息
    getErrorMessage(error) {
      if (error.code) {
        switch (error.code) {
          case 'NETWORK_ERROR':
            return '网络连接失败，请检查网络设置'
          case 'TIMEOUT':
            return '请求超时，请稍后重试'
          case 'UNAUTHORIZED':
            return '登录已过期，请重新登录'
          case 'FORBIDDEN':
            return '没有访问权限'
          case 'NOT_FOUND':
            return '请求的资源不存在'
          case 'SERVER_ERROR':
            return '服务器错误，请稍后重试'
          default:
            return error.message || '获取数据失败'
        }
      }
      return error.message || '获取帮扶记录失败'
    },

    // 获取记录标题
    getRecordTitle(record) {
      const serviceType = record.serviceType || 'unknown'
      const typeText = this.getServiceTypeText(serviceType)
      return record.title || `${typeText}记录`
    },

    // 获取服务类型文本
    getServiceTypeText(serviceType) {
      const typeMap = {
        'unemployment': '失业援助',
        'debt_relief': '债务纾困',
        'psychological_support': '心理支持',
        'legal_aid': '法律护航',
        'credit_repair': '信用修复'
      }
      return typeMap[serviceType] || '帮扶服务'
    },

    // 获取状态样式类
    getStatusClass(status) {
      switch (status) {
        case 'approved':
        case 'completed':
          return 'status-success'
        case 'pending':
          return 'status-pending'
        case 'rejected':
        case 'cancelled':
          return 'status-error'
        default:
          return 'status-default'
      }
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已拒绝',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || '未知状态'
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
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
      if (date.getDate() === yesterday.getDate()) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // 其他日期
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 刷新数据
    async refreshData() {
      try {
        // 重置重试计数
        this.retryCount = 0
        await this.loadAssistanceRecords(true)
        
        // 刷新成功提示
        if (this.assistanceRecords.length > 0) {
          uni.showToast({
            title: `已更新 ${this.assistanceRecords.length} 条记录`,
            icon: 'success',
            duration: 2000
          })
        }
      } catch (error) {
        console.error('刷新数据失败:', error)
      }
    },

    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await this.loadAssistanceRecords(true)
        
        // 下拉刷新成功反馈
        uni.vibrateShort()
      } finally {
        this.refreshing = false
      }
    },

    // 上拉加载更多
    onLoadMore() {
      if (!this.loading && this.hasMore && this.assistanceRecords.length > 0) {
        this.loadAssistanceRecords(false)
      }
    },

    // 格式化金额显示
    formatAmount(amount) {
      if (!amount || amount === 0) return ''
      return `¥${Number(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },

    // 获取记录优先级（用于排序）
    getRecordPriority(record) {
      const statusPriority = {
        'pending': 1,
        'approved': 2,
        'completed': 3,
        'rejected': 4,
        'cancelled': 5
      }
      return statusPriority[record.status] || 6
    },

    // 格式化记录数据
    formatRecordData(records) {
      return records
        .map(record => ({
          ...record,
          formattedAmount: this.formatAmount(record.amount),
          formattedTime: this.formatTime(record.createdAt),
          priority: this.getRecordPriority(record)
        }))
        .sort((a, b) => {
          // 按状态优先级和时间排序
          if (a.priority !== b.priority) {
            return a.priority - b.priority
          }
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
    },

    // 查看记录详情
    viewRecordDetail(record) {
      console.log('查看记录详情:', record)
      
      // 跳转到详情页面（可以是申请详情或记录详情）
      if (record.applicationId) {
        uni.navigateTo({
          url: `/pages/youth-assistance/application-detail/index?id=${record.applicationId}`
        })
      } else {
        uni.showToast({
          title: '详情页面开发中',
          icon: 'none'
        })
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.assistance-page {
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.status-bar {
  width: 100%;
  background: transparent;
  z-index: 10;
  position: relative;
}

.nav-section {
  padding: 20rpx 40rpx;
  z-index: 10;
  position: relative;
  
  .back-button {
    display: flex;
    align-items: center;
    
    .back-text {
      margin-left: 10rpx;
      font-size: 32rpx;
      color: #007AFF;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
      font-weight: 400;
    }
  }
}

.scroll-container {
  flex: 1;
  z-index: 10;
  position: relative;
}

.content-wrapper {
  padding: 20rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #007AFF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 30rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #333333;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    font-weight: 500;
    margin-bottom: 10rpx;
  }
  
  .loading-subtitle {
    font-size: 24rpx;
    color: #999999;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    text-align: center;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.records-list {
  .record-item {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10rpx);
    
    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;
      
      .record-info {
        flex: 1;
        
        .record-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #333333;
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .record-type {
          font-size: 24rpx;
          color: #666666;
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        }
      }
      
      .record-status {
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        
        .status-text {
          font-size: 22rpx;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        }
        
        &.status-success {
          background: #E8F5E8;
          .status-text {
            color: #52C41A;
          }
        }
        
        &.status-pending {
          background: #FFF7E6;
          .status-text {
            color: #FA8C16;
          }
        }
        
        &.status-error {
          background: #FFF2F0;
          .status-text {
            color: #FF4D4F;
          }
        }
        
        &.status-default {
          background: #F5F5F5;
          .status-text {
            color: #999999;
          }
        }
      }
    }
    
    .record-content {
      margin-bottom: 20rpx;
      
      .record-description {
        font-size: 28rpx;
        color: #666666;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        line-height: 1.5;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .record-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .record-time {
          font-size: 24rpx;
          color: #999999;
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        }
        
        .record-amount {
          font-size: 26rpx;
          color: #FF6B35;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        }
      }
    }
    
    .record-actions {
      display: flex;
      justify-content: flex-end;
      
      .action-btn {
        padding: 12rpx 24rpx;
        background: #007AFF;
        border-radius: 20rpx;
        
        .action-text {
          font-size: 24rpx;
          color: #FFFFFF;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 60rpx;
  
  .bangfu-icon {
    width: 400rpx;
    height: 400rpx;
    margin-bottom: -100rpx;
  }
  
  .title-text {
    font-size: 44rpx;
    font-weight: 600;
    color: #333333;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    margin-bottom: 30rpx;
    text-align: center;
  }
  
  .description-text {
    font-size: 28rpx;
    font-weight: 400;
    color: #000;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    text-align: center;
    line-height: 1.5;
    max-width: 500rpx;
  }
}

.load-more {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40rpx 0;
  
  .load-more-loading {
    display: flex;
    align-items: center;
    
    .loading-spinner-small {
      width: 32rpx;
      height: 32rpx;
      border: 2rpx solid #f3f3f3;
      border-top: 2rpx solid #007AFF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 16rpx;
    }
  }
  
  .load-more-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .load-hint {
      font-size: 22rpx;
      color: #CCCCCC;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
      margin-top: 8rpx;
    }
  }
  
  .load-text {
    font-size: 26rpx;
    color: #999999;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  }
}

.home-indicator {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 268rpx;
  height: 8rpx;
  background: #000000;
  border-radius: 4rpx;
  z-index: 10;
}
</style>
