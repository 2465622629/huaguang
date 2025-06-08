<template>
  <view class="consultation-records-page" :style="{ backgroundImage: `url(${backgroundImage})` }">
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
    >
      <!-- 咨询记录卡片列表 -->
      <view class="records-list">
        <view 
          v-for="(record, index) in consultationRecords" 
          :key="index"
          class="record-card"
        >
          <!-- 卡片内容 -->
          <view class="card-content">
            <!-- 标题 -->
            <text class="record-title">{{ record.title }}</text>
            
            <!-- 公司名称 -->
            <text class="company-name">{{ record.company }}</text>
            
            <!-- 时间戳 -->
            <text class="timestamp">{{ record.timestamp }}</text>
            
            <!-- 按钮行 -->
            <view class="button-row">
              <view 
                class="action-button primary-button"
                @click="enterCommunication(record)"
              >
                <text class="button-text primary-text">进入沟通</text>
              </view>
              
              <view 
                class="action-button secondary-button"
                @click="endConversation(record)"
              >
                <text class="button-text secondary-text">结束对话</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { staticBaseUrl } from '@/config/index.js'

export default {
  name: 'ConsultationRecords',
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      backgroundImage: staticBaseUrl + '/bg10.png',
      consultationRecords: [
        {
          id: 1,
          title: '法务助理',
          company: 'XX科技有限公司',
          timestamp: '2025年12月1日 20:22',
          status: 'active'
        },
        {
          id: 2,
          title: '法务助理',
          company: 'XX科技有限公司',
          timestamp: '2025年12月1日 20:22',
          status: 'active'
        },
        {
          id: 3,
          title: '法务助理',
          company: 'XX科技有限公司',
          timestamp: '2025年12月1日 20:22',
          status: 'active'
        },
        {
          id: 4,
          title: '法务助理',
          company: 'XX科技有限公司',
          timestamp: '2025年12月1日 20:22',
          status: 'active'
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
      // 计算滚动容器高度：屏幕高度 - 状态栏 - 导航栏(约44px)
      this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 进入沟通
    enterCommunication(record) {
      console.log('进入沟通:', record)
      // 这里可以跳转到聊天页面
      uni.navigateTo({
        url: '/pages/user/index/chat/index'
      })
    },
    
    // 结束对话
    endConversation(record) {
      console.log('结束对话:', record)
      // 这里可以显示确认弹窗或直接结束对话
      uni.showModal({
        title: '确认结束对话',
        content: '确定要结束与该律师的对话吗？',
        success: (res) => {
          if (res.confirm) {
            // 执行结束对话的逻辑
            console.log('用户确认结束对话')
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

/* 按钮点击效果 */
.action-button:active {
  opacity: 0.8;
  transform: scale(0.98);
}
</style>