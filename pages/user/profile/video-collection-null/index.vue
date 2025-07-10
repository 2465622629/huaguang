<template>
  <view class="assistance-page" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg10.png)' }">
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
      <!-- 动态图标 -->
      <image 
        class="bangfu-icon" 
        :src="emptyStateConfig.iconUrl || (config.staticBaseUrl + '/bangfu.png')" 
        mode="aspectFit"
      ></image>
      
      <!-- 动态标题文本 -->
      <text class="title-text">{{ emptyStateConfig.title || '暂无收藏视频' }}</text>
      
      <!-- 动态描述文本 -->
      <text class="description-text">{{ emptyStateConfig.description || '你暂时还没有收藏过视频，\n有需要可前往技能培训收藏视频。' }}</text>
      
      <!-- 引导按钮 -->
      <view 
        v-if="emptyStateConfig.showActionButton" 
        class="action-button" 
        @click="handleActionClick"
        :class="{ 'button-disabled': loading }"
      >
        <text class="button-text">{{ emptyStateConfig.actionButtonText || '去收藏视频' }}</text>
      </view>
      
      <!-- 推荐视频区域 -->
      <view v-if="recommendedVideos.length > 0" class="recommended-section">
        <text class="recommended-title">推荐视频</text>
        <scroll-view class="recommended-list" scroll-x="true" show-scrollbar="false">
          <view 
            v-for="video in recommendedVideos" 
            :key="video.id"
            class="video-item"
            @click="playVideo(video)"
          >
            <image :src="video.thumbnail" class="video-thumbnail" mode="aspectFill"></image>
            <text class="video-title">{{ video.title }}</text>
            <text class="video-duration">{{ formatDuration(video.duration) }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <uv-loading-icon mode="flower" size="60"></uv-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { getEmptyStateConfig, getRecommendedVideos } from '@/api/modules/personal-center.js'
import { getUserFavorites } from '@/api/modules/user.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      config: config,
      loading: false,
      
      // 空状态配置
      emptyStateConfig: {
        title: '暂无收藏视频',
        description: '你暂时还没有收藏过视频，\n有需要可前往技能培训收藏视频。',
        iconUrl: '',
        showActionButton: true,
        actionButtonText: '去收藏视频',
        actionButtonUrl: '/pages/user/index/skill-training/index'
      },
      
      // 推荐视频列表
      recommendedVideos: [],
      
      // 缓存管理
      cacheKey: 'video_collection_empty_state',
      cacheExpiry: 30 * 60 * 1000, // 30分钟缓存
      
      // 重试机制配置
      retryConfig: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000
      }
    }
  },
  
  async onLoad() {
    this.initPage()
    await this.loadEmptyStateData()
  },
  
  onShow() {
    // 检查用户是否已有收藏，如果有则返回上一页
    this.checkUserFavorites()
  },
  
  methods: {
    // 初始化页面
    initPage() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
    },
    
    /**
     * 加载空状态页面数据 - 企业级数据管理
     */
    async loadEmptyStateData() {
      if (this.loading) return
      
      this.loading = true
      
      try {
        console.log('[空状态页面] 开始加载空状态数据')
        
        // 尝试从缓存加载
        const cachedData = this.loadCachedData()
        if (cachedData) {
          this.emptyStateConfig = cachedData.config || this.emptyStateConfig
          this.recommendedVideos = cachedData.videos || []
          console.log('[空状态页面] 使用缓存数据')
        }
        
        // 并行加载最新数据
        const dataPromises = [
          this.loadEmptyStateConfig(),
          this.loadRecommendedVideos()
        ]
        
        const results = await Promise.allSettled(dataPromises)
        
        // 处理空状态配置结果
        if (results[0].status === 'fulfilled' && results[0].value) {
          this.emptyStateConfig = results[0].value
        } else {
          console.warn('[空状态页面] 空状态配置加载失败，使用默认配置')
        }
        
        // 处理推荐视频结果
        if (results[1].status === 'fulfilled' && results[1].value) {
          this.recommendedVideos = results[1].value
        } else {
          console.warn('[空状态页面] 推荐视频加载失败，使用空列表')
        }
        
        // 缓存最新数据
        this.cacheData({
          config: this.emptyStateConfig,
          videos: this.recommendedVideos
        })
        
        console.log('[空状态页面] 空状态数据加载完成')
        
      } catch (error) {
        console.error('[空状态页面] 加载空状态数据失败:', error)
        // 使用默认配置，不影响页面显示
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 加载空状态配置
     */
    async loadEmptyStateConfig() {
      return this.executeWithRetry(async () => {
        const response = await getEmptyStateConfig({
          type: 'video_collection',
          context: 'user_profile'
        })
        
        if (response?.data) {
          return {
            title: response.data.title || this.emptyStateConfig.title,
            description: response.data.description || this.emptyStateConfig.description,
            iconUrl: response.data.iconUrl || this.emptyStateConfig.iconUrl,
            showActionButton: response.data.showActionButton !== false,
            actionButtonText: response.data.actionButtonText || this.emptyStateConfig.actionButtonText,
            actionButtonUrl: response.data.actionButtonUrl || this.emptyStateConfig.actionButtonUrl
          }
        }
        
        return null
      })
    },
    
    /**
     * 加载推荐视频
     */
    async loadRecommendedVideos() {
      return this.executeWithRetry(async () => {
        const response = await getRecommendedVideos({
          type: 'skill_training',
          limit: 6,
          excludeCollected: true
        })
        
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map(video => ({
            id: video.id,
            title: video.title || video.name,
            thumbnail: video.thumbnail || video.cover,
            duration: video.duration || 0,
            url: video.url || video.playUrl
          }))
        }
        
        return []
      })
    },
    
    /**
     * 检查用户收藏状态
     */
    async checkUserFavorites() {
      try {
        const response = await getUserFavorites({
          type: 'video',
          limit: 1
        })
        
        // 如果用户已有收藏，返回收藏页面
        if (response?.data && response.data.length > 0) {
          console.log('[空状态页面] 用户已有收藏，返回收藏页面')
          uni.navigateBack({
            fail: () => {
              uni.redirectTo({
                url: '/pages/user/profile/video-collection/index'
              })
            }
          })
        }
      } catch (error) {
        console.error('[空状态页面] 检查用户收藏状态失败:', error)
        // 忽略错误，继续显示空状态页面
      }
    },
    
    /**
     * 指数退避重试机制
     */
    async executeWithRetry(apiCall, retryCount = 0) {
      try {
        return await apiCall()
      } catch (error) {
        if (retryCount < this.retryConfig.maxRetries) {
          const baseDelay = this.retryConfig.baseDelay * Math.pow(2, retryCount)
          const jitter = Math.random() * 0.3 * baseDelay
          const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelay)
          
          console.log(`[空状态页面] API调用失败，${delay.toFixed(0)}ms后进行第${retryCount + 1}次重试:`, error.message)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.executeWithRetry(apiCall, retryCount + 1)
        }
        throw error
      }
    },
    
    /**
     * 缓存管理 - 加载数据
     */
    loadCachedData() {
      try {
        const cached = uni.getStorageSync(this.cacheKey)
        if (cached && cached.timestamp) {
          const isExpired = Date.now() - cached.timestamp > this.cacheExpiry
          if (!isExpired) {
            return cached.data
          }
        }
      } catch (error) {
        console.error('[空状态页面] 加载缓存失败:', error)
      }
      return null
    },
    
    /**
     * 缓存管理 - 保存数据
     */
    cacheData(data) {
      try {
        uni.setStorageSync(this.cacheKey, {
          data,
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('[空状态页面] 保存缓存失败:', error)
      }
    },
    
    /**
     * 处理行动按钮点击
     */
    handleActionClick() {
      if (this.loading) return
      
      const url = this.emptyStateConfig.actionButtonUrl
      if (url) {
        uni.navigateTo({
          url: url,
          fail: () => {
            // 如果跳转失败，尝试其他方式
            console.warn('[空状态页面] 页面跳转失败，尝试其他方式')
            uni.switchTab({
              url: '/pages/user/index/index',
              fail: () => {
                uni.showToast({
                  title: '页面跳转失败',
                  icon: 'none'
                })
              }
            })
          }
        })
      }
    },
    
    /**
     * 播放推荐视频
     */
    playVideo(video) {
      if (!video.url) {
        uni.showToast({
          title: '视频暂无法播放',
          icon: 'none'
        })
        return
      }
      
      // 跳转到视频详情页或播放页
      uni.navigateTo({
        url: `/pages/user/index/skill-training/detail/index?courseId=${video.id}`,
        fail: () => {
          uni.showToast({
            title: '打开视频失败',
            icon: 'none'
          })
        }
      })
    },
    
    /**
     * 格式化视频时长
     */
    formatDuration(seconds) {
      if (!seconds || seconds <= 0) return '00:00'
      
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，返回个人中心
          uni.switchTab({
            url: '/pages/user/profile/index'
          })
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
  justify-content: flex-start;
  padding: 40rpx 60rpx;
  z-index: 10;
  position: relative;
}

.bangfu-icon {
  width: 400rpx;
  height: 400rpx;
  margin-bottom: -80rpx;
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
  margin-bottom: 60rpx;
}

.action-button {
  padding: 24rpx 80rpx;
  background-color: #007AFF;
  border-radius: 50rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
  transition: all 0.2s ease;
  margin-bottom: 80rpx;
  
  &:active:not(.button-disabled) {
    transform: scale(0.98);
    background-color: #0056CC;
    box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.2);
  }
  
  &.button-disabled {
    background-color: #CCCCCC;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  .button-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #FFFFFF;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    text-align: center;
  }
}

.recommended-section {
  width: 100%;
  
  .recommended-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    margin-bottom: 30rpx;
    text-align: center;
    display: block;
  }
  
  .recommended-list {
    width: 100%;
    white-space: nowrap;
    padding: 0 20rpx;
    
    .video-item {
      display: inline-block;
      width: 200rpx;
      margin-right: 30rpx;
      vertical-align: top;
      
      .video-thumbnail {
        width: 200rpx;
        height: 120rpx;
        border-radius: 12rpx;
        background-color: #F5F5F5;
      }
      
      .video-title {
        display: block;
        font-size: 24rpx;
        color: #333333;
        margin-top: 16rpx;
        margin-bottom: 8rpx;
        line-height: 1.3;
        max-height: 66rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        word-break: break-word;
      }
      
      .video-duration {
        display: block;
        font-size: 22rpx;
        color: #888888;
      }
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #666666;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  }
}
</style>
  