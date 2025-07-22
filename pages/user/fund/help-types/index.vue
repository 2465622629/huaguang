<template>
  <view class="help-types-page" :style="{ backgroundImage: 'url(' + backgroundImageUrl + ')' }">
    <!-- 绝对定位的帮扶图标 -->
    <view class="bangfu-icon">
      <uv-image :src="bangfuIconUrl"
                width="100%" height="100%" mode="aspectFit"></uv-image>
    </view>
    
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 页面头部区域 -->
    <view class="page-header">
      <!-- 返回导航 -->
      <view class="back-navigation" @click="goBack">
        <uv-icon name="arrow-left" color="#FFFFFF" size="18"></uv-icon>
        <text class="back-text">返回</text>
      </view>
      
      <!-- 主标题 -->
      <view class="main-title">青年帮扶基金 · 助力你的成长</view>
      
      <!-- 副标题 -->
      <view class="subtitle">无论你面临失业、债务、心理困扰，还是法律纠纷，这里都有专业支持。</view>
    </view>
    
    <!-- 内容卡片列表区域 -->
    <view class="content-area">
      <!-- 类型1图片 -->
      <view class="help-image" @click="handleCardClick('unemployment')">
        <uv-image :src="type1ImageUrl"
                  width="100%" height="100%" mode="aspectFill"></uv-image>
      </view>
      
      <!-- 类型2图片 -->
      <view class="help-image" @click="handleCardClick('debt')">
        <uv-image :src="type2ImageUrl"
                  width="100%" height="100%" mode="aspectFill"></uv-image>
      </view>
      
      <!-- 类型3图片 -->
      <view class="help-image" @click="handleCardClick('psychological')">
        <uv-image :src="type3ImageUrl"
                  width="100%" height="100%" mode="aspectFill"></uv-image>
      </view>
      
      <!-- 类型4图片 -->
      <view class="help-image" @click="handleCardClick('legal')">
        <uv-image :src="type4ImageUrl"
                  width="100%" height="100%" mode="aspectFill"></uv-image>
      </view>
    </view>
    
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  name: 'HelpTypesPage',
  data() {
    return {
      config: config
    }
  },
  computed: {
    // 帮扶图标路径
    bangfuIconUrl() {
      return `${this.config.staticBaseUrl}/icons/bangfu.png`
    },
    // 类型1图片路径
    type1ImageUrl() {
      return `${this.config.staticBaseUrl}/type1.png`
    },
    // 类型2图片路径
    type2ImageUrl() {
      return `${this.config.staticBaseUrl}/type2.png`
    },
    // 类型3图片路径
    type3ImageUrl() {
      return `${this.config.staticBaseUrl}/type3.png`
    },
    // 类型4图片路径
    type4ImageUrl() {
      return `${this.config.staticBaseUrl}/type4.png`
    },
    // 背景图片路径
    backgroundImageUrl() {
      return `${this.config.staticBaseUrl}/bg2.png`
    }
  },
  methods: {

    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/user/fund/index'
          })
        }
      })
    },

    // 处理卡片点击事件
    handleCardClick(type) {
      console.log('🎯 用户点击帮扶类型:', type)
      
      switch(type) {
        case 'unemployment':
          uni.navigateTo({
            url: '/pages/user/fund/unemployment-apply/index'
          })
          break
        case 'debt':
          uni.navigateTo({
            url: '/pages/user/fund/debt/index'
          })
          break
        case 'psychological':
          uni.navigateTo({
            url: '/pages/user/fund/psychological-apply/index'
          })
          break
        case 'legal':
          uni.navigateTo({
            url: '/pages/user/fund/legal/index'
          })
          break
        default:
          console.warn('⚠️ 未知的帮扶类型:', type)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.help-types-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  
  .status-bar {
    height: var(--status-bar-height);
    background: transparent;
  }
  
  .page-header {
    position: relative;
    // background: linear-gradient(135deg, #A0C8FF 0%, #80B3FF 100%);
    padding: 20rpx 30rpx 60rpx;
    overflow: hidden;
    text-align: center; // 文字水平居中
    
    .back-navigation {
      display: flex;
      align-items: center;
      margin-bottom: 40rpx;
      z-index: 10;
      position: relative;
      
      .back-text {
        color: #FFFFFF;
        font-size: 32rpx;
        margin-left: 8rpx;
      }
    }
    
    .main-title {
      color: #FFFFFF;
      font-size: 45rpx;
      font-weight: bold;
      line-height: 1.2;
      margin-bottom: 20rpx;
      z-index: 10;
      position: relative;
    }
    
    .subtitle {
      color: #FFFFFF;
      font-size: 28rpx;
      line-height: 1.5;
      opacity: 0.9;
      z-index: 10;
      position: relative;
    }
    

  }
  
  .content-area {
    margin-top: -60rpx; // 向上移动容器
    position: relative; // 添加相对定位
    .help-image {
      overflow: hidden;
      width: 85%; // 增大宽度
      max-width: 600rpx; // 增大最大宽度
      height: 360rpx; // 增大高度
      margin: 0 auto; // 水平居中
      
      &:first-child {
        margin-top: 10rpx; // 第一个元素保持原位
      }
      
      &:not(:first-child) {
        margin-top: -30rpx; // 其他元素向上偏移，产生重叠效果
      }
    }
  }
  
  .bangfu-icon {
    position: absolute;
    top: 80rpx;
    right: -50rpx; // 调整右侧位置，避免完全超出屏幕
    z-index: 0;
    width: 600rpx; // 减小宽度，适应屏幕
    height: 600rpx; // 减小高度，保持比例
  }
  
  .home-indicator {
    position: fixed;
    bottom: 8rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 268rpx;
    height: 8rpx;
    background-color: #000000;
    border-radius: 4rpx;
  }
  

}
</style>