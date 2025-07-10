<template>
  <view class="container" :style="backgroundStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 页面标题区域 -->
    <view class="header">
      <text class="title">咨询信息</text>
    </view>
    
    <!-- 标签筛选器区域 -->
    <view class="filter-section">
      <view class="tabs-container">
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
        </view>
      </view>
    </view>
    
    <!-- 内容列表区域 -->
    <view class="content-wrapper">
      <scroll-view 
        class="scroll-container" 
        scroll-y="true" 
        :style="{ height: scrollViewHeight + 'px' }"
        enable-back-to-top="true"
        show-scrollbar="false"
        @scrolltolower="loadMore"
      >
        <view class="consultation-list">
          <view 
            v-for="(item, index) in filteredConsultationList" 
            :key="index"
            class="consultation-card"
            @click="handleCardClick(item)"
          >
            <!-- 头像占位符 -->
            <view class="avatar-placeholder"></view>
            
            <!-- 文本信息区域 -->
            <view class="info-section">
              <view class="first-line">
                <text class="user-name">{{ item.userName }}</text>
                <text class="case-type">{{ item.caseType }}</text>
              </view>
              <view class="second-line">
                <text class="description">{{ item.description }}</text>
              </view>
            </view>
            
            <!-- 时间和操作按钮区域 -->
            <view class="action-section">
              <text class="time-stamp">{{ item.timeStamp }}</text>
              <view class="action-button" @click.stop="handleViewClick(item)">
                <text class="button-text">查看</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多提示 -->
        <view v-if="loading" class="loading-tip">
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 没有更多数据提示 -->
        <view v-if="!hasMore && filteredConsultationList.length > 0" class="no-more-tip">
          <text class="no-more-text">没有更多数据了</text>
        </view>
        
        <!-- 空状态 -->
        <view v-if="filteredConsultationList.length === 0 && !loading" class="empty-state">
          <text class="empty-text">暂无咨询信息</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 底部导航栏 -->
    <lawyer-tabbar></lawyer-tabbar>
  </view>
</template>

<script>
import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'
import { getUserConsultations, getConsultationDetail } from '@/api/modules/lawyer.js'

export default {
  components: {
    LawyerTabbar
  },
  data() {
    return {
      // 标签列表
      tabsList: [
        { name: '待回复' },
        { name: '咨询中' },
        { name: '已完成' }
      ],
      currentTab: 0,
      
      // 咨询信息列表
      consultationList: [
        {
          id: 1,
          userName: '李先生',
          caseType: '劳动纠纷',
          description: '公司拖欠工资三个月，当时...',
          timeStamp: '10分钟前',
          status: 0 // 0-待回复, 1-咨询中, 2-已完成
        },
        {
          id: 2,
          userName: '王女士',
          caseType: '合同纠纷',
          description: '租房合同违约问题，房东...',
          timeStamp: '30分钟前',
          status: 0
        },
        {
          id: 3,
          userName: '张先生',
          caseType: '交通事故',
          description: '发生交通事故，对方全责但...',
          timeStamp: '1小时前',
          status: 1
        },
        {
          id: 4,
          userName: '刘女士',
          caseType: '婚姻家庭',
          description: '离婚财产分割问题，需要...',
          timeStamp: '2小时前',
          status: 1
        },
        {
          id: 5,
          userName: '陈先生',
          caseType: '债权债务',
          description: '朋友借钱不还，有借条但...',
          timeStamp: '昨天',
          status: 2
        }
      ],
      
      // 滚动相关
      scrollViewHeight: 0,
      loading: false,
      hasMore: true
    }
  },
  
  computed: {
    // 根据当前标签筛选咨询列表
    filteredConsultationList() {
      return this.consultationList.filter(item => item.status === this.currentTab)
    },
    backgroundStyle() {
      return {
        backgroundImage: `url('${staticBaseUrl}/bg10.png')`
      }
    }
  },
  
  mounted() {
    this.calculateScrollHeight()
    this.loadConsultationData()
  },
  
  methods: {
    // 加载咨询数据
    async loadConsultationData() {
      try {
        this.loading = true
        
        const response = await getUserConsultations({
          page: 1,
          pageSize: 20
        })
        
        if (response && response.data) {
          // 转换API数据格式
          this.consultationList = response.data.map(item => ({
            id: item.id,
            userName: item.clientName || '匿名用户',
            caseType: item.category || '一般咨询',
            description: item.content ? item.content.substring(0, 30) + '...' : '暂无描述',
            timeStamp: this.formatTimeAgo(item.createdAt),
            status: this.mapConsultationStatus(item.status)
          }))
        }
      } catch (error) {
        console.error('加载咨询数据失败:', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },
    
    // 映射咨询状态
    mapConsultationStatus(apiStatus) {
      const statusMap = {
        'pending': 0,    // 待回复
        'ongoing': 1,    // 咨询中
        'completed': 2   // 已完成
      }
      return statusMap[apiStatus] || 0
    },
    
    // 格式化时间显示
    formatTimeAgo(dateString) {
      if (!dateString) return '刚刚'
      
      const now = new Date()
      const date = new Date(dateString)
      const diff = now - date
      
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return date.toLocaleDateString()
    },
    
    // 计算滚动区域高度
    calculateScrollHeight() {
      const systemInfo = uni.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 0
      const headerHeight = 60 // 页面标题高度
      const filterHeight = 50 // 筛选器高度
      const tabbarHeight = 55 // 底部导航栏高度
      
      this.scrollViewHeight = systemInfo.windowHeight - statusBarHeight - headerHeight - filterHeight - tabbarHeight
    },
    
    // 处理标签切换
    handleTabChange(index) {
      this.currentTab = index
    },
    
    // 处理卡片点击
    handleCardClick(item) {
      console.log('点击咨询卡片:', item)
      // 这里可以跳转到详情页面
    },
    
    // 处理查看按钮点击
    async handleViewClick(item) {
      try {
        console.log('点击查看按钮:', item)
        
        // 获取咨询详情
        const response = await getConsultationDetail(item.id)
        
        if (response) {
          // 跳转到咨询详情或聊天页面
          uni.navigateTo({
            url: `/pages/lawyer/chat/index?consultationId=${item.id}`
          })
        }
      } catch (error) {
        console.error('获取咨询详情失败:', error)
        uni.showToast({
          title: '获取详情失败',
          icon: 'none',
          duration: 2000
        })
      }
    },
    
    // 加载更多数据
    loadMore() {
      if (this.loading || !this.hasMore) return
      
      this.loading = true
      
      // 模拟加载更多数据
      setTimeout(() => {
        // 这里可以调用API加载更多数据
        this.loading = false
        // 如果没有更多数据，设置hasMore为false
        // this.hasMore = false
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #F8F8F8;
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

// 状态栏占位
.status-bar {
  height: var(--status-bar-height);
  background-color: #FFFFFF;
}

// 页面标题区域
.header {
  // background-color: #FFFFFF;
  padding: 10px 16px 15px;
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #333333;
  }
}

// 标签筛选器区域
.filter-section {
  // background-color: #FFFFFF;
  padding: 0 16px 10px;
  
  .tabs-container {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .tab-item {
    height: 34px;
    padding: 0 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.tab-active {
      background-color: #4A90E2;
    }
  }
  
  .tab-text {
    font-size: 15px;
    color: #888888;
    
    &.tab-text-active {
      color: #FFFFFF;
    }
  }
}

// 内容区域
.content-wrapper {
  flex: 1;
  // background: linear-gradient(to bottom, #F0F8FF 0%, #D0E8FF 100%);
  padding: 15px 12px 0;
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
  margin-bottom: 12px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-start;
  
  // 头像占位符
  .avatar-placeholder {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background-color: #D8D8D8;
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  // 文本信息区域
  .info-section {
    flex: 1;
    margin-right: 12px;
    
    .first-line {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      
      .user-name {
        font-size: 17px;
        font-weight: bold;
        color: #333333;
        margin-right: 10px;
      }
      
      .case-type {
        font-size: 15px;
        color: #666666;
      }
    }
    
    .second-line {
      .description {
        font-size: 14px;
        color: #888888;
        line-height: 1.4;
      }
    }
  }
  
  // 时间和操作按钮区域
  .action-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
    
    .time-stamp {
      font-size: 12px;
      color: #AAAAAA;
      margin-bottom: 4px;
    }
    
    .action-button {
      background-color: #4A90E2;
      border-radius: 6px;
      padding: 6px 12px;
      
      .button-text {
        font-size: 14px;
        color: #FFFFFF;
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
</style> 