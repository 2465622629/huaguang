<template>
    <view class="assistance-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg10.png')` }">
      <!-- 自定义状态栏 -->
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      
      <!-- 导航区域 -->
      <view class="nav-section">
        <!-- 返回按钮 -->
        <view class="back-button" @click="goBack">
          <uv-icon name="arrow-left" color="#007AFF" size="32"></uv-icon>
          <text class="back-text">返回</text>
        </view>
      </view>
      
      <!-- 主内容区域 -->
      <view class="main-content">
        <!-- 帮扶图标 -->
        <image class="bangfu-icon" :src="config.staticBaseUrl + '/bangfu.png'" mode="aspectFit"></image>
        
        <!-- 标题文本 -->
        <text class="title-text">暂无收藏视频</text>
        
        <!-- 描述文本 -->
        <text class="description-text">你暂时还没有收藏过视频，
  有需要可前往技能培训收藏视频。</text>
      </view>
      
      <!-- iOS Home Indicator -->
      <view class="home-indicator"></view>
    </view>
  </template>
  
  <script>
  import config from '@/config/index.js'
  
  export default {
    data() {
      return {
        statusBarHeight: 0,
        config: config
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
      },
      
      // 返回上一页
      goBack() {
        uni.navigateBack()
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .assistance-page {
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
    // 移除云朵状模糊斑块背景效果
  }
  
  .status-bar {
    width: 100%;
    background: transparent;
    z-index: 10;
    position: relative;
  }
  
  .nav-section {
    padding: 20rpx 40rpx;
    z-index: 10;
    position: relative;
    
    .back-button {
      display: flex;
      align-items: center;
      
      .back-text {
        margin-left: 10rpx;
        font-size: 32rpx;
        color: #007AFF;
        font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
        font-weight: 400;
      }
    }
  }
  
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 60rpx;
    z-index: 10;
    position: relative;
  }
  
  .bangfu-icon {
    width: 400rpx;
    height: 400rpx;
    margin-bottom: -100rpx;
  }
  
  .title-text {
    font-size: 44rpx;
    font-weight: 600;
    color: #333333;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    margin-bottom: 30rpx;
    text-align: center;
  }
  
  .description-text {
    font-size: 28rpx;
    font-weight: 400;
    color: #000;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    text-align: center;
    line-height: 1.5;
    max-width: 500rpx;
  }
  
  .home-indicator {
    position: absolute;
    bottom: 20rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 268rpx;
    height: 8rpx;
    background: #000000;
    border-radius: 4rpx;
    z-index: 10;
  }
  </style>
  