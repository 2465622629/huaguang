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
        <text class="title-text">当前缓存大小：58.3MB</text>
        
        <!-- 描述文本 -->
        <text class="description-text">清除缓存将删除App内图片、视频、页面记录等临时文件，不会影响您的账号、收藏、聊天记录等核心数据。</text>
        
        <!-- 清除缓存按钮 -->
        <view class="clear-cache-button" @click="clearCache">
          <text class="button-text">清除缓存</text>
        </view>
      </view>
      
      <!-- iOS Home Indicator -->
      <!-- <view class="home-indicator"></view> -->
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
      },
      
      // 清除缓存
      clearCache() {
        // 显示确认对话框
        uni.showModal({
          title: '确认清除缓存',
          content: '确定要清除缓存吗？此操作不可撤销。',
          confirmText: '确定',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 显示加载提示
              uni.showLoading({
                title: '正在清除缓存...'
              })
              
              // 模拟清除缓存过程
              setTimeout(() => {
                uni.hideLoading()
                uni.showToast({
                  title: '缓存清除成功',
                  icon: 'success',
                  duration: 2000
                })
                
                // 更新缓存大小显示（这里可以根据实际情况调整）
                // 实际项目中应该调用真实的清除缓存API
              }, 1500)
            }
          }
        })
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
  
  .clear-cache-button {
    margin-top: 60rpx;
    padding: 24rpx 120rpx;
    background-color: #2184ff;
    border-radius: 50rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
      background-color: #0056CC;
      box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.2);
    }
    
    .button-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
      text-align: center;
    }
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
  