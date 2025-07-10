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
      
      <!-- 加载状态指示器 -->
      <view v-if="loading" class="loading-indicator">
        <uv-loading-icon mode="circle" color="#FFFFFF" size="20"></uv-loading-icon>
        <text class="loading-text">正在加载帮扶类型...</text>
      </view>
    </view>
    
    <!-- 内容卡片列表区域 -->
    <view class="content-area">
      <!-- 错误状态 -->
      <view v-if="error && !loading" class="error-container">
        <view class="error-icon">⚠️</view>
        <view class="error-message">{{ error }}</view>
        <view class="retry-button" @click="retryLoad">
          <uv-icon name="refresh" color="#007AFF" size="16"></uv-icon>
          <text class="retry-text">重新加载</text>
        </view>
      </view>
      
      <!-- 正常内容 -->
      <template v-else>
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
      </template>
    </view>
    
  </view>
</template>

<script>
import config from '@/config/index.js'
import youthAssistanceApi from '@/api/modules/youth-assistance.js'

export default {
  name: 'HelpTypesPage',
  data() {
    return {
      config: config,
      // 帮扶类型数据
      helpTypes: [],
      // 加载状态
      loading: false,
      // 错误状态
      error: null,
      // 缓存管理
      cacheKey: 'help_types_data',
      cacheExpiry: 5 * 60 * 1000, // 5分钟缓存
      // 重试配置
      retryCount: 0,
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000
    }
  },
  async onLoad() {
    await this.loadHelpTypesData()
  },
  // 下拉刷新
  async onPullDownRefresh() {
    try {
      await this.loadHelpTypesData(true)
    } finally {
      uni.stopPullDownRefresh()
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
    /**
     * 企业级数据加载方法
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async loadHelpTypesData(forceRefresh = false) {
      try {
        this.loading = true
        this.error = null
        this.retryCount = 0

        // 尝试获取数据（带重试机制）
        const data = await this.fetchDataWithRetry(forceRefresh)
        
        if (data && data.serviceModules) {
          this.helpTypes = data.serviceModules
          this.cacheData(data)
          console.log('✅ 帮扶类型数据加载成功:', data)
        } else {
          throw new Error('服务器返回数据格式异常')
        }

      } catch (error) {
        console.error('❌ 帮扶类型数据加载失败:', error)
        this.error = error.message || '数据加载失败'
        
        // 尝试使用缓存数据
        const cachedData = this.getCachedData()
        if (cachedData && cachedData.serviceModules) {
          this.helpTypes = cachedData.serviceModules
          console.log('📦 使用缓存数据')
          uni.showToast({
            title: '已显示缓存数据',
            icon: 'none',
            duration: 2000
          })
        } else {
          // 使用默认数据
          this.useDefaultData()
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 带重试机制的数据获取
     * @param {boolean} forceRefresh - 是否强制刷新
     */
    async fetchDataWithRetry(forceRefresh = false) {
      // 检查缓存
      if (!forceRefresh) {
        const cachedData = this.getCachedData()
        if (cachedData) {
          console.log('📦 使用有效缓存数据')
          return cachedData
        }
      }

      // API请求重试逻辑
      while (this.retryCount < this.maxRetries) {
        try {
          const response = await youthAssistanceApi.getHomePage()
          
          if (response && response.code === 200) {
            return response.data
          } else {
            throw new Error(response?.message || 'API响应异常')
          }
        } catch (error) {
          this.retryCount++
          console.warn(`⚠️ API请求失败 (${this.retryCount}/${this.maxRetries}):`, error.message)
          
          if (this.retryCount >= this.maxRetries) {
            throw error
          }
          
          // 指数退避延迟（带随机抖动）
          const delay = Math.min(
            this.baseDelay * Math.pow(2, this.retryCount - 1),
            this.maxDelay
          )
          const jitter = Math.random() * 0.3 * delay // 30%随机抖动
          const finalDelay = delay + jitter
          
          console.log(`⏳ ${finalDelay.toFixed(0)}ms后重试...`)
          await new Promise(resolve => setTimeout(resolve, finalDelay))
        }
      }
    },

    /**
     * 缓存数据
     * @param {Object} data - 要缓存的数据
     */
    cacheData(data) {
      try {
        const cacheItem = {
          data: data,
          timestamp: Date.now(),
          expiry: Date.now() + this.cacheExpiry
        }
        uni.setStorageSync(this.cacheKey, JSON.stringify(cacheItem))
        console.log('💾 数据已缓存')
      } catch (error) {
        console.warn('⚠️ 缓存保存失败:', error)
      }
    },

    /**
     * 获取缓存数据
     * @returns {Object|null} 缓存的数据或null
     */
    getCachedData() {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        if (!cached) return null

        const cacheItem = JSON.parse(cached)
        const now = Date.now()

        // 检查缓存是否过期
        if (now > cacheItem.expiry) {
          console.log('⏰ 缓存已过期')
          uni.removeStorageSync(this.cacheKey)
          return null
        }

        console.log('✅ 缓存有效，剩余时间:', Math.round((cacheItem.expiry - now) / 1000), '秒')
        return cacheItem.data
      } catch (error) {
        console.warn('⚠️ 缓存读取失败:', error)
        return null
      }
    },

    /**
     * 使用默认数据
     */
    useDefaultData() {
      this.helpTypes = [
        {
          id: 'unemployment',
          title: '失业援助',
          description: '为失业青年提供经济援助和就业指导',
          icon: 'unemployment',
          available: true
        },
        {
          id: 'debt',
          title: '债务纾困',
          description: '帮助青年解决债务问题，重建信用',
          icon: 'debt',
          available: true
        },
        {
          id: 'psychological',
          title: '心理支持',
          description: '提供专业心理咨询和情感支持',
          icon: 'psychological',
          available: true
        },
        {
          id: 'legal',
          title: '法律护航',
          description: '提供法律咨询和援助服务',
          icon: 'legal',
          available: true
        }
      ]
      console.log('🔧 使用默认帮扶类型数据')
      uni.showToast({
        title: '网络异常，显示默认内容',
        icon: 'none',
        duration: 2000
      })
    },

    /**
     * 错误分类处理
     * @param {Error} error - 错误对象
     * @returns {string} 用户友好的错误信息
     */
    getErrorMessage(error) {
      const errorMessage = error.message || error.toString()
      
      if (errorMessage.includes('timeout')) {
        return '请求超时，请检查网络连接'
      } else if (errorMessage.includes('Network Error')) {
        return '网络连接异常，请稍后重试'
      } else if (errorMessage.includes('500')) {
        return '服务器繁忙，请稍后重试'
      } else if (errorMessage.includes('401')) {
        return '登录已过期，请重新登录'
      } else if (errorMessage.includes('403')) {
        return '权限不足，请联系管理员'
      } else {
        return '数据加载失败，请稍后重试'
      }
    },

    /**
     * 手动重试
     */
    async retryLoad() {
      await this.loadHelpTypesData(true)
    },

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

    handleCardClick(type) {
      // 记录用户行为
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
          // 跳转到心理支持页面
          uni.navigateTo({
            url: '/pages/user/fund/psychological-apply/index'
          })
          break
        case 'legal':
          // 跳转到法律护航申请页面
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
  
  // 加载状态样式
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20rpx;
    
    .loading-text {
      color: #FFFFFF;
      font-size: 28rpx;
      margin-left: 16rpx;
      opacity: 0.9;
    }
  }
  
  // 错误状态样式
  .error-container {
    background: rgba(255, 255, 255, 0.95);
    margin: 40rpx 30rpx;
    padding: 60rpx 40rpx;
    border-radius: 20rpx;
    text-align: center;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    
    .error-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
    }
    
    .error-message {
      color: #666666;
      font-size: 28rpx;
      line-height: 1.5;
      margin-bottom: 40rpx;
    }
    
    .retry-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #007AFF;
      color: #FFFFFF;
      padding: 20rpx 40rpx;
      border-radius: 50rpx;
      font-size: 28rpx;
      
      .retry-text {
        color: #FFFFFF;
        margin-left: 12rpx;
      }
      
      &:active {
        background: #0056CC;
        transform: scale(0.98);
      }
    }
  }
}
</style>