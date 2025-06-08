<template>
  <view class="container" :style="backgroundStyle">
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
        @refresherrefresh="onRefresh"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
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

export default {
  data() {
    return {
      currentTab: 0,
      scrollViewHeight: 400,
      loading: false,
      refreshing: false,
      hasMore: true,
      page: 1,
      pageSize: 10,
      
      // 筛选标签
      filterTabs: [
        { name: '全部', value: 'all' },
        { name: '待审核', value: 'pending' },
        { name: '已通过', value: 'approved' },
        { name: '已驳回', value: 'rejected' }
      ],
      
      // 文书列表数据
      documentList: [
        {
          id: 1,
          title: '民事起诉状',
          createTime: '2025年5月6日 14:33',
          status: 'pending'
        },
        {
          id: 2,
          title: '民事起诉状',
          createTime: '2025年5月6日 14:33',
          status: 'approved'
        },
        {
          id: 3,
          title: '民事起诉状',
          createTime: '2025年5月6日 14:33',
          status: 'rejected'
        },
        {
          id: 4,
          title: '劳动合同纠纷起诉状',
          createTime: '2025年5月5日 16:20',
          status: 'pending'
        },
        {
          id: 5,
          title: '房屋买卖合同纠纷起诉状',
          createTime: '2025年5月5日 10:15',
          status: 'approved'
        },
        {
          id: 6,
          title: '交通事故赔偿起诉状',
          createTime: '2025年5月4日 09:30',
          status: 'rejected'
        }
      ]
    }
  },
  
  computed: {
    // 根据当前选中的标签过滤文书列表
    filteredDocuments() {
      const currentFilter = this.filterTabs[this.currentTab].value
      if (currentFilter === 'all') {
        return this.documentList
      }
      return this.documentList.filter(doc => doc.status === currentFilter)
    },
    backgroundStyle() {
      return {
        backgroundImage: `url('${staticBaseUrl}/bg10.png')`
      }
    }
  },
  
  mounted() {
    this.calculateScrollViewHeight()
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
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 切换筛选标签
    handleTabChange(index) {
      this.currentTab = index
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      const statusMap = {
        'pending': 'status-pending',
        'approved': 'status-approved', 
        'rejected': 'status-rejected'
      }
      return statusMap[status] || 'status-pending'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已驳回'
      }
      return statusMap[status] || '待审核'
    },
    
    // 跳转到文书详情页
    goToDocumentDetail(document) {
      console.log('查看文书详情:', document)
      // 跳转到仲裁审核页面
      uni.navigateTo({
        url: '/pages/lawyer/index/arbitration-review/index'
      })
    },
    
    // 下拉刷新
    onRefresh() {
      this.refreshing = true
      this.page = 1
      this.hasMore = true
      
      // 模拟刷新数据
      setTimeout(() => {
        this.refreshing = false
        console.log('刷新完成')
      }, 1000)
    },
    
    // 加载更多
    loadMore() {
      if (this.loading || !this.hasMore) return
      
      this.loading = true
      this.page++
      
      // 模拟加载更多数据
      setTimeout(() => {
        this.loading = false
        // 模拟没有更多数据
        if (this.page > 3) {
          this.hasMore = false
        }
        console.log('加载更多完成')
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

// 状态栏占位
.status-bar {
  height: var(--status-bar-height);
  background: transparent;
}

// 自定义导航栏
.custom-navbar {
  background: rgba(239, 247, 255, 0.9);
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
  background: rgba(239, 247, 255, 0.9);
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