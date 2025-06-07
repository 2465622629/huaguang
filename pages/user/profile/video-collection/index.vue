<template>
  <view class="video-collection-page">
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
import { toggleFavorite } from '@/api/modules/skill-training.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      videoList: [],
      loading: false,
      error: null,
      isEmpty: false,
      page: 1,
      size: 10,
      hasMore: true,
      refreshing: false
    }
  },
  onLoad() {
    this.initPage()
    this.loadFavoriteVideos()
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
    
    // 加载收藏视频列表
    async loadFavoriteVideos(isRefresh = false) {
      if (this.loading) return
      
      try {
        this.loading = true
        this.error = null
        
        if (isRefresh) {
          this.page = 1
          this.hasMore = true
        }
        
        const params = {
          page: this.page,
          size: this.size
        }
        
        const response = await getMyFavoriteVideos(params)
        
        // 处理响应数据
        const videoData = response.records || []
        
        // 字段映射
        const mappedVideoData = videoData.map(item => ({
          id: item.videoId,
          favoriteId: item.favoriteId,
          title: item.videoTitle,
          cover: item.videoCover,
          duration: item.videoDuration,
          playCount: item.viewCount,
          isFavorite: true, // 收藏列表中的视频都是已收藏状态
          category: item.videoCategory,
          instructor: item.instructorName,
          favoriteTime: item.favoriteTime
        }))
        
        if (isRefresh) {
          this.videoList = mappedVideoData
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
        if (isRefresh && this.isEmpty) {
          this.navigateToEmptyPage()
          return
        }
        
      } catch (error) {
        console.error('获取收藏视频失败:', error)
        this.showError('获取收藏视频失败，请稍后重试')
        
        // 如果是首次加载失败，跳转到空状态页面
        if (isRefresh && this.videoList.length === 0) {
          setTimeout(() => {
            this.navigateToEmptyPage()
          }, 2000) // 延迟2秒显示错误提示后跳转
        }
      } finally {
        this.loading = false
        this.refreshing = false
      }
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
    
    // 切换收藏状态
    async toggleFavoriteStatus(index) {
      const video = this.videoList[index]
      
      try {
        // 乐观更新UI
        const originalStatus = video.isFavorite
        video.isFavorite = !originalStatus
        
        // 调用API更新收藏状态
        await toggleFavorite({
          itemId: video.id,
          itemType: 'video',
          action: originalStatus ? 'remove' : 'add'
        })
        
        uni.showToast({
          title: video.isFavorite ? '已收藏' : '已取消收藏',
          icon: 'none',
          duration: 1500
        })
        
        // 如果是取消收藏，从列表中移除该项
        if (!video.isFavorite) {
          this.videoList.splice(index, 1)
          this.isEmpty = this.videoList.length === 0
          
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
        uni.showToast({
          title: '操作失败，请稍后重试',
          icon: 'none',
          duration: 1500
        })
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
      uni.redirectTo({
        url: '/pages/user/profile/video-collection-null/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.video-collection-page {
  width: 100%;
  height: 100vh;
  background: url('http://localhost:3000/static/bg10.png') no-repeat center center / cover;
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