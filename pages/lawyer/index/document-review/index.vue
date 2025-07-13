<template>
  <view class="container">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <!-- 返回按钮 -->
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" :size="16" color="#4A90E2"></uv-icon>
          <text class="back-text">返回</text>
        </view>
        
        <!-- 页面标题 -->
        <text class="page-title">法律文书审核列表</text>
      </view>
    </view>
    
    <!-- 筛选标签栏 -->
    <view class="filter-tabs">
      <view 
        v-for="(tab, index) in filterTabs" 
        :key="index"
        class="tab-item" 
        :class="{ 'tab-active': currentTab === index }"
        @click="handleTabChange(index)"
      >
        <text class="tab-text" :class="{ 'tab-text-active': currentTab === index }">
          {{ tab.name }}
        </text>
      </view>
    </view>
    
    <!-- 文书列表区域 -->
    <view class="content-area">
      <scroll-view 
        class="document-list" 
        scroll-y="true" 
        :style="{ height: scrollViewHeight + 'px' }"
        enable-back-to-top="true"
        show-scrollbar="false"
        @scrolltolower="loadMore"
      >
        <!-- 文书列表项 -->
        <view 
          v-for="(document, index) in filteredDocuments" 
          :key="document.id"
          class="document-card"
          @click="goToDocumentDetail(document)"
        >
          <!-- 左侧内容 -->
          <view class="card-content">
            <text class="document-title">{{ document.title }}</text>
            <text class="document-date">{{ document.createTime }}</text>
          </view>
          
          <!-- 右侧状态和箭头 -->
          <view class="card-right">
            <view class="status-tag" :class="getStatusClass(document.status)">
              <text class="status-text">{{ getStatusText(document.status) }}</text>
            </view>
            <uv-icon name="arrow-right" :size="12" color="#CCCCCC" class="arrow-icon"></uv-icon>
          </view>
        </view>
        
        <!-- 加载更多提示 -->
        <view v-if="loading" class="loading-tip">
          <text class="loading-text">加载中...</text>
        </view>
        
        <view v-if="!hasMore && filteredDocuments.length > 0" class="no-more-tip">
          <text class="no-more-text">没有更多数据了</text>
        </view>
        
        <!-- 空状态 -->
        <view v-if="filteredDocuments.length === 0 && !loading" class="empty-state">
          <text class="empty-text">暂无文书数据</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'
import { getDocumentReviewList } from '@/api/modules/lawyer-workspace.js'

export default {
  data() {
    return {
      currentTab: 0,
      scrollViewHeight: 400,
      loading: false,
      hasMore: true,
      page: 1,
      pageSize: 10,
      retryCount: 0,
      maxRetries: 3,
      
      // 筛选标签
      filterTabs: [
        { name: '全部', value: 'all' },
        { name: '待审核', value: 'pending_review' },
        { name: '已通过', value: 'approved' },
        { name: '已驳回', value: 'rejected' }
      ],
      
      // 文书列表数据
      documentList: [],
      
      // 缓存相关
      cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
      lastCacheTime: 0
    }
  },
  
  computed: {
    // 显示的文书列表（结合API筛选和前端筛选）
    filteredDocuments() {
      console.log('当前标签索引:', this.currentTab)
      console.log('文档列表数据:', this.documentList)
      
      // 如果是"全部"标签，直接返回所有数据
      if (this.currentTab === 0) {
        console.log('显示全部数据')
        return this.documentList
      }
      
      // 获取当前筛选条件
      const currentFilter = this.filterTabs[this.currentTab].value
      console.log('当前筛选条件:', currentFilter)
      
      // 前端筛选作为后备方案（API筛选失败时使用）
      const filtered = this.documentList.filter(doc => {
        console.log(`文档 ${doc.title} 状态: ${doc.status}, 匹配条件: ${currentFilter}, 是否匹配: ${doc.status === currentFilter}`)
        return doc.status === currentFilter
      })
      
      console.log('筛选后的结果:', filtered)
      return filtered
    },
    
    // 当前筛选条件的缓存键
    currentCacheKey() {
      const filterValue = this.filterTabs[this.currentTab].value
      return `document_review_list_cache_${filterValue}`
    }
  },
  
  mounted() {
    this.calculateScrollViewHeight()
    // 页面加载时强制刷新数据，不使用缓存
    this.loadDocumentList(true)
  },
  
  methods: {
    // 计算滚动容器高度
    calculateScrollViewHeight() {
      const systemInfo = uni.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 44
      const navbarHeight = 88 // 自定义导航栏高度
      const filterTabsHeight = 60 // 筛选标签栏高度
      const tabBarHeight = 100 // 底部标签栏高度
      
      this.scrollViewHeight = systemInfo.windowHeight - statusBarHeight - navbarHeight - filterTabsHeight - tabBarHeight
    },
    
    // 加载文档审核列表
    async loadDocumentList(isRefresh = false, isLoadMore = false) {
      console.log('loadDocumentList called:', { isRefresh, isLoadMore, loading: this.loading })
      
      // 防止重复请求
      if (this.loading && !isRefresh) {
        console.log('请求被阻止：正在加载中')
        return
      }
      
      try {
        // 设置加载状态
        if (isRefresh) {
          this.page = 1
          this.hasMore = true
        } else if (isLoadMore) {
          if (!this.hasMore) return
          this.loading = true
          this.page++
        } else {
          this.loading = true
        }
        
        // 检查缓存（仅在非刷新、非加载更多、且是首页时）
        if (!isRefresh && !isLoadMore && this.page === 1) {
          const cachedData = this.getCachedData()
          if (cachedData && cachedData.length > 0) {
            this.documentList = cachedData
            this.loading = false
            console.log('使用缓存数据加载文档列表')
            return
          }
        }
        
        // 准备API参数
        const currentFilter = this.filterTabs[this.currentTab].value
        const params = {
          page: this.page,
          size: this.pageSize,
          status: currentFilter === 'all' ? undefined : currentFilter
        }
        
        // 调用API获取数据
        console.log('发起API请求，参数:', params)
        const response = await this.callApiWithRetry(() => getDocumentReviewList(params))
        console.log('API响应:', response)
        
        // 处理API响应
        if (response && response.code === 200) {
          const newDocuments = this.formatDocumentList(response.data?.records || [])
          
          if (isRefresh || (!isLoadMore && this.page === 1)) {
            this.documentList = newDocuments
          } else {
            this.documentList = [...this.documentList, ...newDocuments]
          }
          
          // 更新分页状态
          const total = response.data?.total || 0
          const currentTotal = this.documentList.length
          this.hasMore = currentTotal < total
          
          // 缓存数据（仅首页数据）
          if (this.page === 1) {
            this.setCachedData(this.documentList)
          }
          
          console.log(`文档列表加载成功，当前页：${this.page}，总数：${currentTotal}/${total}，筛选条件：${currentFilter}`)
        } else {
          throw new Error(response?.message || '获取文档列表失败')
        }
        
        // 重置重试计数
        this.retryCount = 0
        
      } catch (error) {
        console.error('加载文档列表失败:', error)
        await this.handleLoadError(error, isRefresh, isLoadMore)
      } finally {
        // 重置加载状态
        this.loading = false
      }
    },
    
    // 企业级API调用重试机制
    async callApiWithRetry(apiCall, maxRetries = this.maxRetries) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await apiCall()
          return result
        } catch (error) {
          console.warn(`API调用失败，尝试 ${attempt + 1}/${maxRetries + 1}:`, error.message)
          
          if (attempt === maxRetries) {
            throw error
          }
          
          // 指数退避重试，添加随机抖动避免雷群效应
          const baseDelay = 1000 * Math.pow(2, attempt)
          const jitter = Math.random() * 1000
          const delay = Math.min(baseDelay + jitter, 8000)
          
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    
    // 格式化文档列表数据
    formatDocumentList(documents) {
      console.log('原始文档数据:', documents)
      const formattedDocs = documents.map(doc => ({
        id: doc.documentId || doc.id,
        title: doc.title || doc.documentTitle || '未知文书',
        createTime: this.formatDateTime(doc.createdAt || doc.createTime),
        status: this.mapApiStatus(doc.status || doc.reviewStatus),
        originalData: doc // 保存原始数据以备后用
      }))
      console.log('格式化后的文档数据:', formattedDocs)
      return formattedDocs
    },
    
    // API状态映射到前端状态
    mapApiStatus(apiStatus) {
      const statusMap = {
        'PENDING': 'pending_review',
        'APPROVED': 'approved',
        'REJECTED': 'rejected',
        'pending': 'pending_review',
        'pending_review': 'pending_review',
        'approved': 'approved',
        'rejected': 'rejected',
        '0': 'pending_review',
        '1': 'approved',
        '2': 'rejected'
      }
      return statusMap[apiStatus] || 'pending_review'
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '未知时间'
      
      try {
        const date = new Date(dateTime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        
        return `${year}年${month}月${day}日 ${hours}:${minutes}`
      } catch (error) {
        console.warn('日期格式化失败:', error)
        return String(dateTime)
      }
    },
    
    // 处理加载错误
    async handleLoadError(error, isRefresh, isLoadMore) {
      const errorMessage = this.getErrorMessage(error)
      
      // 尝试使用缓存数据
      if (!isRefresh && !isLoadMore && this.documentList.length === 0) {
        const cachedData = this.getCachedData(true) // 允许过期缓存
        if (cachedData && cachedData.length > 0) {
          this.documentList = cachedData
          uni.showToast({
            title: '网络异常，显示缓存数据',
            icon: 'none',
            duration: 2000
          })
          return
        }
      }
      
      // 显示错误提示
      uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
      })
      
      // 如果是加载更多失败，回退页码
      if (isLoadMore) {
        this.page = Math.max(1, this.page - 1)
      }
    },
    
    // 获取错误信息
    getErrorMessage(error) {
      if (!error) return '未知错误'
      
      // 网络错误
      if (error.message?.includes('Network') || error.message?.includes('timeout')) {
        return '网络连接异常，请检查网络设置'
      }
      
      // HTTP状态码错误
      if (error.statusCode) {
        const statusMessages = {
          400: '请求参数错误',
          401: '登录已过期，请重新登录',
          403: '没有访问权限',
          404: '接口不存在',
          500: '服务器内部错误',
          502: '服务器网关错误',
          503: '服务暂时不可用'
        }
        return statusMessages[error.statusCode] || `服务器错误 (${error.statusCode})`
      }
      
      // 业务逻辑错误
      if (error.message) {
        return error.message
      }
      
      return '加载失败，请稍后重试'
    },
    
    // 缓存管理
    getCachedData(allowExpired = false) {
      try {
        const cached = uni.getStorageSync(this.currentCacheKey)
        if (!cached) return null
        
        const { data, timestamp } = JSON.parse(cached)
        const now = Date.now()
        
        if (!allowExpired && (now - timestamp > this.cacheExpiry)) {
          uni.removeStorageSync(this.currentCacheKey)
          return null
        }
        
        return data
      } catch (error) {
        console.warn('读取缓存失败:', error)
        return null
      }
    },
    
    setCachedData(data) {
      try {
        const cacheData = {
          data,
          timestamp: Date.now()
        }
        uni.setStorageSync(this.currentCacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.warn('设置缓存失败:', error)
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 切换筛选标签
    async handleTabChange(index) {
      if (this.currentTab === index) return
      
      console.log(`切换筛选标签：${this.filterTabs[index].name}`)
      
      // 更新当前标签
      this.currentTab = index
      
      // 重置分页状态
      this.page = 1
      this.hasMore = true
      
      // 清空当前列表数据，显示加载状态
      this.documentList = []
      
      // 重新加载数据
      await this.loadDocumentList()
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      const statusMap = {
        'pending_review': 'status-pending',
        'approved': 'status-approved', 
        'rejected': 'status-rejected'
      }
      return statusMap[status] || 'status-pending'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending_review': '待审核',
        'approved': '已通过',
        'rejected': '已驳回'
      }
      return statusMap[status] || '待审核'
    },
    
    // 跳转到文书详情页
    goToDocumentDetail(document) {
      console.log('查看文书详情:', document)
      
      if (!document || !document.id) {
        uni.showToast({
          title: '文档信息异常',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      // 跳转到仲裁审核页面，传递文档ID
      uni.navigateTo({
        url: `/pages/lawyer/index/arbitration-review/index?documentId=${document.id}`
      })
    },
    
    // 加载更多
    async loadMore() {
      if (this.loading || !this.hasMore) return
      
      console.log('开始加载更多数据')
      await this.loadDocumentList(false, true)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  
  background-image: url('https://huaguang-admin.djjp.cn/static/bg10.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

// 状态栏占位
.status-bar {
  height: var(--status-bar-height);
  background: transparent;
}

// 自定义导航栏
.custom-navbar {
  // background: rgba(239, 247, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20rpx 30rpx;
  
  .navbar-content {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    
    .back-button {
      display: flex;
      align-items: center;
      gap: 10rpx;
      
      .back-text {
        font-size: 32rpx;
        color: #4A90E2;
      }
    }
    
    .page-title {
      font-size: 44rpx;
      font-weight: bold;
      color: #333333;
    }
  }
}

// 筛选标签栏
.filter-tabs {
  display: flex;
  padding: 40rpx 30rpx;
  gap: 20rpx;
  // background: rgba(239, 247, 255, 0.9);
  backdrop-filter: blur(10px);
  
  .tab-item {
    padding: 10rpx 16rpx;
    border-radius: 30rpx;
    transition: all 0.3s ease;
    background-color: #ecf1ff;
    
    &.tab-active {
      background-color: #4A90E2;
    }
    
    .tab-text {
      font-size: 28rpx;
      color: #4A90E2;
      
      &.tab-text-active {
        color: #FFFFFF;
      }
    }
  }
}

// 内容区域
.content-area {
  flex: 1;
  padding: 0 30rpx;
}

// 文书列表
.document-list {
  .document-card {
    background: #FFFFFF;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    .card-content {
      flex: 1;
      
      .document-title {
        display: block;
        font-size: 32rpx;
        color: #333333;
        font-weight: 500;
        margin-bottom: 10rpx;
      }
      
      .document-date {
        font-size: 24rpx;
        color: #888888;
      }
    }
    
    .card-right {
      display: flex;
      align-items: center;
      gap: 20rpx;
      
      .status-tag {
        padding: 8rpx 16rpx;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: fit-content;
        
        &.status-pending {
          background-color: #4A90E2;
        }
        
        &.status-approved {
          background-color: #2ECC71;
        }
        
        &.status-rejected {
          background-color: #E74C3C;
        }
        
        .status-text {
          font-size: 22rpx;
          color: #FFFFFF;
          white-space: nowrap;
        }
      }
      
      .arrow-icon {
        margin-left: 10rpx;
      }
    }
  }
}

// 加载提示
.loading-tip {
  text-align: center;
  padding: 40rpx 0;
  
  .loading-text {
    font-size: 28rpx;
    color: #888888;
  }
}

.no-more-tip {
  text-align: center;
  padding: 40rpx 0;
  
  .no-more-text {
    font-size: 28rpx;
    color: #CCCCCC;
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 120rpx 0;
  
  .empty-text {
    font-size: 32rpx;
    color: #CCCCCC;
  }
}
</style> 