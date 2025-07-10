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
            <!-- 记录头部 -->
            <view class="record-header">
              <view class="record-info">
                <text class="job-title">{{ application.jobTitle }}</text>
                <text class="company-name">{{ application.companyName }}</text>
              </view>
              <view class="record-status" :class="getStatusClass(application.status)">
                <text class="status-text">{{ getStatusText(application.status) }}</text>
              </view>
            </view>
            
            <!-- 记录内容 -->
            <view class="record-content">
              <view class="job-info">
                <text class="salary-range">{{ formatSalary(application.salaryMin, application.salaryMax) }}</text>
                <text class="job-location">{{ application.location }}</text>
              </view>
              <view class="record-meta">
                <text class="apply-time">投递时间：{{ formatTime(application.createdAt) }}</text>
              </view>
            </view>
            
            <!-- 操作按钮 -->
            <view class="record-actions">
              <view class="action-btn" @click.stop="viewApplicationDetail(application)">
                <text class="action-text">查看详情</text>
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

    // 获取状态样式类
    getStatusClass(status) {
      switch (status) {
        case 'hired':
          return 'status-success'
        case 'pending':
          return 'status-pending'
        case 'reviewing':
          return 'status-reviewing'
        case 'interviewed':
          return 'status-interviewed'
        case 'rejected':
          return 'status-error'
        default:
          return 'status-default'
      }
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'pending': '待查看',
        'reviewing': '审核中',
        'interviewed': '已面试',
        'hired': '已录用',
        'rejected': '已拒绝'
      }
      return statusMap[status] || '未知状态'
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
      const now = new Date()
      const diff = now - date
      
      // 今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // 昨天
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.getDate() === yesterday.getDate()) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // 其他日期
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
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
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.record-info {
  flex: 1;
  margin-right: 24rpx;
}

.job-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.company-name {
  font-size: 28rpx;
  color: #666;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.record-status {
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  white-space: nowrap;
}

.status-pending {
  background: #FFF3E0;
  color: #F57C00;
}

.status-reviewing {
  background: #E3F2FD;
  color: #1976D2;
}

.status-interviewed {
  background: #F3E5F5;
  color: #7B1FA2;
}

.status-success {
  background: #E8F5E8;
  color: #2E7D32;
}

.status-error {
  background: #FFEBEE;
  color: #C62828;
}

.status-default {
  background: #F5F5F5;
  color: #757575;
}

.status-text {
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.record-content {
  margin-bottom: 24rpx;
}

.job-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.salary-range {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.job-location {
  font-size: 28rpx;
  color: #666;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.record-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.apply-time {
  font-size: 24rpx;
  color: #999;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 24rpx;
  border-top: 1rpx solid #F0F0F0;
}

.action-btn {
  padding: 12rpx 32rpx;
  background: #007AFF;
  border-radius: 32rpx;
}

.action-text {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
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
  