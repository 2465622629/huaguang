<template>
  <view class="container" :style="backgroundStyle">
    <!-- 顶部插画区域 -->
    <view class="header-illustration">
      <uv-image :src="staticBaseUrl + '/lawyer_banner.png'" width="100%" height="500rpx"
        mode="aspectFill"></uv-image>
    </view>

    <!-- 内容区域 -->
    <view class="content-area">
      <!-- 咨询信息卡片 -->
      <view class="info-card">
        <view class="card-title">咨询信息</view>
        <scroll-view class="consultation-list" scroll-y="true" :style="{ height: consultationListHeight }">
          <view v-for="(item, index) in consultationList" :key="index" class="consultation-item">
            <text class="client-name">{{ item.clientName }}</text>
            <text class="consultation-summary">{{ item.summary }}</text>
            <text class="time-stamp">{{ item.timeAgo }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 法律文书审核列表卡片 -->
      <view class="document-card">
        <view class="card-title">法律文书审核列表</view>
        <view class="action-buttons">
          <view class="action-button" @click="handleViewDocuments">
            <view class="button-icon view-icon">
              				        <uv-icon :name="staticBaseUrl + '/icons/check.png'" color="#FFFFFF" size="64"></uv-icon>
            </view>
            <text class="button-text">查看</text>
          </view>
          <view class="action-button" @click="handleReviewDocuments">
            <view class="button-icon review-icon">
              				        <uv-icon :name="staticBaseUrl + '/icons/shenhe.png'" color="#FFFFFF" size="64"></uv-icon>
            </view>
            <text class="button-text">审核</text>
          </view>
          <view class="action-button" @click="handleDownloadDocuments">
            <view class="button-icon download-icon">
              				        <uv-icon :name="staticBaseUrl + '/icons/download.png'" color="#FFFFFF" size="64"></uv-icon>
            </view>
            <text class="button-text">下载</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 律师底部导航栏 -->
    <lawyer-tabbar></lawyer-tabbar>
  </view>
</template>

<script>
import LawyerTabbar from '@/components/tabbar/lawyer-tabbar/lawyer-tabbar.vue'
import { staticBaseUrl } from '@/config/index.js'
import { getUserConsultations } from '@/api/modules/lawyer.js'

export default {
  name: 'LawyerDashboard',
  components: {
    LawyerTabbar
  },
  data() {
    return {
      staticBaseUrl,
      consultationListHeight: '300rpx',
      loading: false,
      error: null,
      consultationList: []
    }
  },
  mounted() {
    this.fetchConsultationList()
  },
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url('${staticBaseUrl}/bg10.png')`
      }
    }
  },
  methods: {
    // 获取咨询信息列表
    async fetchConsultationList() {
      try {
        this.loading = true
        this.error = null
        
        const response = await getUserConsultations({
          page: 1,
          pageSize: 5,
          status: 'pending' // 获取待处理的咨询
        })
        
        if (response && response.data) {
          // 转换API数据格式为页面需要的格式
          this.consultationList = response.data.map(item => ({
            clientName: item.clientName || '匿名用户',
            summary: item.content ? item.content.substring(0, 20) + '...' : '暂无描述',
            timeAgo: this.formatTimeAgo(item.createdAt)
          }))
        }
      } catch (error) {
        console.error('获取咨询列表失败:', error)
        this.error = '获取咨询数据失败，请稍后重试'
        
        // 使用默认数据作为fallback
        this.consultationList = [
          {
            clientName: '李小明',
            summary: '公司拖欠工资三个月, 当...',
            timeAgo: '10分钟前'
          },
          {
            clientName: '王小红',
            summary: '房屋租赁合同纠纷, 需要...',
            timeAgo: '25分钟前'
          }
        ]
        
        uni.showToast({
          title: '获取咨询数据失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
    },
    
    // 格式化时间显示
    formatTimeAgo(dateString) {
      if (!dateString) return '刚刚'
      
      const now = new Date()
      const date = new Date(dateString)
      const diff = now - date
      
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      
      return date.toLocaleDateString()
    },
    
    handleViewDocuments() {
      uni.navigateTo({
        url: '/pages/lawyer/index/legal-document-list/index'
      })
    },
    handleReviewDocuments() {
      uni.navigateTo({
        url: '/pages/lawyer/index/document-review/index'
      })
    },
    handleDownloadDocuments() {
      uni.navigateTo({
        url: '/pages/lawyer/index/arbitration-download/index'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}

.header-illustration {
  width: 100%;
  height: 700rpx;
  position: absolute;
  z-index: 0;
  top: 10rpx;
  /* padding: 20rpx; */
}

.content-area {
  padding: 360rpx 30rpx;
  margin-top: 0rpx;
  z-index: 1;
  position: relative;
}

.info-card,
.document-card {
  background-color: #FFFFFF;
  border-radius: 30rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0px 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 30rpx;
}

.consultation-list {
  width: 100%;
}

.consultation-item {
  background-color: #F5F6F7;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.client-name {
  font-size: 28rpx;
  color: #555555;
  min-width: 120rpx;
}

.consultation-summary {
  font-size: 28rpx;
  color: #555555;
  flex: 1;
  margin: 0 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-stamp {
  font-size: 24rpx;
  color: #000;
  min-width: 120rpx;
  text-align: right;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.action-button {
  flex: 1;
  background-color: #f5f8ff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.button-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  background-color: #3B82F6;
}

.button-text {
  font-size: 26rpx;
  color: #333333;
  text-align: center;
}

/* 状态栏适配 */
.container {
  /* padding-top: var(--status-bar-height); */
}
</style>