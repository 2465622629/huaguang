<template>
  <view class="lawyer-profile-page" :style="backgroundStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#4A90E2" size="18"></uv-icon>
          <text class="back-text">返回</text>
        </view>
      </view>
    </view>
    
    <!-- 滚动容器 -->
    <scroll-view 
      class="scroll-container" 
      scroll-y 
      :style="{ height: scrollHeight + 'px' }"
      enable-flex
    >
      <!-- 用户信息卡片 -->
      <view class="user-info-card">
        <!-- 头像占位符 -->
        <view class="avatar-placeholder"></view>
        
        <!-- 详细信息列表 -->
        <view class="info-list">
          <view class="info-row">
            <text class="info-label">姓名</text>
            <text class="info-content">李律师</text>
          </view>
          <view class="info-row">
            <text class="info-label">标签</text>
            <text class="info-content">劳动法专长</text>
          </view>
          <view class="info-row">
            <text class="info-label">执业经验</text>
            <text class="info-content">8年</text>
          </view>
          <view class="info-row">
            <text class="info-label">胜诉率</text>
            <text class="info-content">91%</text>
          </view>
        </view>
      </view>
      
      <!-- 详细说明卡片 -->
      <view class="detail-info-card">
        <view class="detail-row">
          <text class="detail-label">近期案例</text>
          <view class="detail-content">
            <text class="detail-text">案例时间（如 2025年4月5日）</text>
            <text class="detail-text">案例描述（如：成功协助当事人</text>
            <text class="detail-text">追回劳动仲裁款项5000元）</text>
          </view>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">服务优势</text>
          <view class="detail-content">
            <text class="detail-text">1.响应迅速，24小时内答复</text>
            <text class="detail-text">2.丰富的劳动仲裁、劳合同管理</text>
            <text class="detail-text">等服务经验"</text>
          </view>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">成功案例</text>
          <view class="detail-content">
            <text class="detail-text">协助中介企业追回薪资共计507</text>
            <text class="detail-text">万元</text>
          </view>
        </view>
        
        <view class="detail-row">
          <text class="detail-label">咨询范围</text>
          <view class="detail-content">
            <text class="detail-text">劳动合同起草与审查</text>
            <text class="detail-text">工伤/违法解雇维权</text>
            <text class="detail-text">社保、加班、赔偿、争议等</text>
          </view>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-button" @click="handleSave">
        <text class="button-text">点击保存</text>
      </view>
      
      <!-- 底部安全区域 -->
      <view class="bottom-safe-area"></view>
    </scroll-view>
    
    <!-- 律师底部导航栏 -->
    <lawyer-tabbar></lawyer-tabbar>
  </view>
</template>

<script>
import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'

export default {
  name: 'LawyerProfile',
  components: {
    LawyerTabbar
  },
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0
    }
  },
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url('${staticBaseUrl}/bg10.png')`
      }
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
      // 计算滚动区域高度：总高度 - 状态栏 - 导航栏 - 底部导航栏
      this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44 - 50
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，跳转到律师工作台首页
          uni.navigateTo({
            url: '/pages/lawyer/index/dashboard/index'
          })
        }
      })
    },
    
    // 处理保存操作
    handleSave() {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.lawyer-profile-page {
  width: 100%;
  height: 100vh;
  
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

// 状态栏占位
.status-bar {
  width: 100%;
  background: transparent;
}

// 自定义导航栏
.custom-navbar {
  height: 44px;
  background: transparent;
  
  .navbar-content {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 15px;
  }
  
  .back-button {
    display: flex;
    align-items: center;
    
    .back-text {
      font-size: 16px;
      color: #4A90E2;
      margin-left: 5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
  }
}

// 滚动容器
.scroll-container {
  width: 100%;
  box-sizing: border-box;
}

// 用户信息卡片
.user-info-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px 18px;
  margin: 15px 5%;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  
  .avatar-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #D8D8D8;
    margin: 0 auto 20px auto;
  }
  
  .info-list {
    padding: 0 10rpx;
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-size: 14px;
        color: #666666;
        width: 30%;
        text-align: left;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
      
      .info-content {
        font-size: 14px;
        color: #000;
        flex: 1;
        margin-left: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }
    }
  }
}

// 详细说明卡片
.detail-info-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px 18px;
  margin: 15px 5%;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  
  .detail-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 18px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .detail-label {
      font-size: 14px;
      color: #666666;
      width: 30%;
      text-align: left;
      margin-top: 2px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    
    .detail-content {
      flex: 1;
      margin-left: 12px;
      
      .detail-text {
        display: block;
        font-size: 14px;
        color: #000;
        line-height: 1.5;
        margin-bottom: 2px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// 操作按钮
.action-button {
  width: 60%;
  height: 44px;
  background-color: #5896FD;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 25px auto;
  
  .button-text {
    font-size: 16px;
    color: #FFFFFF;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
}

// 底部安全区域
.bottom-safe-area {
  height: 20px;
}
</style> 