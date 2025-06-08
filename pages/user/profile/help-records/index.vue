<template>
  <view class="help-records-page" :style="{ background: `url('${config.staticBaseUrl}/bg10.png') no-repeat center center / cover` }">
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
      <!-- 帮扶记录列表 -->
      <view class="records-list">
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
                  :src="`${config.staticBaseUrl}/icons/${record.iconName}.png`"
                  mode="aspectFit"
                  style="width: 40rpx; height: 40rpx;"
                />
              </view>
            </view>
            
            <!-- 服务标题 -->
            <text class="service-title">{{ record.title }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      config: config,
      helpRecords: [
        {
          id: 1,
          type: 'credit-recovery',
          title: '信用逾期恢复',
          status: 'reviewing',
          statusText: '审核中',
          date: '2025年3月18日 14:22',
          iconName: 'huifu'
        },
        {
          id: 2,
          type: 'lawyer-consultation',
          title: '律师咨询',
          status: 'completed',
          statusText: '已完成',
          date: '2025年3月18日 14:22',
          iconName: 'legal2'
        },
        {
          id: 3,
          type: 'psychological-consultation',
          title: '心理咨询',
          status: 'completed',
          statusText: '已完成',
          date: '2025年3月18日 14:22',
          iconName: 'xinli'
        }
      ]
    }
  },
  onLoad() {
    this.initPage()
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
    
    // 处理记录点击
    handleRecordClick(record) {
      console.log('点击帮扶记录:', record)
      // 根据记录类型跳转到对应详情页面
      // uni.navigateTo({ url: `/pages/user/help-detail/index?id=${record.id}` })
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
</style> 