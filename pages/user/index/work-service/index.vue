<template>
  <view class="work-service-page" :style="{ backgroundImage: `url('${config.staticBaseUrl}/bg3.png')` }">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载数据...</text>
    </view>

    <!-- 主内容区域 -->
    <view class="main-content">
      <!-- 我要找工作卡片 -->
      <view class="service-card job-search-card" @click="handleJobSearch">
        <image :src="config.staticBaseUrl + '/find_jobs.png'" mode="aspectFit" class="card-replacement-image"></image>
        
        
      </view>

      <!-- 我要招人卡片 -->
      <view class="service-card recruitment-card" @click="handleRecruitment">
        <image :src="config.staticBaseUrl + '/find_peop.png'" mode="aspectFit" class="card-replacement-image"></image>
        
        
      </view>
    </view>

    <!-- 底部导航栏 -->
    <UserTabbar />
  </view>
</template>

<script>
import UserTabbar from '@/components/tabbar/user-tabbar/user-tabbar.vue'
import config from '@/config/index.js'
import { getHotJobs } from '@/api/modules/home.js'
import { getEnterpriseList, getEnterpriseStatistics } from '@/api/modules/enterprise.js'

export default {
  name: 'WorkService',
  components: {
    UserTabbar
  },
  data() {
    return {
      config,
      loading: false,
      jobStats: {
        hotJobsCount: 0,
        totalJobs: 0
      },
      enterpriseStats: {
        activeEnterprises: 0,
        totalEnterprises: 0
      },
      cacheTimestamp: 0,
      retryCount: 0,
      maxRetries: 3,
      cacheExpiry: 10 * 60 * 1000 // 10分钟缓存
    }
  },
  onLoad() {
    console.log('工作服务页面加载')
    this.loadWorkServiceData()
  },
  onShow() {
    // 检查缓存是否过期
    if (this.shouldRefreshData()) {
      this.loadWorkServiceData()
    }
  },
  onPullDownRefresh() {
    this.loadWorkServiceData(true)
  },
  methods: {
    // 检查是否需要刷新数据
    shouldRefreshData() {
      if (!this.cacheTimestamp) return true
      return Date.now() - this.cacheTimestamp > this.cacheExpiry
    },

    // 加载工作服务数据
    async loadWorkServiceData(forceRefresh = false) {
      if (this.loading) return
      
      // 如果不是强制刷新且缓存未过期，则跳过
      if (!forceRefresh && !this.shouldRefreshData()) {
        return
      }

      this.loading = true
      this.retryCount = 0

      try {
        await this.fetchWorkServiceDataWithRetry()
        this.cacheTimestamp = Date.now()
        
        // 停止下拉刷新
        if (forceRefresh) {
          uni.stopPullDownRefresh()
        }
      } catch (error) {
        console.error('加载工作服务数据失败：', error)
        this.handleDataLoadError(error)
      } finally {
        this.loading = false
      }
    },

    // 带重试机制的数据获取
    async fetchWorkServiceDataWithRetry() {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          await this.fetchWorkServiceData()
          return // 成功则退出重试循环
        } catch (error) {
          console.warn(`数据获取尝试 ${attempt + 1} 失败:`, error)
          
          if (attempt === this.maxRetries) {
            throw error // 最后一次尝试失败，抛出错误
          }
          
          // 指数退避重试，添加随机抖动避免雷群效应
          const baseDelay = 1000 * Math.pow(2, attempt)
          const jitter = Math.random() * 1000
          const delay = Math.min(baseDelay + jitter, 8000)
          
          console.log(`等待 ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },

    // 获取工作服务数据
    async fetchWorkServiceData() {
      try {
        // 并行获取数据以提高性能
        const [jobsResult, enterpriseResult] = await Promise.allSettled([
          this.fetchJobStats(),
          this.fetchEnterpriseStats()
        ])

        // 处理职位统计结果
        if (jobsResult.status === 'fulfilled') {
          this.jobStats = jobsResult.value
        } else {
          console.warn('获取职位统计失败:', jobsResult.reason)
          this.useDefaultJobStats()
        }

        // 处理企业统计结果
        if (enterpriseResult.status === 'fulfilled') {
          this.enterpriseStats = enterpriseResult.value
        } else {
          console.warn('获取企业统计失败:', enterpriseResult.reason)
          this.useDefaultEnterpriseStats()
        }

        console.log('工作服务数据加载完成:', {
          jobStats: this.jobStats,
          enterpriseStats: this.enterpriseStats
        })

      } catch (error) {
        console.error('获取工作服务数据时发生错误:', error)
        throw error
      }
    },

    // 获取职位统计数据
    async fetchJobStats() {
      try {
        const response = await getHotJobs({ limit: 50 })
        const jobs = response.data || response || []
        
        return {
          hotJobsCount: jobs.length,
          totalJobs: jobs.length > 0 ? jobs.length * 2 : 0 // 估算总职位数
        }
      } catch (error) {
        console.error('获取职位统计失败:', error)
        throw error
      }
    },

    // 获取企业统计数据
    async fetchEnterpriseStats() {
      try {
        const response = await getEnterpriseList({ page: 1, size: 50 })
        const enterprises = response.data || response.list || response || []
        
        return {
          activeEnterprises: enterprises.length,
          totalEnterprises: enterprises.length > 0 ? enterprises.length * 1.5 : 0 // 估算总企业数
        }
      } catch (error) {
        console.error('获取企业统计失败:', error)
        throw error
      }
    },

    // 使用默认职位统计数据
    useDefaultJobStats() {
      this.jobStats = {
        hotJobsCount: 100,
        totalJobs: 500
      }
    },

    // 使用默认企业统计数据
    useDefaultEnterpriseStats() {
      this.enterpriseStats = {
        activeEnterprises: 50,
        totalEnterprises: 200
      }
    },

    // 处理数据加载错误
    handleDataLoadError(error) {
      let errorMessage = '数据加载失败'
      
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络'
      } else if (error.code === 'TIMEOUT') {
        errorMessage = '请求超时，请稍后重试'
      } else if (error.status === 401) {
        errorMessage = '登录已过期，请重新登录'
      } else if (error.status >= 500) {
        errorMessage = '服务器繁忙，请稍后重试'
      }

      uni.showToast({
        icon: 'none',
        title: errorMessage,
        duration: 2000
      })

      // 使用默认数据作为降级方案
      this.useDefaultJobStats()
      this.useDefaultEnterpriseStats()
    },

    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 处理找工作点击
    handleJobSearch() {
      // 跳转到招聘平台页面
      uni.navigateTo({
        url: '/pages/user/index/job-platform/index',
        fail: (err) => {
          console.error('跳转招聘平台失败：', err)
          uni.showToast({
            icon: 'none',
            title: '页面跳转失败'
          })
        }
      })
    },
    
    // 处理招聘点击
    handleRecruitment() {
      // 跳转到企业招聘页面
      uni.navigateTo({
        url: '/pages/enterprise/jobhunting/index',
        fail: (err) => {
          console.error('跳转企业招聘失败：', err)
          uni.showToast({
            icon: 'none',
            title: '页面跳转失败'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.work-service-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 加载状态 */
.loading-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007AFF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    font-size: 14px;
    color: #666;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding-top: var(--status-bar-height);
  
  .navbar-content {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    
    .navbar-left {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .navbar-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .navbar-right {
      width: 44px;
    }
  }
}

/* 主内容区域 */
.main-content {
  padding: 200rpx 32rpx ;
  display: flex;
  flex-direction: column;
  gap: 100rpx;
}

/* 服务卡片 */
.service-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  
  .card-replacement-image {
    width: 100%;
    height: 200px;
    display: block;
  }
  
  .stats-overlay {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    padding: 8px 12px;
    
    .stats-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .stats-number {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
        line-height: 1.2;
      }
      
      .stats-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 2px;
      }
    }
  }
  
  .card-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .card-text {
      flex: 1;
      
      .card-title {
        font-size: 32px;
        font-weight: bold;
        color: #333;
        line-height: 1.2;
        margin-bottom: 4px;
      }
      
      .card-subtitle {
        font-size: 32px;
        font-weight: bold;
        color: #333;
        line-height: 1.2;
      }
    }
    
    .card-image {
      width: 120px;
      height: 120px;
      
      image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

/* 卡片点击效果 */
.service-card:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

</style>