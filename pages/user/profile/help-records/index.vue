<template>
  <view class="help-records-page" :style="{ background: 'url(' + config.staticBaseUrl + '/bg10.png) no-repeat center center / cover' }">
    <!-- 自定义状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 导航区域 -->
    <view class="nav-section">
      <!-- 返回按钮 -->
      <view class="back-button" @click="goBack">
        <uv-icon name="arrow-left" color="#2979FF" size="32"></uv-icon>
        <text class="back-text">返回</text>
      </view>
      
      <!-- 页面标题 -->
      <text class="page-title">我的帮扶记录</text>
    </view>
    
    <!-- 滚动容器 -->
    <scroll-view 
      class="scroll-container" 
      scroll-y="true" 
      :style="{ height: scrollHeight + 'px' }"
      enable-back-to-top="true"
      show-scrollbar="false"
    >
      <!-- 加载状态 -->
      <view v-if="loading && helpRecords.length === 0" class="loading-container">
        <uv-loading-icon mode="flower" size="40" color="#2979FF"></uv-loading-icon>
        <text class="loading-text">正在加载帮扶记录...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="!loading && helpRecords.length === 0" class="empty-container">
        <image
          :src="config.staticBaseUrl + '/empty-help-records.png'"
          mode="aspectFit"
          class="empty-image"
        />
        <text class="empty-title">暂无帮扶记录</text>
        <text class="empty-desc">您还没有申请过任何帮扶服务</text>
        <view class="empty-action" @click="goToAssistance">
          <text class="action-text">去申请帮扶</text>
        </view>
      </view>
      
      <!-- 帮扶记录列表 -->
      <view v-else class="records-list">
        <view
          v-for="(record, index) in helpRecords"
          :key="record.id"
          class="record-card"
          @click="handleRecordClick(record)"
        >
          <!-- 卡片顶部：日期时间和状态 -->
          <view class="card-header">
            <text class="record-date">{{ record.date }}</text>
            <text 
              class="record-status" 
              :class="record.status === 'reviewing' ? 'status-reviewing' : 'status-completed'"
            >
              {{ record.statusText }}
            </text>
          </view>
          
          <!-- 卡片内容：图标和标题 -->
          <view class="card-content">
            <!-- 服务图标容器 -->
            <view class="service-icon-container">
              <view class="service-icon">
                <image
                  :src="config.staticBaseUrl + '/icons/' + record.iconName + '.png'"
                  mode="aspectFit"
                  style="width: 40rpx; height: 40rpx;"
                />
              </view>
            </view>
            
            <!-- 服务标题 -->
            <text class="service-title">{{ record.title }}</text>
          </view>
        </view>
        
        <!-- 加载更多状态 -->
        <view v-if="loadingMore" class="loading-more">
          <uv-loading-icon mode="flower" size="24" color="#2979FF"></uv-loading-icon>
          <text class="loading-more-text">加载更多...</text>
        </view>
        
        <!-- 没有更多数据 -->
        <view v-else-if="!hasMore && helpRecords.length > 0" class="no-more">
          <text class="no-more-text">没有更多记录了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { getMyHelpRecords } from '@/api/modules/personal-center.js'
import { getAssistanceRecords } from '@/api/modules/youth-assistance.js'
import { getCurrentUser, getFavorites } from '@/api/modules/user.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      config: config,
      helpRecords: [],
      loading: false,
      refreshing: false,
      loadingMore: false,
      hasMore: true,
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      statusFilter: '', // 状态筛选
      retryCount: 0,
      maxRetries: 3
    }
  },
  onLoad() {
    this.initPage()
    this.loadHelpRecords()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  onReachBottom() {
    this.loadMoreRecords()
  },
  methods: {
    // 初始化页面
    initPage() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      
      // 计算滚动容器高度：屏幕高度 - 状态栏 - 导航区域
      const navHeight = 100 // 导航区域高度，单位px
      this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - navHeight
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 加载帮助记录
    async loadHelpRecords(isRefresh = false) {
      if (this.loading && !isRefresh) return
      
      this.loading = true
      if (isRefresh) {
        this.refreshing = true
        this.currentPage = 1
        this.hasMore = true
      }
      
      try {
        console.log(`[帮助记录] 开始加载第${this.currentPage}页数据`)
        
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }
        
        if (this.statusFilter) {
          params.status = this.statusFilter
        }
        
        const response = await this.loadRecordsWithFallback(params)
        const data = response.data || response
        
        const records = data.records || data.list || []
        const formattedRecords = this.formatRecords(records)
        
        if (isRefresh) {
          this.helpRecords = formattedRecords
        } else {
          this.helpRecords = [...this.helpRecords, ...formattedRecords]
        }
        
        this.totalCount = data.total || data.totalCount || 0
        this.hasMore = formattedRecords.length === this.pageSize && this.helpRecords.length < this.totalCount
        
        console.log(`[帮助记录] 加载成功，当前共${this.helpRecords.length}条记录`)
        
        this.retryCount = 0 // 重置重试计数
        
      } catch (error) {
        console.error('[帮助记录] 加载失败:', error)
        this.handleLoadError(error, isRefresh)
      } finally {
        this.loading = false
        this.refreshing = false
        if (isRefresh) {
          uni.stopPullDownRefresh()
        }
      }
    },
    
    // 多源数据加载策略
    async loadRecordsWithFallback(params) {
      try {
        // 主要数据源：个人中心帮助记录API
        console.log('[帮助记录] 使用主要数据源: getMyHelpRecords')
        return await getMyHelpRecords(params)
      } catch (error) {
        console.warn('[帮助记录] 主要数据源失败，尝试备用数据源:', error)
        
        try {
          // 备用数据源1：青年帮扶记录API
          console.log('[帮助记录] 使用备用数据源1: getAssistanceRecords')
          return await getAssistanceRecords(params)
        } catch (fallbackError) {
          console.warn('[帮助记录] 备用数据源1失败:', fallbackError)
        }
        
        try {
          // 备用数据源2：用户信息中的帮助记录
          console.log('[帮助记录] 使用备用数据源2: getCurrentUser')
          const userResponse = await getCurrentUser()
          const userData = userResponse.data || userResponse
          
          if (userData.assistanceRecords) {
            return {
              data: {
                records: userData.assistanceRecords,
                total: userData.assistanceRecords.length
              }
            }
          }
        } catch (fallbackError2) {
          console.warn('[帮助记录] 备用数据源2失败:', fallbackError2)
        }
        
        try {
          // 备用数据源3：从收藏记录中提取帮助相关记录
          console.log('[帮助记录] 使用备用数据源3: getFavorites')
          const favoritesResponse = await getFavorites({ type: 'assistance' })
          const favoritesData = favoritesResponse.data || favoritesResponse
          
          if (favoritesData.list) {
            const assistanceRecords = favoritesData.list.filter(item =>
              item.targetType === 'assistance' || item.type === 'help'
            )
            
            return {
              data: {
                records: assistanceRecords,
                total: assistanceRecords.length
              }
            }
          }
        } catch (fallbackError3) {
          console.warn('[帮助记录] 备用数据源3失败:', fallbackError3)
        }
        
        // 所有数据源都失败，抛出原始错误
        throw error
      }
    },
    
    // 格式化记录数据
    formatRecords(records) {
      return records.map(record => {
        const formattedRecord = {
          id: record.id || record.recordId || Date.now() + Math.random(),
          type: record.serviceType || record.type || 'unknown',
          title: this.getRecordTitle(record),
          status: record.status || 'unknown',
          statusText: this.getStatusText(record.status),
          date: this.formatDate(record.createTime || record.createdAt || record.date),
          iconName: this.getIconName(record.serviceType || record.type),
          amount: record.amount || record.assistanceAmount || 0,
          description: record.description || record.remark || ''
        }
        
        return formattedRecord
      })
    },
    
    // 获取记录标题
    getRecordTitle(record) {
      const typeMap = {
        'credit-recovery': '信用逾期恢复',
        'credit_repair': '信用修复',
        'debt-relief': '债务纾困',
        'debt_relief': '债务纾困',
        'unemployment': '失业援助',
        'unemployment-assistance': '失业援助',
        'psychological-support': '心理支持',
        'psychological_support': '心理支持',
        'legal-aid': '法律护航',
        'legal_aid': '法律护航',
        'lawyer-consultation': '律师咨询',
        'psychological-consultation': '心理咨询'
      }
      
      return record.title || typeMap[record.serviceType] || typeMap[record.type] || '帮扶服务'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待审核',
        'reviewing': '审核中',
        'approved': '已通过',
        'completed': '已完成',
        'rejected': '已拒绝',
        'cancelled': '已取消',
        'processing': '处理中'
      }
      
      return statusMap[status] || '未知状态'
    },
    
    // 获取图标名称
    getIconName(type) {
      const iconMap = {
        'credit-recovery': 'huifu',
        'credit_repair': 'huifu',
        'debt-relief': 'debt',
        'debt_relief': 'debt',
        'unemployment': 'work',
        'unemployment-assistance': 'work',
        'psychological-support': 'xinli',
        'psychological_support': 'xinli',
        'legal-aid': 'legal2',
        'legal_aid': 'legal2',
        'lawyer-consultation': 'legal2',
        'psychological-consultation': 'xinli'
      }
      
      return iconMap[type] || 'help'
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '未知时间'
      
      try {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        
        return `${year}年${month}月${day}日 ${hours}:${minutes}`
      } catch (error) {
        console.warn('[帮助记录] 日期格式化失败:', error)
        return String(dateStr)
      }
    },
    
    // 处理加载错误
    handleLoadError(error, isRefresh) {
      this.retryCount++
      
      let errorMsg = '加载失败'
      let shouldRetry = true
      
      // 根据错误类型分类处理
      if (error.code === 401) {
        errorMsg = '登录已过期，请重新登录'
        shouldRetry = false
      } else if (error.code === 403) {
        errorMsg = '权限不足，无法访问'
        shouldRetry = false
      } else if (error.code === 404) {
        errorMsg = '接口不存在'
        shouldRetry = false
      } else if (error.code === 500) {
        errorMsg = '服务器错误，请稍后重试'
      } else if (error.code === 502 || error.code === 503) {
        errorMsg = '服务暂时不可用，请稍后重试'
      } else if (error.message) {
        errorMsg = error.message
      }
      
      if (this.retryCount < this.maxRetries && !isRefresh && shouldRetry) {
        // 指数退避重试策略
        const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000)
        console.log(`[帮助记录] 第${this.retryCount}次重试，延迟${retryDelay}ms`)
        
        setTimeout(() => {
          this.loadHelpRecords()
        }, retryDelay)
      } else {
        // 显示错误提示
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        })
        
        // 如果是首次加载失败，显示空状态
        if (this.helpRecords.length === 0) {
          this.helpRecords = []
        }
      }
    },
    
    // 刷新数据
    async refreshData() {
      console.log('[帮助记录] 开始刷新数据')
      await this.loadHelpRecords(true)
    },
    
    // 加载更多记录
    async loadMoreRecords() {
      if (this.loadingMore || !this.hasMore || this.loading) return
      
      this.loadingMore = true
      this.currentPage++
      
      try {
        await this.loadHelpRecords()
      } catch (error) {
        this.currentPage-- // 回退页码
      } finally {
        this.loadingMore = false
      }
    },
    
    // 处理记录点击
    handleRecordClick(record) {
      console.log('[帮助记录] 点击记录:', record)
      
      // 显示记录详情
      const content = `类型：${record.title}\n状态：${record.statusText}\n时间：${record.date}`
      
      uni.showModal({
        title: '帮扶记录详情',
        content: content,
        showCancel: false,
        confirmText: '知道了'
      })
      
      // 根据记录类型跳转到对应详情页面
      // uni.navigateTo({ url: `/pages/user/help-detail/index?id=${record.id}&type=${record.type}` })
    },
    
    // 跳转到青年帮扶页面
    goToAssistance() {
      console.log('[帮助记录] 跳转到青年帮扶页面')
      uni.navigateTo({
        url: '/pages/youth-assistance/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.help-records-page {
  width: 100%;
  height: 100vh;
}

.status-bar {
  width: 100%;
  background: transparent;
}

.nav-section {
  padding: 75rpx 40rpx 20rpx 40rpx;
  
  .back-button {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .back-text {
      margin-left: 8rpx;
      font-size: 32rpx;
      color: #2979FF;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    }
  }
  
  .page-title {
    font-size: 44rpx;
    // font-weight: bold;
    color: #333333;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    margin-left: 10rpx;
  }
}

.scroll-container {
  width: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.records-list {
  padding-bottom: 40rpx;
}

.record-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  padding: 30rpx 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .record-date {
      font-size: 24rpx;
      color: #888888;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    }
    
    .record-status {
      font-size: 24rpx;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
      
      &.status-reviewing {
        color: #2979FF;
      }
      
      &.status-completed {
        color: #4CAF50;
      }
    }
  }
  
  .card-content {
    display: flex;
    align-items: center;
    
    .service-icon-container {
      margin-right: 24rpx;
      
      .service-icon {
        width: 80rpx;
        height: 80rpx;
        background: #E3F2FD;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .service-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    }
  }
}

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

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.empty-desc {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 60rpx;
  text-align: center;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.empty-action {
  background: #2979FF;
  border-radius: 50rpx;
  padding: 24rpx 60rpx;
  
  .action-text {
    font-size: 28rpx;
    color: #FFFFFF;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  }
}

/* 加载更多样式 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.loading-more-text {
  margin-left: 20rpx;
  font-size: 26rpx;
  color: #666666;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

/* 没有更多数据样式 */
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.no-more-text {
  font-size: 26rpx;
  color: #999999;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}
</style>