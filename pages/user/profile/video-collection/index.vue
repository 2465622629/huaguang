<template>
  <view class="video-collection-page" :style="{ background: 'url(' + config.staticBaseUrl + '/bg10.png) no-repeat center center / cover' }">
    <!-- 自定义状态栏 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 导航栏 -->
    <view class="nav-section">
      <!-- 返回按钮 -->
      <view class="back-button" @click="goBack">
        <uv-icon name="arrow-left" color="#2979FF" size="32"></uv-icon>
        <text class="back-text">返回</text>
      </view>
    </view>
    
    <!-- 滚动容器 -->
    <scroll-view 
      class="scroll-container" 
      scroll-y="true" 
      :style="{ height: scrollHeight + 'px' }"
      enable-back-to-top="true"
      show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="handleRefresh"
    >
      <!-- 加载状态 -->
      <view v-if="loading && videoList.length === 0" class="loading-container">
        <uv-loading-icon mode="circle" color="#2979FF" size="50"></uv-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态页面 -->
      <view v-else-if="isEmpty && !loading" class="empty-container">
        <view class="empty-icon">📺</view>
        <text class="empty-text">暂无收藏视频</text>
        <text class="empty-tip">快去收藏喜欢的视频吧~</text>
      </view>
      
      <!-- 视频列表 -->
      <view v-else class="video-list">
        <view 
          v-for="(video, index) in videoList" 
          :key="video.id || index"
          class="video-card"
          @click="handleVideoClick(video)"
        >
          <!-- 左侧缩略图区域 -->
          <view class="thumbnail-container">
            <!-- 视频缩略图 -->
            <image 
              v-if="video.cover" 
              class="thumbnail-image" 
              :src="video.cover" 
              mode="aspectFill"
            ></image>
            <!-- 缩略图占位符 -->
            <view v-else class="thumbnail-placeholder"></view>
            
            <!-- 爱心收藏图标 -->
            <view class="favorite-icon" @click.stop="toggleFavoriteStatus(index)">
              <uv-icon 
                :name="video.isFavorite ? 'heart-fill' : 'heart'" 
                :color="video.isFavorite ? '#FF4D4F' : '#FF4D4F'"
                size="32"
              ></uv-icon>
            </view>
            
            <!-- 视频时长 -->
            <view class="duration">{{ video.duration }}</view>
          </view>
          
          <!-- 右侧文本信息区域 -->
          <view class="video-info">
            <!-- 视频标题 -->
            <text class="video-title">{{ video.title }}</text>
            
            <!-- 播放次数 -->
            <text class="play-count">{{ video.playCount }}次播放</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getMyFavoriteVideos } from '@/api/modules/personal-center.js'
import { toggleFavorite, getUserFavorites } from '@/api/modules/skill-training.js'
import { getCurrentUser } from '@/api/modules/user.js'
import config from '@/config/index.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      config: config,
      videoList: [],
      loading: false,
      error: null,
      isEmpty: false,
      page: 1,
      size: 10,
      hasMore: true,
      refreshing: false,
      retryCount: 0,
      maxRetries: 3,
      lastUpdateTime: null
    }
  },
  onLoad() {
    this.initPage()
    this.loadFavoriteVideos(true) // 初始加载时设置为刷新模式
  },
  methods: {
    // 初始化页面
    initPage() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      
      // 计算滚动容器高度：屏幕高度 - 状态栏 - 导航区域
      const navHeight = 80 // 导航区域高度，单位px
      this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - navHeight
    },
    
    // 加载收藏视频列表 - 企业级优化版本
    async loadFavoriteVideos(isRefresh = false) {
      if (this.loading) return
      
      try {
        this.loading = true
        this.error = null
        
        if (isRefresh) {
          this.page = 1
          this.hasMore = true
          this.retryCount = 0
        }
        
        const params = {
          page: this.page,
          size: this.size
        }
        
        // 使用智能重试机制获取数据
        const videoData = await this.getDataWithIntelligentRetry(params)
        
        // 统一数据格式化
        const mappedVideoData = this.formatVideoData(videoData)
        
        // 更新视频列表
        this.updateVideoList(mappedVideoData, isRefresh)
        
        // 重置重试计数
        this.retryCount = 0
        
        console.log('视频收藏列表加载完成，共', this.videoList.length, '条记录')
        
      } catch (error) {
        console.error('获取收藏视频失败:', error)
        await this.handleLoadError(error, isRefresh)
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    // 智能重试机制获取数据
    async getDataWithIntelligentRetry(params) {
      const cacheKey = `video_collection_${params.page}_${params.size}`
      
      // 多层数据保护策略
      return await this.getDataWithFallback(
        () => this.fetchVideoDataFromAPIs(params),
        cacheKey,
        [] // 默认空数组
      )
    },

    // 从多个API获取视频数据
    async fetchVideoDataFromAPIs(params) {
      const errors = []
      
      // 主要API
      try {
        console.log('尝试获取收藏视频 - 主要API:', params)
        const response = await getMyFavoriteVideos(params)
        const videoData = response.records || response.data || []
        console.log('主要API成功，获取到', videoData.length, '条记录')
        return videoData
      } catch (primaryError) {
        console.warn('主要API失败:', primaryError.message)
        errors.push({ api: 'primary', error: primaryError })
      }
      
      // 备用API 1: skill-training模块
      try {
        const backupParams = {
          itemType: 'video',
          page: params.page,
          size: params.size
        }
        const backupResponse = await getUserFavorites(backupParams)
        const videoData = backupResponse.records || backupResponse.data || []
        console.log('备用API 1成功，获取到', videoData.length, '条记录')
        return videoData
      } catch (backupError) {
        console.warn('备用API 1失败:', backupError.message)
        errors.push({ api: 'backup1', error: backupError })
      }
      
      // 备用API 2: 用户信息中的收藏数据
      try {
        const userResponse = await getCurrentUser()
        const userFavorites = userResponse.favoriteVideos || []
        // 模拟分页
        const startIndex = (params.page - 1) * params.size
        const videoData = userFavorites.slice(startIndex, startIndex + params.size)
        console.log('备用API 2成功，获取到', videoData.length, '条记录')
        return videoData
      } catch (finalError) {
        console.error('备用API 2失败:', finalError.message)
        errors.push({ api: 'backup2', error: finalError })
      }
      
      // 所有API都失败
      console.error('所有API都失败:', errors)
      throw new Error('无法获取收藏视频数据')
    },

    // 多层数据保护机制
    async getDataWithFallback(apiCall, cacheKey, defaultValue) {
      try {
        // 第一层：API数据（带智能重试）
        const apiData = await this.retryWithBackoff(apiCall, 3, 1000)
        this.cacheData(cacheKey, apiData)
        return apiData
      } catch (error) {
        console.warn('API调用失败，尝试使用缓存数据:', error)
        
        try {
          // 第二层：缓存数据
          const cachedData = this.getCachedData(cacheKey)
          if (cachedData && cachedData.length > 0) {
            console.log('使用缓存数据，共', cachedData.length, '条记录')
            return cachedData
          }
        } catch (cacheError) {
          console.warn('缓存数据获取失败:', cacheError)
        }
        
        // 第三层：默认值
        console.log('使用默认值')
        return defaultValue
      }
    },

    // 智能指数退避重试算法
    async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await fn()
        } catch (error) {
          if (attempt === maxRetries - 1) throw error
          
          // 指数退避 + 随机抖动，避免雷群效应
          const exponentialDelay = baseDelay * Math.pow(2, attempt)
          const randomJitter = Math.random() * 1000
          const delay = Math.min(exponentialDelay + randomJitter, 8000)
          
          console.log(`重试第 ${attempt + 1} 次，延迟 ${Math.round(delay)}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },

    // 缓存数据
    cacheData(key, data) {
      try {
        const cacheItem = {
          data: data,
          timestamp: Date.now(),
          expiry: 5 * 60 * 1000 // 5分钟过期
        }
        uni.setStorageSync(key, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('缓存数据失败:', error)
      }
    },

    // 获取缓存数据
    getCachedData(key) {
      try {
        const cacheStr = uni.getStorageSync(key)
        if (!cacheStr) return null
        
        const cacheItem = JSON.parse(cacheStr)
        const now = Date.now()
        
        // 检查是否过期
        if (now - cacheItem.timestamp > cacheItem.expiry) {
          uni.removeStorageSync(key)
          return null
        }
        
        return cacheItem.data
      } catch (error) {
        console.warn('获取缓存数据失败:', error)
        return null
      }
    },

    // 格式化视频数据
    formatVideoData(videoData) {
      return videoData.map(item => ({
        id: item.videoId || item.id || item.itemId,
        favoriteId: item.favoriteId || item.id,
        title: item.videoTitle || item.title || item.name || '未知标题',
        cover: item.videoCover || item.cover || item.thumbnail || '',
        duration: this.formatDuration(item.videoDuration || item.duration || '00:00'),
        playCount: this.formatPlayCount(item.viewCount || item.playCount || 0),
        isFavorite: true, // 收藏列表中的视频都是已收藏状态
        category: item.videoCategory || item.category || '其他',
        instructor: item.instructorName || item.instructor || '未知讲师',
        favoriteTime: item.favoriteTime || item.createTime || new Date().toISOString()
      }))
    },

    // 更新视频列表
    updateVideoList(mappedVideoData, isRefresh) {
      if (isRefresh) {
        this.videoList = mappedVideoData
        this.lastUpdateTime = new Date()
      } else {
        this.videoList.push(...mappedVideoData)
      }
      
      // 更新分页状态
      this.hasMore = mappedVideoData.length === this.size
      this.isEmpty = this.videoList.length === 0
      
      if (!isRefresh && mappedVideoData.length > 0) {
        this.page++
      }
      
      // 如果是首次加载且列表为空，跳转到空状态页面
      if (this.isEmpty && this.page === 1) {
        setTimeout(() => {
          this.navigateToEmptyPage()
        }, 500)
      }
    },

    // 增强错误处理
    async handleLoadError(error, isRefresh) {
      // 尝试使用缓存数据作为降级方案
      const cacheKey = `video_collection_${this.page}_${this.size}`
      const cachedData = this.getCachedData(cacheKey)
      
      if (cachedData && cachedData.length > 0) {
        console.log('使用缓存数据作为降级方案')
        const mappedVideoData = this.formatVideoData(cachedData)
        this.updateVideoList(mappedVideoData, isRefresh)
        
        uni.showToast({
          title: '网络异常，显示缓存数据',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      // 错误分类处理
      const errorMessage = this.classifyError(error)
      this.showError(errorMessage)
      
      // 如果加载失败且没有视频，延迟跳转到空状态页面
      if (this.videoList.length === 0) {
        setTimeout(() => {
          this.navigateToEmptyPage()
        }, 2000)
      }
    },

    // 错误分类
    classifyError(error) {
      if (!error) return '未知错误'
      
      const errorMsg = error.message || error.msg || error.toString()
      const errorCode = error.code || error.status
      
      // 网络相关错误
      if (errorCode === 'NETWORK_ERROR' || errorMsg.includes('网络')) {
        return '网络连接异常，请检查网络设置'
      }
      
      // 超时错误
      if (errorCode === 'TIMEOUT' || errorMsg.includes('timeout') || errorMsg.includes('超时')) {
        return '请求超时，请稍后重试'
      }
      
      // 权限相关错误
      if (errorCode === 401 || errorMsg.includes('401') || errorMsg.includes('未授权')) {
        return '登录已过期，请重新登录'
      }
      
      if (errorCode === 403 || errorMsg.includes('403') || errorMsg.includes('权限')) {
        return '访问权限不足'
      }
      
      // 资源不存在
      if (errorCode === 404 || errorMsg.includes('404')) {
        return '请求的资源不存在'
      }
      
      // 服务器错误
      if (errorCode >= 500 || errorMsg.includes('500') || errorMsg.includes('服务器')) {
        return '服务器内部错误，请稍后重试'
      }
      
      // 数据格式错误
      if (errorMsg.includes('格式') || errorMsg.includes('解析')) {
        return '数据格式异常，请稍后重试'
      }
      
      return '获取收藏视频失败，请稍后重试'
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 下拉刷新
    async handleRefresh() {
      this.refreshing = true
      await this.loadFavoriteVideos(true)
    },
    
    // 切换收藏状态 - 增强版本
    async toggleFavoriteStatus(index) {
      const video = this.videoList[index]
      
      try {
        // 乐观更新UI
        const originalStatus = video.isFavorite
        video.isFavorite = !originalStatus
        
        // 使用智能重试调用API
        await this.retryWithBackoff(async () => {
          await toggleFavorite({
            itemId: video.id,
            itemType: 'video',
            action: originalStatus ? 'remove' : 'add'
          })
        }, 2, 500) // 最多重试2次，基础延迟500ms
        
        // 操作成功反馈
        uni.showToast({
          title: video.isFavorite ? '已收藏' : '已取消收藏',
          icon: video.isFavorite ? 'success' : 'none',
          duration: 1500
        })
        
        // 如果是取消收藏，从列表中移除该项
        if (!video.isFavorite) {
          this.videoList.splice(index, 1)
          this.isEmpty = this.videoList.length === 0
          
          // 清除相关缓存
          this.clearRelatedCache()
          
          // 如果列表变为空，跳转到空状态页面
          if (this.isEmpty) {
            setTimeout(() => {
              this.navigateToEmptyPage()
            }, 1500) // 延迟1.5秒等待toast显示完成
          }
        }
        
      } catch (error) {
        console.error('收藏操作失败:', error)
        
        // 恢复原始状态
        video.isFavorite = !video.isFavorite
        
        // 错误分类处理
        const errorMessage = this.classifyError(error)
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        })
      }
    },

    // 清除相关缓存
    clearRelatedCache() {
      try {
        const cacheKeys = [
          `video_collection_${this.page}_${this.size}`,
          'user_favorites_cache',
          'video_collection_total_cache'
        ]
        
        cacheKeys.forEach(key => {
          uni.removeStorageSync(key)
        })
      } catch (error) {
        console.warn('清除缓存失败:', error)
      }
    },
    
    // 处理视频点击
    handleVideoClick(video) {
      console.log('点击视频:', video)
      // 这里可以跳转到视频播放页面
      // uni.navigateTo({ url: `/pages/video/play/index?id=${video.id}` })
    },
    
    // 统一错误处理
    showError(message) {
      this.error = message
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    },
    
    // 跳转到空状态页面
    navigateToEmptyPage() {
      console.log('跳转到空状态页面')
      uni.redirectTo({
        url: '/pages/user/profile/video-collection-null/index'
      })
    },
    
    // 格式化播放时长
    formatDuration(duration) {
      if (!duration) return '00:00'
      
      // 如果已经是格式化的时间字符串，直接返回
      if (typeof duration === 'string' && duration.includes(':')) {
        return duration
      }
      
      // 如果是秒数，转换为 mm:ss 格式
      if (typeof duration === 'number') {
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      
      return '00:00'
    },
    
    // 格式化播放次数
    formatPlayCount(count) {
      if (!count || count === 0) return '0'
      
      if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万`
      } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`
      }
      
      return count.toString()
    },
    
    // 检查数据是否需要刷新
    shouldRefreshData() {
      if (!this.lastUpdateTime) return true
      
      const now = new Date()
      const timeDiff = now - this.lastUpdateTime
      const fiveMinutes = 5 * 60 * 1000 // 5分钟
      
      return timeDiff > fiveMinutes
    }
  }
}
</script>

<style lang="scss" scoped>
.video-collection-page {
  width: 100%;
  height: 100vh;
  position: relative;
}

.status-bar {
  width: 100%;
  background: transparent;
}

.nav-section {
  padding: 55rpx 30rpx 40rpx 30rpx;
  
  .back-button {
    display: flex;
    align-items: center;
    
    .back-text {
      margin-left: 10rpx;
      font-size: 34rpx;
      color: #4A90E2;
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    }
  }
}

.scroll-container {
  width: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.video-list {
  padding-bottom: 40rpx;
}

.video-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin-bottom: 40rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
  }
}

.thumbnail-container {
  width: 160rpx;
  height: 120rpx;
  position: relative;
  margin-right: 40rpx;
  flex-shrink: 0;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  background-color: #d8d8d8;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background-color: #D8D8D8;
  border-radius: 16rpx;
}

.favorite-icon {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 24rpx;
  height: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.duration {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
  font-size: 20rpx;
  padding: 2rpx 6rpx;
  border-radius: 4rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.video-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.video-title {
  font-size: 34rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 16rpx;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.play-count {
  font-size: 25rpx;
  color: #888888;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666666;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 16rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.empty-tip {
  font-size: 26rpx;
  color: #999999;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}
</style>