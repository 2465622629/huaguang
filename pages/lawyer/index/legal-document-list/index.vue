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
      <scroll-view 
        class="document-list" 
        scroll-y="true" 
        :style="{ height: scrollViewHeight + 'px' }"
        enable-back-to-top="true"
        show-scrollbar="false"
      >
        <!-- 文书列表项 -->
        <view 
          v-for="(document, index) in documentList" 
          :key="document.id"
          class="document-card"
          @click="handleCardClick(document)"
        >
          <!-- 左侧内容 -->
          <view class="card-content">
            <text class="document-title">{{ document.title }}</text>
            <view class="document-date">
              <text class="date-text">{{ document.createTime }}</text>
              <text class="date-arrow">></text>
            </view>
          </view>
          
          <!-- 右侧箭头 -->
          <view class="card-right">
            <uv-icon name="arrow-right" :size="12" color="#CCCCCC" class="arrow-icon"></uv-icon>
          </view>
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

export default {
  components: {
    LawyerTabbar
  },
  data() {
    return {
      scrollViewHeight: 400, // 滚动容器高度，单位px
      statusBarHeight: 44, // 状态栏高度，单位px
      
      // 文书列表数据
      documentList: [
        {
          id: 1,
          title: '民事起诉状',
          createTime: '2025年5月6日 14:33'
        },
        {
          id: 2,
          title: '民事起诉状',
          createTime: '2025年5月6日 14:33'
        },
        {
          id: 3,
          title: '民事起诉状',
          createTime: '2025年5月6日 14:33'
        }
      ]
    }
  },
  
  mounted() {
    this.calculateScrollViewHeight()
  },
  
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url('${staticBaseUrl}/bg10.png')`
      }
    }
  },
  
  methods: {
    // 计算滚动容器高度
    calculateScrollViewHeight() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 44
      const navbarHeight = 88 // 自定义导航栏高度
      const tabBarHeight = 80 // uv-tabbar标签栏高度
      
      this.scrollViewHeight = systemInfo.windowHeight - this.statusBarHeight - navbarHeight - tabBarHeight
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 处理卡片点击
    handleCardClick(document) {
      console.log('点击了文书:', document.title)
      // 这里可以添加跳转到详情页的逻辑
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
  
  .document-list {
    width: 100%;
    
    .document-card {
      background: rgb(255, 255, 255);
      border-radius: 20rpx;
      margin-bottom: 35rpx;
      padding: 40rpx 40rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
      
      .card-content {
        flex: 1;
        
        .document-title {
          font-size: 28rpx;
          color: #000;
          font-weight: 400;
          line-height: 1.4;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .document-date {
          font-size: 24rpx;
          color: #888888;
          font-weight: 400;
          line-height: 1.2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          
          .date-text {
            color: #000;
          }
          
          .date-arrow {
            opacity: 1;
          }
        }
      }
      
      .card-right {
        margin-left: 20rpx;
        
        .arrow-icon {
          opacity: 0.6;
        }
      }
    }
  }
}
</style> 