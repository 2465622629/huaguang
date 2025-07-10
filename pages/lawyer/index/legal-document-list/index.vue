<template>
  <view class="container" :style="backgroundStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <!-- 返回按钮 -->
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" :size="16" color="#007AFF"></uv-icon>
          <text class="back-text">返回</text>
        </view>
        
        <!-- 页面标题 -->
        <text class="page-title">法律文书列表</text>
      </view>
    </view>
    
    <!-- 主内容区域 -->
    <view class="content-area">
      <!-- 筛选标签栏 -->
      <view class="filter-tabs">
        <view
          v-for="(tab, index) in filterTabs"
          :key="index"
          class="filter-tab"
          :class="{ active: currentFilter === tab.value }"
          @click="onFilterChange(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>
      
      <!-- 搜索框 -->
      <view class="search-container">
        <view class="search-input-wrapper">
          <uv-icon name="search" :size="16" color="#999999" class="search-icon"></uv-icon>
          <input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索文书标题或内容"
            @input="onSearchInput"
            @confirm="onSearch"
          />
          <view v-if="searchKeyword" class="clear-btn" @click="onSearchClear">
            <uv-icon name="close-circle-fill" :size="16" color="#CCCCCC"></uv-icon>
          </view>
        </view>
      </view>
      
      <scroll-view
        class="document-list"
        scroll-y="true"
        :style="{ height: scrollViewHeight + 'px' }"
        enable-back-to-top="true"
        show-scrollbar="false"
        @scrolltolower="onLoadMore"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
      >
        <!-- 加载状态 -->
        <view v-if="isLoading && documentList.length === 0" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">正在加载文书列表...</text>
        </view>
        
        <!-- 文书列表项 -->
        <view
          v-for="(document, index) in documentList"
          :key="document.id"
          class="document-card"
          @click="handleCardClick(document)"
        >
          <!-- 左侧内容 -->
          <view class="card-content">
            <view class="document-header">
              <text class="document-title">{{ document.title }}</text>
              <view class="document-status" :class="getStatusClass(document.status)">
                {{ getStatusText(document.status) }}
              </view>
            </view>
            <view class="document-info">
              <text class="document-type">{{ document.type || '民事起诉状' }}</text>
              <text class="document-date">{{ formatDateTime(document.createTime) }}</text>
            </view>
          </view>
          
          <!-- 右侧箭头 -->
          <view class="card-right">
            <uv-icon name="arrow-right" :size="12" color="#CCCCCC" class="arrow-icon"></uv-icon>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="!isLoading && documentList.length === 0" class="empty-container">
          <uv-icon name="file-text" :size="48" color="#CCCCCC" class="empty-icon"></uv-icon>
          <text class="empty-text">暂无法律文书</text>
          <text class="empty-desc">您还没有创建任何法律文书</text>
        </view>
        
        <!-- 加载更多状态 -->
        <view v-if="isLoadingMore" class="loading-more">
          <view class="loading-spinner small"></view>
          <text class="loading-more-text">加载更多...</text>
        </view>
        
        <!-- 没有更多数据 -->
        <view v-if="!hasMore && documentList.length > 0" class="no-more">
          <text class="no-more-text">没有更多数据了</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 律师标签栏 -->
    <lawyer-tabbar></lawyer-tabbar>
  </view>
</template>

<script>
import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'
import { getLegalDocumentList, recordLegalDocumentView } from '@/api/modules/lawyer-workspace.js'

export default {
  components: {
    LawyerTabbar
  },
  data() {
    return {
      scrollViewHeight: 400, // 滚动容器高度，单位px
      statusBarHeight: 44, // 状态栏高度，单位px
      
      // 文书列表数据
      documentList: [],
      
      // 筛选和搜索
      filterTabs: [
        { label: '全部', value: 'all' },
        { label: '草稿', value: 'draft' },
        { label: '待审核', value: 'pending' },
        { label: '已通过', value: 'approved' },
        { label: '已驳回', value: 'rejected' }
      ],
      currentFilter: 'all',
      searchKeyword: '',
      searchTimer: null,
      
      // 分页和加载状态
      currentPage: 1,
      pageSize: 10,
      hasMore: true,
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      
      // 缓存管理
      cacheKey: 'legal_document_list_cache',
      cacheExpireTime: 5 * 60 * 1000, // 5分钟缓存过期时间
      
      // 重试机制
      maxRetries: 3,
      retryDelay: 1000
    }
  },
  
  async mounted() {
    this.calculateScrollViewHeight()
    await this.loadDocumentList()
  },
  
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: 'url(' + staticBaseUrl + '/bg10.png)'
      }
    }
  },
  
  methods: {
    // 计算滚动容器高度
    calculateScrollViewHeight() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 44
      const navbarHeight = 88 // 自定义导航栏高度
      const filterTabsHeight = 60 // 筛选标签栏高度
      const searchHeight = 60 // 搜索框高度
      const tabBarHeight = 80 // uv-tabbar标签栏高度
      
      this.scrollViewHeight = systemInfo.windowHeight - this.statusBarHeight - navbarHeight - filterTabsHeight - searchHeight - tabBarHeight
    },
    
    // 加载文书列表
    async loadDocumentList(isRefresh = false, isLoadMore = false) {
      if (this.isLoading && !isRefresh && !isLoadMore) return
      
      try {
        if (isRefresh) {
          this.isRefreshing = true
          this.currentPage = 1
          this.hasMore = true
        } else if (isLoadMore) {
          if (!this.hasMore || this.isLoadingMore) return
          this.isLoadingMore = true
          this.currentPage++
        } else {
          this.isLoading = true
          // 尝试从缓存获取数据
          const cachedData = this.getCachedData()
          if (cachedData) {
            this.documentList = cachedData
            this.isLoading = false
            return
          }
        }
        
        const params = {
          status: this.currentFilter === 'all' ? undefined : this.currentFilter,
          keyword: this.searchKeyword || undefined,
          page: this.currentPage,
          size: this.pageSize
        }
        
        const response = await this.callApiWithRetry(() => getLegalDocumentList(params))
        const newDocuments = this.formatDocumentList(response.data?.list || response.data || [])
        
        if (isRefresh || (!isLoadMore && this.currentPage === 1)) {
          this.documentList = newDocuments
        } else if (isLoadMore) {
          this.documentList = [...this.documentList, ...newDocuments]
        }
        
        // 更新分页状态
        const total = response.data?.total || newDocuments.length
        this.hasMore = this.documentList.length < total && newDocuments.length === this.pageSize
        
        // 缓存数据（仅首页全部数据）
        if (this.currentPage === 1 && this.currentFilter === 'all' && !this.searchKeyword) {
          this.setCachedData(this.documentList)
        }
        
      } catch (error) {
        console.error('加载文书列表失败:', error)
        this.handleLoadError(error, isRefresh, isLoadMore)
      } finally {
        this.isLoading = false
        this.isLoadingMore = false
        this.isRefreshing = false
      }
    },
    
    // 智能指数退避重试机制
    async callApiWithRetry(apiCall, retryCount = 0) {
      try {
        return await apiCall()
      } catch (error) {
        if (retryCount < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, retryCount) + Math.random() * 1000
          console.log(`API调用失败，${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试...`)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.callApiWithRetry(apiCall, retryCount + 1)
        }
        throw error
      }
    },
    
    // 处理加载错误
    handleLoadError(error, isRefresh, isLoadMore) {
      let errorMessage = '加载失败，请重试'
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络'
      } else if (error.status === 401) {
        errorMessage = '登录已过期，请重新登录'
      } else if (error.status === 403) {
        errorMessage = '权限不足，无法访问'
      } else if (error.status >= 500) {
        errorMessage = '服务器错误，请稍后重试'
      }
      
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000
      })
      
      // 如果是首次加载失败，尝试使用缓存数据
      if (!isRefresh && !isLoadMore && this.documentList.length === 0) {
        const cachedData = this.getCachedData(true) // 允许过期缓存
        if (cachedData && cachedData.length > 0) {
          this.documentList = cachedData
          uni.showToast({
            title: '已加载缓存数据',
            icon: 'none',
            duration: 1500
          })
        }
      }
    },
    
    // 格式化文书列表数据
    formatDocumentList(rawList) {
      return rawList.map(item => ({
        id: item.id || item.documentId,
        title: item.title || item.documentTitle || '未命名文书',
        type: item.type || item.documentType || '民事起诉状',
        status: this.normalizeStatus(item.status),
        createTime: item.createTime || item.createdAt || new Date().toISOString(),
        updateTime: item.updateTime || item.updatedAt,
        author: item.author || item.createdBy,
        description: item.description || item.summary
      }))
    },
    
    // 标准化状态值
    normalizeStatus(status) {
      const statusMap = {
        'DRAFT': 'draft',
        'PENDING': 'pending',
        'APPROVED': 'approved',
        'REJECTED': 'rejected',
        '草稿': 'draft',
        '待审核': 'pending',
        '已通过': 'approved',
        '已驳回': 'rejected'
      }
      return statusMap[status] || status || 'draft'
    },
    
    // 获取状态显示文本
    getStatusText(status) {
      const statusTextMap = {
        'draft': '草稿',
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已驳回'
      }
      return statusTextMap[status] || '未知'
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      return `status-${status}`
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      
      try {
        const date = new Date(dateTime)
        const now = new Date()
        const diff = now - date
        
        // 1小时内显示相对时间
        if (diff < 60 * 60 * 1000) {
          const minutes = Math.floor(diff / (60 * 1000))
          return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
        }
        
        // 24小时内显示小时
        if (diff < 24 * 60 * 60 * 1000) {
          const hours = Math.floor(diff / (60 * 60 * 1000))
          return `${hours}小时前`
        }
        
        // 超过24小时显示具体日期
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        
        const currentYear = now.getFullYear()
        if (year === currentYear) {
          return `${month}月${day}日 ${hour}:${minute}`
        } else {
          return `${year}年${month}月${day}日 ${hour}:${minute}`
        }
      } catch (error) {
        console.error('日期格式化失败:', error)
        return String(dateTime)
      }
    },
    
    // 缓存管理
    getCachedData(allowExpired = false) {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        if (!cached) return null
        
        const { data, timestamp } = cached
        const isExpired = Date.now() - timestamp > this.cacheExpireTime
        
        if (isExpired && !allowExpired) {
          uni.removeStorageSync(this.cacheKey)
          return null
        }
        
        return data
      } catch (error) {
        console.error('获取缓存数据失败:', error)
        return null
      }
    },
    
    setCachedData(data) {
      try {
        uni.setStorageSync(this.cacheKey, {
          data,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('设置缓存数据失败:', error)
      }
    },
    
    // 筛选切换
    async onFilterChange(filterValue) {
      if (this.currentFilter === filterValue) return
      
      this.currentFilter = filterValue
      this.currentPage = 1
      this.hasMore = true
      await this.loadDocumentList()
    },
    
    // 搜索输入
    onSearchInput() {
      // 防抖处理
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      
      this.searchTimer = setTimeout(() => {
        this.onSearch()
      }, 300)
    },
    
    // 执行搜索
    async onSearch() {
      this.currentPage = 1
      this.hasMore = true
      await this.loadDocumentList()
    },
    
    // 清除搜索
    async onSearchClear() {
      this.searchKeyword = ''
      await this.onSearch()
    },
    
    // 下拉刷新
    async onRefresh() {
      await this.loadDocumentList(true)
    },
    
    // 上拉加载更多
    async onLoadMore() {
      await this.loadDocumentList(false, true)
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 处理卡片点击
    async handleCardClick(document) {
      try {
        // 记录文档查看
        await recordLegalDocumentView(document.id)
        
        // 跳转到文书详情页
        uni.navigateTo({
          url: `/pages/lawyer/index/arbitration-review/index?documentId=${document.id}&title=${encodeURIComponent(document.title)}`
        })
      } catch (error) {
        console.error('记录文档查看失败:', error)
        // 即使记录失败也要跳转
        uni.navigateTo({
          url: `/pages/lawyer/index/arbitration-review/index?documentId=${document.id}&title=${encodeURIComponent(document.title)}`
        })
      }
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
  position: relative;
  overflow: hidden;
}

/* 状态栏占位 */
.status-bar {
  width: 100%;
  background: transparent;
}

/* 自定义导航栏 */
.custom-navbar {
  width: 100%;
  padding: 0 20rpx;
  background: transparent;
  
  .navbar-content {
    width: 100%;
    padding: 20rpx 0;
    
    .back-button {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .back-text {
        font-size: 32rpx;
        color: #007AFF;
        margin-left: 8rpx;
        font-weight: 400;
      }
    }
    
    .page-title {
      font-size: 48rpx;
      color: #333333;
      font-weight: bold;
      line-height: 1.2;
      margin: 40rpx 0;
      display: flex;
    }
  }
}

/* 主内容区域 */
.content-area {
  flex: 1;
  padding: 0 20rpx;
  
  /* 筛选标签栏 */
  .filter-tabs {
    display: flex;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 15rpx;
    padding: 8rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    
    .filter-tab {
      flex: 1;
      text-align: center;
      padding: 16rpx 12rpx;
      font-size: 26rpx;
      color: #666666;
      border-radius: 10rpx;
      transition: all 0.3s ease;
      
      &.active {
        background: #007AFF;
        color: #FFFFFF;
        font-weight: 500;
      }
      
      &:not(.active):active {
        background: rgba(0, 122, 255, 0.1);
      }
    }
  }
  
  /* 搜索框 */
  .search-container {
    margin-bottom: 20rpx;
    
    .search-input-wrapper {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 15rpx;
      padding: 20rpx 24rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
      
      .search-icon {
        margin-right: 16rpx;
        opacity: 0.6;
      }
      
      .search-input {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
        background: transparent;
        border: none;
        outline: none;
        
        &::placeholder {
          color: #999999;
        }
      }
      
      .clear-btn {
        margin-left: 16rpx;
        padding: 8rpx;
        opacity: 0.6;
        
        &:active {
          opacity: 1;
        }
      }
    }
  }
  
  .document-list {
    width: 100%;
    
    /* 加载状态 */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80rpx 40rpx;
      
      .loading-spinner {
        width: 60rpx;
        height: 60rpx;
        border: 4rpx solid #E5E5E5;
        border-top: 4rpx solid #007AFF;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20rpx;
        
        &.small {
          width: 40rpx;
          height: 40rpx;
          border-width: 3rpx;
        }
      }
      
      .loading-text {
        font-size: 26rpx;
        color: #666666;
      }
    }
    
    /* 空状态 */
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 120rpx 40rpx;
      
      .empty-icon {
        margin-bottom: 30rpx;
        opacity: 0.6;
      }
      
      .empty-text {
        font-size: 32rpx;
        color: #666666;
        margin-bottom: 16rpx;
        font-weight: 500;
      }
      
      .empty-desc {
        font-size: 26rpx;
        color: #999999;
        text-align: center;
        line-height: 1.4;
      }
    }
    
    /* 加载更多状态 */
    .loading-more {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40rpx;
      
      .loading-more-text {
        font-size: 24rpx;
        color: #666666;
        margin-left: 16rpx;
      }
    }
    
    /* 没有更多数据 */
    .no-more {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40rpx;
      
      .no-more-text {
        font-size: 24rpx;
        color: #999999;
        position: relative;
        
        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 60rpx;
          height: 1rpx;
          background: #E5E5E5;
        }
        
        &::before {
          right: 100%;
          margin-right: 20rpx;
        }
        
        &::after {
          left: 100%;
          margin-left: 20rpx;
        }
      }
    }
    
    .document-card {
      background: rgb(255, 255, 255);
      border-radius: 20rpx;
      margin-bottom: 35rpx;
      padding: 40rpx 40rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
        box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.12);
      }
      
      .card-content {
        flex: 1;
        
        .document-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16rpx;
          
          .document-title {
            flex: 1;
            font-size: 30rpx;
            color: #333333;
            font-weight: 500;
            line-height: 1.4;
            margin-right: 20rpx;
          }
          
          .document-status {
            padding: 8rpx 16rpx;
            border-radius: 8rpx;
            font-size: 22rpx;
            font-weight: 500;
            white-space: nowrap;
            
            &.status-draft {
              background: #F0F0F0;
              color: #666666;
            }
            
            &.status-pending {
              background: #FFF3E0;
              color: #FF9800;
            }
            
            &.status-approved {
              background: #E8F5E8;
              color: #4CAF50;
            }
            
            &.status-rejected {
              background: #FFEBEE;
              color: #F44336;
            }
          }
        }
        
        .document-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          
          .document-type {
            font-size: 24rpx;
            color: #007AFF;
            background: rgba(0, 122, 255, 0.1);
            padding: 6rpx 12rpx;
            border-radius: 6rpx;
            margin-right: 20rpx;
          }
          
          .document-date {
            font-size: 24rpx;
            color: #999999;
            flex: 1;
            text-align: right;
          }
        }
      }
      
      .card-right {
        margin-left: 20rpx;
        
        .arrow-icon {
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }
      }
      
      &:active .card-right .arrow-icon {
        opacity: 0.8;
      }
    }
  }
}

/* 加载动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 