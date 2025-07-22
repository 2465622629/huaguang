<template>
  <view class="job-hunting-page" :style="{ backgroundImage: 'url(' + config.staticBaseUrl + '/bg10.png)' }">
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
    <scroll-view
      class="scroll-container"
      :style="{ height: scrollHeight + 'px' }"
      scroll-y="true"
      @scrolltolower="onLoadMore"
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="content-wrapper">
        <!-- 加载状态 -->
        <view v-if="loading && jobApplications.length === 0" class="loading-state">
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 求职记录列表 -->
        <view v-else-if="jobApplications.length > 0" class="records-list">
          <view
            v-for="application in jobApplications"
            :key="application.id"
            class="record-item"
            @click="viewApplicationDetail(application)"
          >
            <!-- 主要信息区域 -->
            <view class="record-content">
              <view class="content-header">
                <text class="job-title">{{ application.jobTitle }}</text>
                <text class="job-salary">{{ formatSalary(application.salaryMin, application.salaryMax) }}</text>
              </view>
              <text class="company-name">{{ application.companyName }}</text>
              <text class="apply-time">{{ formatTime(application.createdAt) }}</text>
            </view>
            
            <!-- 底部按钮区域 -->
            <view class="record-actions">
              <view class="action-button primary" @click.stop="enterCommunication(application)">
                <text class="action-text">进入沟通</text>
              </view>
              <view class="action-button secondary" @click.stop="endConversation(application)">
                <text class="action-text">结束对话</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-else class="empty-state">
          <!-- 求职图标 -->
          <image class="bangfu-icon" :src="config.staticBaseUrl + '/bangfu.png'" mode="aspectFit"></image>
          
          <!-- 标题文本 -->
          <text class="title-text">暂无求职记录</text>
          
          <!-- 描述文本 -->
          <text class="description-text">你暂时还没有投递过简历，
有需要可前往就业页面提交简历。</text>
        </view>
        
        <!-- 加载更多提示 -->
        <view v-if="jobApplications.length > 0" class="load-more">
          <text v-if="loading" class="load-text">加载中...</text>
          <text v-else-if="!hasMore" class="load-text">没有更多了</text>
          <text v-else class="load-text">上拉加载更多</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import { getUserApplications } from '@/api/modules/enterprise.js'

export default {
  name: 'JobHuntingRecords',
  data() {
    return {
      statusBarHeight: 0,
      scrollHeight: 0,
      config: config,
      loading: false,
      refreshing: false,
      jobApplications: [],
      page: 1,
      pageSize: 20,
      hasMore: true
    }
  },

  onLoad() {
    this.initPage()
    this.loadJobApplications(true)
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshData()
  },

  onPullDownRefresh() {
    this.onRefresh().then(() => {
      uni.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    this.onLoadMore()
  },

  methods: {
    // 初始化页面
    initPage() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0
      // 计算滚动容器高度：屏幕高度 - 状态栏 - 导航栏(约44px)
      this.scrollHeight = systemInfo.windowHeight - this.statusBarHeight - 44
    },

    // 加载求职申请记录
    async loadJobApplications(isRefresh = false) {
      if (this.loading) return
      
      if (isRefresh) {
        this.page = 1
        this.hasMore = true
        this.jobApplications = []
      }
      
      this.loading = true
      
      try {
        const response = await getUserApplications({
          page: this.page,
          size: this.pageSize
        })
        
        // 修复数据解析路径：处理新的API响应格式 response.data.records
        const applicationData = response.data || response
        const applications = applicationData.records || applicationData.list || applicationData || []
        
        // 处理数据格式：正确映射嵌套的job对象字段
        const formattedApplications = applications.map(app => ({
          id: app.id || app.applicationId,
          jobId: app.jobId || app.job?.id,
          jobTitle: app.jobTitle || app.job?.title || app.title,
          companyName: app.companyName || app.job?.enterprise?.companyName || app.enterpriseName,
          location: app.location || app.job?.location || app.jobLocation,
          salaryMin: app.salaryMin || app.job?.salaryMin,
          salaryMax: app.salaryMax || app.job?.salaryMax,
          status: app.status || 'pending',
          createdAt: app.createdAt || app.appliedAt || app.applyTime,
          updatedAt: app.updatedAt,
          feedback: app.feedback,
          resumeUrl: app.resumeUrl,
          coverLetter: app.coverLetter
        }))
        
        if (isRefresh) {
          this.jobApplications = formattedApplications
        } else {
          this.jobApplications.push(...formattedApplications)
        }
        
        // 检查是否还有更多数据
        this.hasMore = applications.length >= this.pageSize
        
        if (this.hasMore) {
          this.page++
        }
        
        console.log('求职记录加载成功:', formattedApplications)
        
      } catch (error) {
        console.error('获取求职记录失败:', error)
        uni.showToast({
          title: '获取求职记录失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 进入沟通
    enterCommunication(application) {
      console.log('进入沟通:', application)
      
      // 跳转到聊天页面，传递企业相关信息
      if (application.companyName) {
        uni.navigateTo({
          url: `/pages/user/index/chat/index?consultationType=enterprise&companyName=${encodeURIComponent(application.companyName)}&jobTitle=${encodeURIComponent(application.jobTitle || '')}`
        })
      } else {
        uni.showToast({
          title: '企业信息不完整',
          icon: 'none'
        })
      }
    },

    // 结束对话
    endConversation(application) {
      console.log('结束对话:', application)
      
      uni.showModal({
        title: '确认结束对话',
        content: '确定要结束与该企业的对话吗？',
        success: (res) => {
          if (res.confirm) {
            // 这里可以调用API结束对话
            uni.showToast({
              title: '对话已结束',
              icon: 'success'
            })
          }
        }
      })
    },

    // 格式化薪资范围
    formatSalary(min, max) {
      if (!min && !max) return '薪资面议'
      if (min && max) {
        return `${min}-${max}K`
      }
      return min ? `${min}K起` : `${max}K以下`
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours().toString().padStart(2, '0')
      const minute = date.getMinutes().toString().padStart(2, '0')
      
      return `${year}年${month}月${day}日 ${hour}:${minute}`
    },

    // 刷新数据
    refreshData() {
      this.loadJobApplications(true)
    },

    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await this.loadJobApplications(true)
      } finally {
        this.refreshing = false
      }
    },

    // 上拉加载更多
    onLoadMore() {
      if (!this.loading && this.hasMore) {
        this.loadJobApplications(false)
      }
    },

    // 查看申请详情
    viewApplicationDetail(application) {
      console.log('查看申请详情:', application)
      
      // 跳转到职位详情页面
      if (application.jobId) {
        uni.navigateTo({
          url: `/pages/user/index/job-detail/index?id=${application.jobId}`
        })
      } else {
        uni.showToast({
          title: '职位详情暂不可用',
          icon: 'none'
        })
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>
  
<style lang="scss" scoped>
.job-hunting-page {
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

.scroll-container {
  flex: 1;
  z-index: 10;
  position: relative;
}

.content-wrapper {
  padding: 0 40rpx 40rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 120rpx 0;
}

.loading-text {
  color: #999;
  font-size: 28rpx;
}

/* 记录列表 */
.records-list {
  padding-top: 20rpx;
}

.record-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10rpx);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
}

.record-item:active {
  transform: scale(0.98);
  box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.12);
}

.record-content {
  flex: 1;
  margin-bottom: 20rpx;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.job-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16rpx;
}

.job-salary {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  flex-shrink: 0;
}

.company-name {
  font-size: 28rpx;
  color: #3D3D3D;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  display: block;
  margin-bottom: 8rpx;
}

.apply-time {
  font-size: 26rpx;
  color: #999;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  display: block;
}

.record-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 16rpx;
}

.action-button {
  flex: 1;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: #e8f0ff;
  color: #467BFF;
  border: none;
}

.action-button.primary:active {
  background: #d4e7ff;
  transform: scale(0.98);
}

.action-button.secondary {
  background: #eeeeee;
  color: #999;
  border: none;
}

.action-button.secondary:active {
  background: #e0e0e0;
  transform: scale(0.98);
}

.action-text {
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  line-height: 1.2;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  min-height: 800rpx;
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

/* 加载更多 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
}

.load-text {
  color: #999;
  font-size: 28rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}
</style>
  