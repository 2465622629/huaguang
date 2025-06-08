<template>
  <view class="container" :style="backgroundStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 页面标题区域 -->
    <view class="header">
      <text class="title">咨询信息</text>
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
      >
        <view class="consultation-list">
          <view 
            v-for="(item, index) in filteredConsultationList" 
            :key="index"
            class="consultation-card"
            @click="handleCardClick(item)"
          >
            <!-- 左侧头像占位符 -->
            <view class="avatar-placeholder"></view>
            
            <!-- 右侧信息区域 -->
            <view class="info-area">
              <!-- 第一行：用户名和案件类型 -->
              <view class="first-line">
                <text class="user-name">{{ item.userName }}</text>
                <text class="case-type">{{ item.caseType }}</text>
              </view>
              
              <!-- 第二行：描述文本 -->
              <view class="second-line">
                <text class="description">{{ item.description }}</text>
              </view>
            </view>
            
            <!-- 右上角时间戳和右下角查看按钮 -->
            <view class="action-area">
              <text class="time-stamp">{{ item.timeStamp }}</text>
              <view class="view-button" @click.stop="handleViewClick(item)">
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
    
    <!-- 底部标签栏 -->
    <lawyer-tabbar />
  </view>
</template>

<script>
import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'

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
          caseType: '就业压力',
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
          status: 0
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
  },
  
  methods: {
    // 计算滚动区域高度
    calculateScrollHeight() {
      const systemInfo = uni.getSystemInfoSync()
      const statusBarHeight = systemInfo.statusBarHeight || 0
      const headerHeight = 60 // 页面标题高度
      const tabHeight = 50 // 标签导航高度
      const tabbarHeight = 50 // uv-tabbar 的高度
      
      this.scrollViewHeight = systemInfo.windowHeight - statusBarHeight - headerHeight - tabHeight - tabbarHeight
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
    handleViewClick(item) {
      console.log('点击查看按钮:', item)
      // 这里可以跳转到咨询详情或聊天页面
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
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #333333;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
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
    background: transparent;
    
    &.tab-active {
      background-color: #4494FF;
    }
  }
  
  .tab-text {
    font-size: 15px;
    color: #3183FF;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    
    &.tab-text-active {
      color: #FFFFFF;
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
  
  // 左侧头像占位符
  .avatar-placeholder {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background-color: #D9D9D9;
    margin-right: 12px;
    flex-shrink: 0;
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
      
      .case-type {
        font-size: 16px;
        color: #333333;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
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
  }
  
  // 右上角时间戳和右下角查看按钮
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
    
    .view-button {
      background-color: #4494ff;
      border-radius: 5px;
      padding: 2px 6px;
      
      .button-text {
        font-size: 13px;
        color: #FFFFFF;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
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